
const statusBadge = document.getElementById("statusBadge");
const statusText = document.getElementById("statusText");
const backendDetails = document.getElementById("backendDetails");
const btnCheckStatus = document.getElementById("btnCheckStatus");
const btnClearCache = document.getElementById("btnClearCache");
const testInput = document.getElementById("testInput");
const btnTestPronounce = document.getElementById("btnTestPronounce");
const testResult = document.getElementById("testResult");
const backendUrlInput = document.getElementById("backendUrlInput");
const btnSaveSettings = document.getElementById("btnSaveSettings");
const savedMsg = document.getElementById("savedMsg");

// Load Settings
async function loadSettings() {
  chrome.runtime.sendMessage({ action: "GET_SETTINGS" }, (settings) => {
    if (settings && settings.backendUrl) {
      backendUrlInput.value = settings.backendUrl;
    }
  });
}

// Check Backend Status
function checkStatus() {
  statusBadge.className = "status-badge";
  statusText.textContent = "Checking...";
  backendDetails.textContent = "";

  chrome.runtime.sendMessage({ action: "CHECK_HEALTH" }, (response) => {
    if (response && response.online) {
      statusBadge.className = "status-badge online";
      statusText.textContent = "Online";
      const keyInfo = response.hasApiKey ? "Gemini Key: Active" : "Gemini Key: Not set (Using offline dictionary)";
      backendDetails.textContent = `${keyInfo} • Cached entries: ${response.cachedEntries || 0}`;
    } else {
      statusBadge.className = "status-badge offline";
      statusText.textContent = "Offline";
      backendDetails.textContent = "Cannot reach backend. Run `npm start` in the backend folder.";
    }
  });
}

// Save Settings
btnSaveSettings.addEventListener("click", () => {
  const newUrl = backendUrlInput.value.trim();
  if (!newUrl) return;

  chrome.runtime.sendMessage(
    { action: "SAVE_SETTINGS", settings: { backendUrl: newUrl } },
    (res) => {
      savedMsg.style.display = "block";
      setTimeout(() => {
        savedMsg.style.display = "none";
      }, 2500);
      checkStatus();
    }
  );
});

// Test Pronunciation
function doTest() {
  const text = testInput.value.trim();
  if (!text) return;

  testResult.textContent = "খোঁজা হচ্ছে...";
  testResult.style.color = "#94a3b8";

  chrome.runtime.sendMessage({ action: "GET_PRONUNCIATION", text }, (res) => {
    if (res && res.success && res.pronunciation) {
      testResult.textContent = res.pronunciation;
      testResult.style.color = "#38bdf8";
    } else {
      const err = (res && res.error) ? res.error : "Failed";
      testResult.textContent = `ত্রুটি: ${err}`;
      testResult.style.color = "#f87171";
    }
  });
}

btnTestPronounce.addEventListener("click", doTest);
testInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    doTest();
  }
});

// Clear Cache
btnClearCache.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "CLEAR_CACHE" }, (res) => {
    alert("Extension cache cleared successfully!");
    checkStatus();
  });
});

btnCheckStatus.addEventListener("click", checkStatus);

// Initial actions
document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  checkStatus();
});
