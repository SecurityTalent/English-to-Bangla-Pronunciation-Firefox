// Firefox & Chrome compatibility layer
const extApi = typeof browser !== "undefined" ? browser : chrome;

const DEFAULT_SETTINGS = {
  backendUrl: "http://localhost:3000/api/pronunciation",
  debounceMs: 120,
  cacheEnabled: true
};

// Built-in offline dictionary directly inside extension for INSTANT (0ms) response
const BUILTIN_FAST_DICT = {
  "authentication": "অথেন্টিকেশন",
  "vulnerability": "ভালনারেবিলিটি",
  "prototype pollution": "প্রোটোটাইপ পলিউশন",
  "authorization": "অথোরাইজেশন",
  "configuration": "কনফিগারেশন",
  "application": "অ্যাপ্লিকেশন",
  "javascript": "জাভাস্ক্রিপ্ট",
  "extension": "এক্সটেনশন",
  "browser": "ব্রাউজার",
  "firefox": "ফায়ারফক্স",
  "function": "ফাংশন",
  "variable": "ভ্যারিয়েবল",
  "database": "ডাটাবেজ",
  "security": "সিকিউরিটি",
  "cybersecurity": "সাইবারসিকিউরিটি",
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
  "client": "ক্লায়েন্ট",
  "quantum computing": "কোয়ান্টাম কম্পিউটিং",
  "cybersecurity architecture": "সাইবারসিকিউরিটি আর্কিটেকচার",
  "machine learning": "মেশিন লার্নিং",
  "artificial intelligence": "আর্টিফিশিয়াল ইন্টেলিজেন্স",
  "cloud computing": "ক্লাউড কম্পিউটিং",
  "distributed systems": "ডিস্ট্রিবিউটেড সিস্টেমস",
  "microarchitecture": "মাইক্রোআর্কিটেকচার",
  "kubernetes": "কুবারনেটিস",
  "docker": "ডকার",
  "react": "রিঅ্যাক্ট",
  "python": "পাইথন",
  "github": "গিটহাব",
  "linux": "লিনাক্স",
  "windows": "উইন্ডোজ",
  "internet": "ইন্টারনেট",
  "google": "গুগল",
  "microsoft": "মাইক্রোসফট",
  "developer": "ডেভেলপার",
  "engineer": "ইঞ্জিনিয়ার",
  "technology": "টেকনোলজি",
  "information": "ইনফরমেশন",
  "communication": "কমিউনিকেশন",
  "analytics": "অ্যানালিটিক্স",
  "execution": "এক্সিকিউশন",
  "exception": "এক্সেপশন",
  "debugger": "ডিবাগার",
  "terminal": "টার্মিনাল",
  "console": "কনসোল",
  "runtime": "রানটাইম",
  "package": "প্যাকেজ",
  "compiler": "কম্পাইলার",
  "system": "সিস্টেম",
  "process": "প্রসেস",
  "thread": "থ্রেড",
  "memory": "মেমোরি",
  "storage": "স্টোরেজ",
  "cache": "ক্যাশ",
  "buffer": "বাফার",
  "stream": "স্ট্রিম",
  "request": "রিকোয়েস্ট",
  "response": "রেসপন্স",
  "payload": "পেলোড",
  "header": "হেডার",
  "cookie": "কুকি",
  "session": "সেশন",
  "token": "টোকেন",
  "login": "লগইন",
  "logout": "লগআউট",
  "password": "পাসওয়ার্ড",
  "username": "ইউজারনেম",
  "permission": "পারমিশন",
  "access": "অ্যাক্সেস",
  "protocol": "প্রোটোকল",
  "endpoint": "এন্ডপয়েন্ট",
  "domain": "ডোমেইন",
  "gateway": "গেটওয়ে",
  "router": "রাউটার",
  "switch": "সুইচ",
  "firewall": "ফায়ারওয়াল",
  "proxy": "প্রক্সি",
  "vpn": "ভিপিএন",
  "dns": "ডিএনএস",
  "ip address": "আইপি অ্যাড্রেস"
};

// In-memory cache for speed across tabs
const memoryCache = new Map();

// Seed memory cache with built-in dictionary
for (const [k, v] of Object.entries(BUILTIN_FAST_DICT)) {
  memoryCache.set(k.toLowerCase(), v);
}

// Helper to get storage values
async function getStoredSettings() {
  try {
    const result = await extApi.storage.local.get(["backendUrl", "debounceMs", "cacheEnabled"]);
    return {
      backendUrl: result.backendUrl || DEFAULT_SETTINGS.backendUrl,
      debounceMs: result.debounceMs || DEFAULT_SETTINGS.debounceMs,
      cacheEnabled: result.cacheEnabled !== undefined ? result.cacheEnabled : DEFAULT_SETTINGS.cacheEnabled
    };
  } catch (err) {
    console.error("[BPP Background] Error reading storage:", err);
    return DEFAULT_SETTINGS;
  }
}

// Fetch pronunciation from backend API or local cache
async function fetchPronunciation(text) {
  const settings = await getStoredSettings();
  const cacheKey = text.trim().toLowerCase();

  // 1. Instant check in memory cache / built-in dictionary (< 1ms)
  if (memoryCache.has(cacheKey)) {
    return {
      success: true,
      pronunciation: memoryCache.get(cacheKey),
      source: "instant-cache"
    };
  }

  // 2. Instant check for individual words in dictionary
  const words = cacheKey.split(/\s+/);
  if (words.length > 1) {
    const matched = [];
    let allFound = true;
    for (const w of words) {
      if (memoryCache.has(w)) {
        matched.push(memoryCache.get(w));
      } else {
        allFound = false;
        break;
      }
    }
    if (allFound) {
      const combined = matched.join(" ");
      memoryCache.set(cacheKey, combined);
      return {
        success: true,
        pronunciation: combined,
        source: "instant-dictionary"
      };
    }
  }

  // 3. Check persistent storage cache
  if (settings.cacheEnabled) {
    try {
      const storageKey = `bpp_cache_${cacheKey}`;
      const cached = await extApi.storage.local.get(storageKey);
      if (cached && cached[storageKey]) {
        memoryCache.set(cacheKey, cached[storageKey]);
        return {
          success: true,
          pronunciation: cached[storageKey],
          source: "extension-storage-cache"
        };
      }
    } catch (e) {
      // Storage miss or error, continue to fetch
    }
  }

  // 4. Request Backend API with 25-second timeout (prevents premature timeouts)
  const backendUrl = settings.backendUrl;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Server responded with HTTP ${response.status}`,
        needsApiKey: data.needsApiKey || false
      };
    }

    if (data && data.pronunciation) {
      // Cache the result
      if (settings.cacheEnabled) {
        memoryCache.set(cacheKey, data.pronunciation);
        try {
          const storageKey = `bpp_cache_${cacheKey}`;
          await extApi.storage.local.set({ [storageKey]: data.pronunciation });
        } catch (e) {
          // Non-critical cache write error
        }
      }

      return {
        success: true,
        pronunciation: data.pronunciation,
        source: data.source || "backend"
      };
    }

    return {
      success: false,
      error: "No pronunciation returned by server."
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.error("[BPP Background] Fetch error:", err);

    if (err.name === "AbortError") {
      return {
        success: false,
        error: "Backend request timed out (25s). Please check your internet connection."
      };
    }

    return {
      success: false,
      error: "Cannot connect to backend server. Ensure backend is running (npm start in backend folder).",
      unreachable: true
    };
  }
}

// Health check to backend
async function checkBackendHealth() {
  const settings = await getStoredSettings();
  const healthUrl = settings.backendUrl.replace(/\/api\/pronunciation\/?$/, "/api/health");

  try {
    const res = await fetch(healthUrl, { method: "GET" });
    if (res.ok) {
      const data = await res.json();
      return { online: true, ...data };
    }
    return { online: false, status: res.status };
  } catch (err) {
    return { online: false, error: err.message };
  }
}

// Handle runtime messages
extApi.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "GET_PRONUNCIATION") {
    fetchPronunciation(message.text)
      .then(sendResponse)
      .catch(err => {
        sendResponse({ success: false, error: err.message });
      });
    return true; // Keep message channel open for async response
  }

  if (message.action === "CHECK_HEALTH") {
    checkBackendHealth()
      .then(sendResponse)
      .catch(err => {
        sendResponse({ online: false, error: err.message });
      });
    return true;
  }

  if (message.action === "CLEAR_CACHE") {
    memoryCache.clear();
    // Re-seed with built-in dictionary
    for (const [k, v] of Object.entries(BUILTIN_FAST_DICT)) {
      memoryCache.set(k.toLowerCase(), v);
    }
    extApi.storage.local.clear().then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.action === "GET_SETTINGS") {
    getStoredSettings().then(sendResponse);
    return true;
  }

  if (message.action === "SAVE_SETTINGS") {
    extApi.storage.local.set(message.settings).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});

console.log("[BPP Background] Bangla Phonetic Pronunciation background service active.");
