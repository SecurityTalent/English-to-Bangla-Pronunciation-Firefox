(() => {
  // Prevent duplicate script execution
  if (window.__bpp_initialized) return;
  window.__bpp_initialized = true;

  // Local cache for instant (<1ms) response on repeat selections
  const localCache = new Map();

  // State management
  let isCtrlDown = false;
  let isAltDown = false;
  let isMouseDown = false;
  let ctrlWasPressedDuringSelection = false;
  let altWasPressedDuringSelection = false;
  let debounceTimer = null;
  let lastProcessedText = "";
  let currentRequestId = 0;
  let hostElement = null;
  let shadowRoot = null;
  let badgeElement = null;

  // Configuration
  const CONFIG = {
    debounceMs: 120,
    maxTextLength: 500,
    gapPx: 6
  };

  /**
   * Initialize Shadow DOM host for styling isolation
   */
  function initHost() {
    if (hostElement && document.body && document.body.contains(hostElement)) {
      return;
    }

    hostElement = document.getElementById("bpp-pronunciation-host");
    if (!hostElement) {
      hostElement = document.createElement("div");
      hostElement.id = "bpp-pronunciation-host";
      (document.body || document.documentElement).appendChild(hostElement);
      shadowRoot = hostElement.attachShadow({ mode: "open" });
      injectShadowStyles();
    } else {
      shadowRoot = hostElement.shadowRoot;
    }
  }

  /**
   * Inject CSS into Shadow DOM
   */
  function injectShadowStyles() {
    if (!shadowRoot) return;

    const style = document.createElement("style");
    style.textContent = `
      :host {
        all: initial;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2147483647;
        pointer-events: none;
      }

      .bpp-badge-wrapper {
        position: absolute;
        pointer-events: auto;
        display: inline-flex;
        flex-direction: column;
        align-items: flex-start;
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Kalpurush", "SolaimanLipi", "Nirmala UI", sans-serif;
        animation: bpp-appear 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        transform-origin: top left;
        user-select: none;
      }

      .bpp-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #0f172a;
        color: #f8fafc;
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 6px;
        padding: 4px 10px;
        font-size: 13.5px;
        font-weight: 500;
        line-height: 1.4;
        letter-spacing: 0.2px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35), 0 1px 3px rgba(0, 0, 0, 0.2);
        white-space: nowrap;
        max-width: 90vw;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .bpp-arrow-up {
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-bottom: 5px solid #0f172a;
        margin-left: 10px;
        margin-bottom: -1px;
      }

      .bpp-arrow-down {
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 5px solid #0f172a;
        margin-left: 10px;
        margin-top: -1px;
      }

      .bpp-text {
        color: #38bdf8;
        font-weight: 600;
      }

      .bpp-loading-dots {
        display: inline-flex;
        gap: 3px;
        align-items: center;
        padding: 2px 4px;
      }

      .bpp-dot {
        width: 5px;
        height: 5px;
        background: #94a3b8;
        border-radius: 50%;
        animation: bpp-pulse 1s infinite alternate;
      }

      .bpp-dot:nth-child(2) {
        animation-delay: 0.2s;
      }

      .bpp-dot:nth-child(3) {
        animation-delay: 0.4s;
      }

      .bpp-warning {
        color: #fcd34d;
        font-size: 12px;
      }

      @keyframes bpp-appear {
        from {
          opacity: 0;
          transform: translateY(2px) scale(0.97);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes bpp-pulse {
        0% { opacity: 0.3; transform: scale(0.8); }
        100% { opacity: 1; transform: scale(1.1); }
      }
    `;
    shadowRoot.appendChild(style);
  }

  /**
   * Remove any existing pronunciation badge
   */
  function removeBadge() {
    // Invalidate an in-flight response so it cannot bring back a dismissed badge.
    currentRequestId++;
    if (badgeElement && badgeElement.parentNode) {
      badgeElement.parentNode.removeChild(badgeElement);
    }
    badgeElement = null;
    lastProcessedText = "";
  }

  function sendRuntimeMessage(runtimeApi, message, callback, attempt = 0) {
    try {
      runtimeApi.sendMessage(message, (response) => {
        const errorMessage = runtimeApi.lastError?.message;
        if (errorMessage && attempt === 0) {
          setTimeout(() => sendRuntimeMessage(runtimeApi, message, callback, 1), 150);
          return;
        }
        callback(response, errorMessage || "");
      });
    } catch (err) {
      if (attempt === 0) {
        setTimeout(() => sendRuntimeMessage(runtimeApi, message, callback, 1), 150);
        return;
      }
      callback(undefined, err.message || "Unknown extension messaging error");
    }
  }

  /**
   * Calculate position of selected text in page coordinates
   */
  function getSelectionRect() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return null;
    }

    const range = selection.getRangeAt(0);
    let rect = range.getBoundingClientRect();

    // In some edge cases (e.g. multi-line selection), getBoundingClientRect might return empty
    if (rect.width === 0 && rect.height === 0) {
      const rects = range.getClientRects();
      if (rects.length > 0) {
        rect = rects[rects.length - 1]; // Use last line of selection
      } else {
        return null;
      }
    }

    return rect;
  }

  /**
   * Create safe DOM node for badge contents without innerHTML
   */
  function createBadgeContent(type, message) {
    if (type === "loading") {
      const dots = document.createElement("span");
      dots.className = "bpp-loading-dots";
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement("span");
        dot.className = "bpp-dot";
        dots.appendChild(dot);
      }
      return dots;
    }

    if (type === "text") {
      const textSpan = document.createElement("span");
      textSpan.className = "bpp-text";
      textSpan.textContent = message;
      return textSpan;
    }

    const warnSpan = document.createElement("span");
    warnSpan.className = "bpp-warning";
    warnSpan.textContent = message;
    return warnSpan;
  }

  /**
   * Render or update the phonetic pronunciation badge
   */
  function showBadge(rect, contentType, message, isAbove = false) {
    initHost();
    if (!shadowRoot) return;

    if (!badgeElement) {
      badgeElement = document.createElement("div");
      badgeElement.className = "bpp-badge-wrapper";
      shadowRoot.appendChild(badgeElement);
    }

    const scrollX = window.scrollX || window.pageXOffset || 0;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    const arrow = document.createElement("div");
    arrow.className = isAbove ? "bpp-arrow-down" : "bpp-arrow-up";

    const badge = document.createElement("div");
    badge.className = "bpp-badge";
    badge.appendChild(createBadgeContent(contentType, message));

    badgeElement.replaceChildren();
    if (isAbove) {
      badgeElement.appendChild(badge);
      badgeElement.appendChild(arrow);
    } else {
      badgeElement.appendChild(arrow);
      badgeElement.appendChild(badge);
    }

    // Measure dimensions to adjust position
    const badgeWidth = badgeElement.offsetWidth || 120;
    const badgeHeight = badgeElement.offsetHeight || 32;

    // Viewport bounds
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Determine vertical placement
    let top = 0;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < badgeHeight + CONFIG.gapPx + 10 && spaceAbove > badgeHeight + CONFIG.gapPx) {
      // Show above selection
      top = rect.top + scrollY - badgeHeight - CONFIG.gapPx;
      if (!isAbove) {
        // Re-render with down-arrow
        showBadge(rect, contentType, message, true);
        return;
      }
    } else {
      // Show below selection
      top = rect.bottom + scrollY + CONFIG.gapPx;
    }

    // Determine horizontal placement
    let left = rect.left + scrollX;

    // Adjust if overflowing viewport horizontally
    const maxLeft = scrollX + viewportWidth - badgeWidth - 12;
    if (left > maxLeft) {
      left = Math.max(scrollX + 10, maxLeft);
    }
    if (left < scrollX + 10) {
      left = scrollX + 10;
    }

    badgeElement.style.top = `${Math.round(top)}px`;
    badgeElement.style.left = `${Math.round(left)}px`;
  }

  /**
   * Process the user's Ctrl + selection
   */
  function handleSelection(mode = "pronunciation") {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      removeBadge();
      return;
    }

    const text = selection.toString().trim();

    // Validation
    if (!text || text.length === 0) {
      removeBadge();
      return;
    }

    if (text.length > CONFIG.maxTextLength) {
      // Exceeds 500 characters
      removeBadge();
      return;
    }

    // Must contain at least one English/alphabetic character
    if (!/[a-zA-Z]/.test(text)) {
      removeBadge();
      return;
    }

    // Avoid duplicate requests for identical selection
    const modeKey = `${mode}:${text}`;
    if (modeKey === lastProcessedText && badgeElement) {
      return;
    }

    const rect = getSelectionRect();
    if (!rect) return;

    lastProcessedText = modeKey;
    const cacheKey = `${mode}:${text.toLowerCase()}`;
    const requestId = ++currentRequestId;

    // Check local client-side cache
    if (localCache.has(cacheKey)) {
      const cachedResult = localCache.get(cacheKey);
      showBadge(rect, "text", cachedResult);
      return;
    }

    // Render loading indicator
    showBadge(rect, "loading", "");

    // Send request via background service to bypass CORS
    try {
      const runtimeApi = globalThis.chrome?.runtime || globalThis.browser?.runtime;
      if (!runtimeApi?.sendMessage) {
        showBadge(rect, "warning", "⚠️ Chrome extension context unavailable. Reload the extension and this page.");
        return;
      }

      sendRuntimeMessage(
        runtimeApi,
        { action: mode === "meaning" ? "GET_MEANING" : "GET_PRONUNCIATION", text: text },
        (response, messageErrorMessage) => {
          // Check if this request is still the latest active one
          if (requestId !== currentRequestId) return;

          // Verify selection hasn't been cleared while waiting
          const currentSel = window.getSelection();
          if (!currentSel || currentSel.isCollapsed || currentSel.toString().trim() !== text) {
            removeBadge();
            return;
          }

          const freshRect = getSelectionRect();
          if (!freshRect) {
            removeBadge();
            return;
          }

          if (messageErrorMessage) {
            showBadge(freshRect, "warning", `⚠️ ${messageErrorMessage}. Reload the extension and this page.`);
            return;
          }

          const result = mode === "meaning" ? response?.meaning : response?.pronunciation;
          if (response && response.success && result) {
            localCache.set(cacheKey, result);
            showBadge(freshRect, "text", result);
          } else if (response && response.needsApiKey) {
            showBadge(
              freshRect,
              "warning",
              "⚠️ Set GEMINI_API_KEY in backend/.env"
            );
          } else if (response && response.unreachable) {
            showBadge(
              freshRect,
              "warning",
              "⚠️ Backend offline (run: npm start)"
            );
          } else {
            const errMsg = (response && response.error) ? response.error : (mode === "meaning" ? "অর্থ পাওয়া যায়নি" : "উচ্চারণ পাওয়া যায়নি");
            showBadge(freshRect, "warning", `⚠️ ${errMsg}`);
          }
        }
      );
    } catch (err) {
      console.warn("[BPP Content] Message error:", err);
      const freshRect = getSelectionRect();
      if (freshRect && requestId === currentRequestId) {
        showBadge(freshRect, "warning", `⚠️ ${err.message || "Extension messaging failed"}. Reload the extension and this page.`);
      }
    }
  }

  // ==========================================
  // Event Listeners (Safe, No Shortcut Blocking)
  // ==========================================

  // Key tracking: Never call preventDefault()
  document.addEventListener("keydown", (e) => {
    if (e.key === "Control") {
      isCtrlDown = true;
      if (isMouseDown) {
        ctrlWasPressedDuringSelection = true;
      }
    }
    if (e.key === "Alt") {
      isAltDown = true;
      if (isMouseDown) altWasPressedDuringSelection = true;
    }

    if (e.key === "Escape") {
      removeBadge();
    }
  }, { capture: true, passive: true });

  document.addEventListener("keyup", (e) => {
    if (e.key === "Control") {
      isCtrlDown = false;
      // Do not reset ctrlWasPressedDuringSelection here if mouse is still down!
    }
    if (e.key === "Alt") isAltDown = false;

    // Support keyboard selection (e.g. Shift + Arrow with Ctrl)
    if ((e.shiftKey || e.key.startsWith("Arrow")) && (e.ctrlKey || isCtrlDown || e.altKey || isAltDown)) {
      const altActive = e.altKey || isAltDown;
      const ctrlActive = e.ctrlKey || isCtrlDown;
      const mode = altActive === ctrlActive ? null : (altActive ? "meaning" : "pronunciation");
      if (!mode) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        handleSelection(mode);
      }, CONFIG.debounceMs);
    }
  }, { capture: true, passive: true });

  // Mouse tracking
  document.addEventListener("mousedown", (e) => {
    // Left mouse button
    if (e.button === 0) {
      isMouseDown = true;
      if (e.ctrlKey || isCtrlDown) {
        ctrlWasPressedDuringSelection = true;
      }
      if (e.altKey || isAltDown) {
        altWasPressedDuringSelection = true;
      }
      if (!(e.ctrlKey || isCtrlDown || e.altKey || isAltDown)) {
        ctrlWasPressedDuringSelection = false;
        altWasPressedDuringSelection = false;
        // User clicked without Ctrl: remove existing badge immediately
        removeBadge();
      }
    }
  }, { capture: true, passive: true });

  document.addEventListener("mousemove", (e) => {
    if (isMouseDown) {
      if (e.ctrlKey || isCtrlDown) ctrlWasPressedDuringSelection = true;
      if (e.altKey || isAltDown) altWasPressedDuringSelection = true;
    }
  }, { capture: true, passive: true });

  document.addEventListener("mouseup", (e) => {
    const wasAltActive = e.altKey || isAltDown || altWasPressedDuringSelection;
    const wasCtrlActive = e.ctrlKey || isCtrlDown || ctrlWasPressedDuringSelection;
    const mode = wasAltActive === wasCtrlActive ? null : (wasAltActive ? "meaning" : "pronunciation");
    const shouldLookup = Boolean(mode);

    isMouseDown = false;
    ctrlWasPressedDuringSelection = false;
    altWasPressedDuringSelection = false;

    clearTimeout(debounceTimer);

    if (shouldLookup) {
      // Short debounce keeps the result responsive while filtering selection noise.
      debounceTimer = setTimeout(() => {
        handleSelection(mode);
      }, CONFIG.debounceMs);
    } else {
      // Normal selection without Ctrl: do nothing and remove any previous result
      removeBadge();
    }
  }, { capture: true, passive: true });

  // Clear badge when selection is deselected or collapsed
  document.addEventListener("selectionchange", () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      removeBadge();
    }
  }, { passive: true });

  // Adjust badge position on window resize
  window.addEventListener("resize", () => {
    if (badgeElement) {
      const rect = getSelectionRect();
      if (rect) {
        const textSpan = badgeElement.querySelector(".bpp-text");
        const warnSpan = badgeElement.querySelector(".bpp-warning");
        const loadingDots = badgeElement.querySelector(".bpp-loading-dots");

        if (textSpan) {
          showBadge(rect, "text", textSpan.textContent);
        } else if (warnSpan) {
          showBadge(rect, "warning", warnSpan.textContent);
        } else if (loadingDots) {
          showBadge(rect, "loading", "");
        }
      } else {
        removeBadge();
      }
    }
  }, { passive: true });

})();
