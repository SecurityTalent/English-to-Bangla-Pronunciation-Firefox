// Test script to verify backend endpoints
const http = require("http");

async function runTests() {
  console.log("Starting backend automated tests...");

  // Start the server in-process for testing
  const app = require("express")();
  // We can test against running server or run self-contained check
  const testWords = [
    { text: "Authentication", expected: "অথেন্টিকেশন" },
    { text: "Vulnerability", expected: "ভালনারেবিলিটি" },
    { text: "Prototype Pollution", expected: "প্রোটোটাইপ পলিউশন" }
  ];

  console.log("Checking test words against dictionary and cache...");
  const serverModule = require("./server.js");

  // Wait 500ms for server to bind
  await new Promise(r => setTimeout(r, 500));

  for (const { text, expected } of testWords) {
    const postData = JSON.stringify({ text });
    const options = {
      hostname: "localhost",
      port: 3000,
      path: "/api/pronunciation",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData)
      }
    };

    const result = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = "";
        res.on("data", chunk => body += chunk);
        res.on("end", () => {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, raw: body });
          }
        });
      });
      req.on("error", reject);
      req.write(postData);
      req.end();
    });

    console.log(`Word: "${text}" => Response:`, result.data);
    if (result.data.pronunciation !== expected) {
      console.error(`FAILED: expected "${expected}", got "${result.data.pronunciation}"`);
      process.exit(1);
    } else {
      console.log(`✅ PASSED: "${text}" -> "${result.data.pronunciation}" (source: ${result.data.source})`);
    }
  }

  console.log("\n🎉 All backend tests passed successfully!");
  process.exit(0);
}

runTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
