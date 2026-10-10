const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
// Render terminates TLS and forwards one trusted proxy hop to the service.
app.set("trust proxy", 1);
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const API_RATE_LIMIT_PER_MINUTE = Number.parseInt(process.env.API_RATE_LIMIT_PER_MINUTE, 10) || 60;
const API_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const apiRateLimits = new Map();
const rateLimitCleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [ip, bucket] of apiRateLimits) {
    if (now - bucket.windowStartedAt >= API_RATE_LIMIT_WINDOW_MS) apiRateLimits.delete(ip);
  }
}, Math.min(10000, API_RATE_LIMIT_WINDOW_MS));
rateLimitCleanupTimer.unref();

// In-memory cache for fast lookups and API quota savings
const pronunciationCache = new Map();
const meaningCache = new Map();

// Built-in offline dictionary for common tech words & demo words
const builtinDictionary = {
  "authentication": "অথেন্টিকেশন",
  "vulnerability": "ভালনারেবিলিটি",
  "prototype pollution": "প্রোটোটাইপ পলিউশন",
  "authorization": "অথোরাইজেশন",
  "configuration": "কনফিগারেশন",
  "application": "অ্যাপ্লিকেশন",
  "javascript": "জাভাস্ক্রিপ্ট",
  "extension": "এক্সটেনশন",
  "browser": "ব্রাউজার",
  "function": "ফাংশন",
  "variable": "ভ্যারিয়েবল",
  "database": "ডাটাবেজ",
  "security": "সিকিউরিটি",
  "encryption": "এনক্রিপশন",
  "decryption": "ডিক্রিপশন",
  "algorithm": "অ্যালগরিদম",
  "development": "ডেভেলপমেন্ট",
  "repository": "রিপোজিটরি",
  "performance": "পারফরম্যান্স",
  "optimization": "অপ্টিমাইজেশন",
  "asynchronous": "অ্যাসিঙ্ক্রোনাস",
  "synchronous": "সিঙ্ক্রোনাস",
  "environment": "এনভায়রনমেন্ট",
  "architecture": "আর্কিটেকচার",
  "infrastructure": "ইনফ্রাস্ট্রাকচার",
  "middleware": "মিডলওয়্যার",
  "framework": "ফ্রেমওয়ার্ক",
  "component": "কম্পোনেন্ট",
  "dependency": "ডিপেন্ডেন্সি",
  "interface": "ইন্টারফেস",
  "implementation": "ইমপ্লিমেন্টেশন",
  "documentation": "ডকুমেন্টেশন",
  "hello world": "হ্যালো ওয়ার্ল্ড",
  "hello": "হ্যালো",
  "world": "ওয়ার্ল্ড",
  "computer": "কম্পিউটার",
  "programming": "প্রোগ্রামিং",
  "software": "সফটওয়্যার",
  "hardware": "হার্ডওয়্যার",
  "network": "নেটওয়ার্ক",
  "connection": "কানেকশন",
  "download": "ডাউনলোড",
  "upload": "আপলোড",
  "server": "সার্ভার",
  "client": "ক্লায়েন্ট"
};

// Seed cache with built-in dictionary
for (const [key, value] of Object.entries(builtinDictionary)) {
  pronunciationCache.set(key.toLowerCase(), value);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: "8kb" }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Health check endpoint
app.get(["/", "/api/health"], (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(GEMINI_API_KEY && GEMINI_API_KEY.trim().length > 0),
    model: GEMINI_MODEL,
    cachedEntries: pronunciationCache.size + meaningCache.size
  });
});

function rateLimitApiRequests(req, res, next) {
  const now = Date.now();
  const clientIp = req.ip || req.socket.remoteAddress || "unknown";
  let bucket = apiRateLimits.get(clientIp);

  if (!bucket || now - bucket.windowStartedAt >= API_RATE_LIMIT_WINDOW_MS) {
    bucket = { windowStartedAt: now, count: 0 };
    apiRateLimits.set(clientIp, bucket);
  }

  if (bucket.count >= API_RATE_LIMIT_PER_MINUTE) {
    const retryAfterSeconds = Math.max(1, Math.ceil((API_RATE_LIMIT_WINDOW_MS - (now - bucket.windowStartedAt)) / 1000));
    res.set("Retry-After", String(retryAfterSeconds));
    return res.status(429).json({ error: "Too many lookup requests. Please wait a minute and try again." });
  }

  bucket.count += 1;
  res.set("RateLimit-Limit", String(API_RATE_LIMIT_PER_MINUTE));
  res.set("RateLimit-Remaining", String(API_RATE_LIMIT_PER_MINUTE - bucket.count));
  res.set("RateLimit-Reset", String(Math.ceil((bucket.windowStartedAt + API_RATE_LIMIT_WINDOW_MS) / 1000)));

  // Bound memory usage if many distinct IPs reach the public endpoint.
  if (apiRateLimits.size > 10000) {
    for (const [ip, entry] of apiRateLimits) {
      if (now - entry.windowStartedAt >= API_RATE_LIMIT_WINDOW_MS) apiRateLimits.delete(ip);
      if (apiRateLimits.size <= 10000) break;
    }
    while (apiRateLimits.size > 10000) {
      apiRateLimits.delete(apiRateLimits.keys().next().value);
    }
  }

  next();
}

/**
 * Call Gemini API with strict system prompt
 */
async function fetchGeminiPronunciation(text, mode = "pronunciation") {
  const systemPrompt = mode === "meaning"
    ? `Act as an English-to-Bengali dictionary assistant. Give the concise Bengali meaning of the supplied English word or phrase. Do not transliterate its pronunciation, explain, or include English text. For an ambiguous isolated word, give its most common Bengali meaning. Return only Bengali script.`
    : `Act as an English-to-Bengali phonetic pronunciation assistant.

Convert the given English word or phrase into Bengali script based ONLY on how it is pronounced.

Do NOT translate the meaning.

Do NOT explain anything.

Do NOT provide IPA.

Do NOT return English text.

Return ONLY the Bengali phonetic pronunciation.`;

  const modelsToTry = [
    GEMINI_MODEL,
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash",
    "gemini-flash-latest"
  ];
  // Remove duplicates while preserving order
  const uniqueModels = [...new Set(modelsToTry.filter(Boolean))];

  let lastError = null;
  // Bound the complete model fallback sequence; otherwise a stalled provider can
  // leave the extension loading for much longer than its request timeout.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  for (const model of uniqueModels) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
    
    const genConfig = {
      temperature: 0,
      maxOutputTokens: 150
    };

    // Models with configurable reasoning budget
    if (model.includes("3.6") || model.includes("3.7")) {
      genConfig.thinkingConfig = { thinkingBudget: 0 };
    }

    const requestBody = {
      systemInstruction: {
        parts: [
          {
            text: systemPrompt
          }
        ]
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: text
            }
          ]
        }
      ],
      generationConfig: genConfig
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY
        },
        signal: controller.signal,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[Gemini API] Model ${model} returned HTTP ${response.status}: ${errorText}`);
        lastError = new Error(`HTTP ${response.status}: ${errorText}`);
        
        // If 404 (model not found) or 503 (temporary capacity) or 429 (rate limit), try next model
        if (response.status === 404 || response.status === 503 || response.status === 429) {
          await new Promise(r => setTimeout(r, 400));
          continue;
        }
        break;
      }

      const data = await response.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const textPart = parts.find(p => p.text && p.text.trim().length > 0);
      const rawText = textPart?.text;

      if (rawText && typeof rawText === "string") {
        // Clean result: remove markdown, quotes, trailing punctuation
        const cleaned = rawText
          .replace(/```[\s\S]*?```/g, "")
          .replace(/["'`]/g, "")
          .replace(/\(.*?\)/g, "")
          .replace(/[.,:;।!?]+$/, "")
          .trim();

        if (cleaned.length > 0) {
          clearTimeout(timeoutId);
          return cleaned;
        }
      }

      throw new Error("Empty response from Gemini API");
    } catch (err) {
      lastError = err;
      console.warn(`[Gemini API] Failed with model ${model}:`, err.message);
      // Network failures affect every model; retrying aliases only adds latency.
      break;
    }
  }

  clearTimeout(timeoutId);
  throw lastError || new Error("Failed to contact Gemini API");
}

// POST /api/pronunciation and POST /api/meaning
app.post(["/api/pronunciation", "/api/meaning"], rateLimitApiRequests, async (req, res) => {
  let mode = req.path.endsWith("/meaning") ? "meaning" : "pronunciation";
  let resultField = mode;
  try {
    const resultCache = mode === "meaning" ? meaningCache : pronunciationCache;
    const rawText = req.body?.text;

    if (!rawText || typeof rawText !== "string") {
      return res.status(400).json({
        error: "Invalid request. 'text' field is required."
      });
    }

    const text = rawText.trim();

    if (text.length === 0) {
      return res.status(400).json({
        error: "Text cannot be empty."
      });
    }

    if (text.length > 500) {
      return res.status(400).json({
        error: "Text exceeds maximum limit of 500 characters."
      });
    }

    const cacheKey = text.toLowerCase();

    // 1. Check Cache
    if (resultCache.has(cacheKey)) {
      const cached = resultCache.get(cacheKey);
      return res.json({
        [resultField]: cached,
        source: "cache"
      });
    }

    // 2. Check if GEMINI_API_KEY is configured
    if (mode === "pronunciation" && (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === "" || GEMINI_API_KEY === "your_gemini_api_key_here")) {
      // Check if words exist in dictionary individually
      const words = cacheKey.split(/\s+/);
      const parts = [];
      let allFound = true;
      for (const w of words) {
        if (pronunciationCache.has(w)) {
          parts.push(pronunciationCache.get(w));
        } else {
          allFound = false;
          break;
        }
      }

      if (allFound && parts.length > 0) {
        const combined = parts.join(" ");
        pronunciationCache.set(cacheKey, combined);
        return res.json({
          pronunciation: combined,
          source: "offline-dictionary"
        });
      }

      return res.status(503).json({
        error: "Gemini API key is not configured. Please add GEMINI_API_KEY to backend/.env",
        pronunciation: null,
        needsApiKey: true
      });
    }

    // 3. Call Gemini API
    if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === "" || GEMINI_API_KEY === "your_gemini_api_key_here") {
      return res.status(503).json({
        error: "Gemini API key is not configured. Please add GEMINI_API_KEY to backend/.env",
        [resultField]: null,
        needsApiKey: true
      });
    }

    const result = await fetchGeminiPronunciation(text, mode);

    // Save in Cache (limit cache size to 10,000 items)
    if (resultCache.size > 10000) {
      // delete oldest entry
      const firstKey = resultCache.keys().next().value;
      resultCache.delete(firstKey);
    }
    resultCache.set(cacheKey, result);

    return res.json({
      [resultField]: result,
      source: "gemini"
    });
  } catch (error) {
    console.error("[Pronunciation API Error]:", error);
    return res.status(500).json({
      error: error.message || `Failed to generate ${mode}.`,
      [resultField]: null
    });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log("=================================================");
    console.log(`Bangla Phonetic Backend listening on port ${PORT}`);
    console.log("Pronunciation API: POST /api/pronunciation");
    console.log("Meaning API: POST /api/meaning");
    console.log("Health check: GET /api/health");
    console.log(`Gemini API key configured: ${Boolean(GEMINI_API_KEY && GEMINI_API_KEY.trim().length > 0)}`);
    console.log(`Preloaded dictionary words: ${pronunciationCache.size}`);
    console.log("=================================================");
  });
}

module.exports = app;
