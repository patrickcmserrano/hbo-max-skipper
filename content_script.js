(() => {
  // --- Config defaults ---
  const DEFAULT_CONFIG = {
    skipIntro: true,
    skipRecap: true,
    autoNext: true,
    autoNextDelay: 5,
  };

  let config = { ...DEFAULT_CONFIG };
  let healthStatus = {};   // { featureName: "ok" | "broken" | "unseen" }
  let autoNextTimer = null;
  let videoDetected = false;
  const clickCooldown = {};  // { featureName: timestamp } — evita cliques repetidos

  // --- Utilities ---

  function findElement(selectorList) {
    for (const sel of selectorList) {
      const el = document.querySelector(sel);
      if (el) return { el, selector: sel };
    }
    return null;
  }

  const CLICK_COOLDOWN_MS = 3000;

  function tryClick(featureName) {
    const selectorList = SELECTORS[featureName];
    if (!selectorList) return false;

    // Não clica de novo se já clicamos recentemente nesta feature.
    const lastClick = clickCooldown[featureName] || 0;
    if (Date.now() - lastClick < CLICK_COOLDOWN_MS) return false;

    const found = findElement(selectorList);
    if (!found) return false;

    const { el, selector } = found;

    // Only click if the element is visible.
    const rect = el.getBoundingClientRect();
    const visible = rect.width > 0 && rect.height > 0;
    if (!visible) return false;

    el.click();
    clickCooldown[featureName] = Date.now();
    markHealth(featureName, "ok", selector);
    console.log(`[HBO Skipper] Clicked "${featureName}" via: ${selector}`);
    return true;
  }

  function markHealth(feature, status, selector = null) {
    const prev = healthStatus[feature];
    healthStatus[feature] = { status, selector, ts: Date.now() };

    // Notify popup if status changed.
    if (!prev || prev.status !== status) {
      chrome.runtime.sendMessage({
        type: "HEALTH_UPDATE",
        healthStatus,
        selectorsVersion: SELECTORS_VERSION,
      }).catch(() => {});   // popup may be closed — ignore
    }
  }

  // --- Auto-next episode ---

  function scheduleAutoNext() {
    if (autoNextTimer) return;   // already scheduled

    autoNextTimer = setTimeout(() => {
      autoNextTimer = null;
      if (!config.autoNext) return;
      const clicked = tryClick("nextEpisode");
      if (!clicked) markHealth("nextEpisode", "broken");
    }, config.autoNextDelay * 1000);
  }

  function cancelAutoNext() {
    if (autoNextTimer) {
      clearTimeout(autoNextTimer);
      autoNextTimer = null;
    }
  }

  // --- MutationObserver ---

  function checkButtons() {
    if (config.skipIntro)  tryClick("skipIntro");
    if (config.skipRecap)  tryClick("skipRecap");

    if (config.autoNext) {
      const found = findElement(SELECTORS.nextEpisode);
      if (found) {
        const rect = found.el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          scheduleAutoNext();
          return;
        }
      }
      cancelAutoNext();
    }
  }

  // attributes:true captura mudanças de classe/style que o Max usa
  // para mostrar/esconder botões sem adicionar/remover nós do DOM.
  const observer = new MutationObserver(checkButtons);

  // --- Video detection ---
  // Wait for a <video> element before starting the observer,
  // so we don't waste cycles on non-player pages.

  function attachToVideo(video) {
    if (videoDetected) return;
    videoDetected = true;
    console.log("[HBO Skipper] Video detected — observer running.");

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style", "aria-hidden", "hidden"],
    });

    // Polling de fallback a cada 800ms — garante o clique mesmo quando
    // o Max muda visibilidade via CSS sem disparar o observer.
    setInterval(checkButtons, 800);

    video.addEventListener("ended", () => {
      if (config.autoNext) scheduleAutoNext();
    });

    // Health check: after 10s of playback, flag any selector never seen.
    video.addEventListener("timeupdate", function checkHealth() {
      if (video.currentTime < 10) return;
      video.removeEventListener("timeupdate", checkHealth);

      for (const feature of Object.keys(SELECTORS)) {
        if (!healthStatus[feature]) {
          markHealth(feature, "unseen");
        }
      }

      if (Object.values(healthStatus).some(h => h.status === "broken" || h.status === "unseen")) {
        console.warn(
          `[HBO Skipper] Some selectors may be broken. Selectors version: ${SELECTORS_VERSION}. ` +
          "Open the extension popup for details."
        );
      }
    });
  }

  function waitForVideo() {
    const existing = document.querySelector("video");
    if (existing) { attachToVideo(existing); return; }

    const videoWatcher = new MutationObserver((_, obs) => {
      const video = document.querySelector("video");
      if (video) {
        obs.disconnect();
        attachToVideo(video);
      }
    });
    videoWatcher.observe(document.body, { childList: true, subtree: true });
  }

  // --- Message handler (from popup / background) ---

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === "CONFIG_UPDATE") {
      config = { ...DEFAULT_CONFIG, ...msg.config };
      if (!config.autoNext) cancelAutoNext();
    }

    if (msg.type === "REQUEST_HEALTH") {
      sendResponse({ healthStatus, selectorsVersion: SELECTORS_VERSION });
    }

    return true;
  });

  // --- Init ---

  chrome.storage.sync.get(DEFAULT_CONFIG, (stored) => {
    config = { ...DEFAULT_CONFIG, ...stored };
    waitForVideo();
  });
})();
