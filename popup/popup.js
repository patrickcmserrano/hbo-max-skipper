const DEFAULT_CONFIG = {
  skipIntro: true,
  skipRecap: true,
  autoNext: true,
  autoNextDelay: 5,
};

const FEATURE_LABELS = {
  skipIntro:   "Pular abertura",
  skipRecap:   "Pular recap",
  nextEpisode: "Próximo episódio",
};

// --- DOM refs ---
const skipIntroEl    = document.getElementById("skipIntro");
const skipRecapEl    = document.getElementById("skipRecap");
const autoNextEl     = document.getElementById("autoNext");
const delayEl        = document.getElementById("autoNextDelay");
const delayDisplay   = document.getElementById("delayDisplay");
const delayRow       = document.getElementById("delayRow");
const healthList     = document.getElementById("healthList");
const healthHint     = document.getElementById("healthHint");
const versionBadge   = document.getElementById("selectorsVersion");

// --- Helpers ---

function saveAndBroadcast(config) {
  chrome.storage.sync.set(config);
  chrome.runtime.sendMessage({ type: "CONFIG_UPDATE", config }).catch(() => {});
}

function readFormConfig() {
  return {
    skipIntro:      skipIntroEl.checked,
    skipRecap:      skipRecapEl.checked,
    autoNext:       autoNextEl.checked,
    autoNextDelay:  Number(delayEl.value),
  };
}

function applyConfig(config) {
  skipIntroEl.checked  = config.skipIntro;
  skipRecapEl.checked  = config.skipRecap;
  autoNextEl.checked   = config.autoNext;
  delayEl.value        = config.autoNextDelay;
  delayDisplay.textContent = config.autoNextDelay;
  delayRow.classList.toggle("hidden", !config.autoNext);
}

function applyHealth(healthStatus, version) {
  if (version) versionBadge.textContent = version;

  const items = healthList.querySelectorAll(".health-item");
  let hasData = false;

  items.forEach((item) => {
    const feature = item.dataset.feature;
    const dot = item.querySelector(".dot");
    const h = healthStatus[feature];

    dot.className = "dot";

    if (!h) {
      dot.classList.add("dot--unknown");
    } else {
      hasData = true;
      dot.classList.add(`dot--${h.status}`);

      if (h.status === "broken") {
        item.title = "Seletor não encontrado no DOM atual";
      } else if (h.status === "unseen") {
        item.title = "Botão não apareceu durante a sessão";
      } else if (h.selector) {
        item.title = h.selector;
      }
    }
  });

  if (hasData) {
    const broken = Object.values(healthStatus).filter(h => h.status === "broken" || h.status === "unseen");
    healthHint.textContent = broken.length
      ? `${broken.length} seletor(es) podem estar desatualizados. Atualize selectors.js.`
      : "Todos os seletores estão funcionando.";
  }
}

// --- Events ---

[skipIntroEl, skipRecapEl, autoNextEl].forEach((el) => {
  el.addEventListener("change", () => {
    const cfg = readFormConfig();
    delayRow.classList.toggle("hidden", !cfg.autoNext);
    saveAndBroadcast(cfg);
  });
});

delayEl.addEventListener("input", () => {
  delayDisplay.textContent = delayEl.value;
});

delayEl.addEventListener("change", () => {
  saveAndBroadcast(readFormConfig());
});

// Listen for health updates pushed from the content script while popup is open.
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "HEALTH_UPDATE") {
    applyHealth(msg.healthStatus, msg.selectorsVersion);
  }
});

// --- Init ---

chrome.storage.sync.get(DEFAULT_CONFIG, (stored) => {
  applyConfig({ ...DEFAULT_CONFIG, ...stored });
});

// Request current health from the active tab.
chrome.runtime.sendMessage({ type: "REQUEST_HEALTH" }, (response) => {
  if (chrome.runtime.lastError || !response) return;
  applyHealth(response.healthStatus, response.selectorsVersion);
});
