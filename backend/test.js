const assert = require("assert");

// Keep tests isolated from any locally running backend and make rate limiting deterministic.
process.env.API_RATE_LIMIT_PER_MINUTE = "5";
const app = require("./server.js");

async function runTests() {
  const server = app.listen(0, "127.0.0.1");

  try {
    await new Promise((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
    });

    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(healthResponse.status, 200, "health endpoint should return 200");
    assert.strictEqual((await healthResponse.json()).status, "ok", "health response should be ok");

    const rootResponse = await fetch(baseUrl);
    assert.strictEqual(rootResponse.status, 200, "root health check should return 200");

    const testWords = [
      { text: "Authentication", expected: "অথেন্টিকেশন" },
      { text: "Vulnerability", expected: "ভালনারেবিলিটি" },
      { text: "Prototype Pollution", expected: "প্রোটোটাইপ পলিউশন" }
    ];

    for (const { text, expected } of testWords) {
      const response = await fetch(`${baseUrl}/api/pronunciation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const data = await response.json();
      assert.strictEqual(response.status, 200, `${text} should return 200`);
      assert.strictEqual(data.pronunciation, expected, `${text} should match the built-in dictionary`);
      console.log(`PASSED: ${text} -> ${data.pronunciation}`);
    }

    for (let i = 0; i < 2; i++) {
      const response = await fetch(`${baseUrl}/api/pronunciation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Authentication" })
      });
      assert.strictEqual(response.status, 200, "requests within the limit should succeed");
    }

    const limitedResponse = await fetch(`${baseUrl}/api/pronunciation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Authentication" })
    });
    assert.strictEqual(limitedResponse.status, 429, "request over the limit should be throttled");
    assert.ok(limitedResponse.headers.get("retry-after"), "rate limit response should include Retry-After");

    console.log("PASSED: public lookup rate limit returns HTTP 429 with Retry-After");
    console.log("All backend checks passed.");
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

runTests().catch(err => {
  console.error("Backend checks failed:", err);
  process.exitCode = 1;
});
