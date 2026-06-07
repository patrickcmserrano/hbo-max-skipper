// Simula o DOM do Max com cenários selecionáveis via ?scenario=<nome>
// Cenários disponíveis: intro | recap | next | default

const video          = document.getElementById("video");
const skipIntroBtn   = document.getElementById("skipIntroBtn");
const skipRecapBtn   = document.getElementById("skipRecapBtn");
const nextEpisodeBtn = document.getElementById("nextEpisodeBtn");

const badgeRecap = document.getElementById("badge-recap");
const badgeIntro = document.getElementById("badge-intro");
const badgeNext  = document.getElementById("badge-next");

const scenario = new URLSearchParams(location.search).get("scenario") || "default";

document.title = `Mock Player [${scenario}]`;

function show(el) { el.style.display = "block"; }
function hide(el) { el.style.display = "none"; }

// --- Cliques manuais nos botões avançam o vídeo ---

skipIntroBtn.addEventListener("click", () => {
  video.currentTime = 40;
  console.log("[Mock] Skip intro clicado");
});

skipRecapBtn.addEventListener("click", () => {
  video.currentTime = 8;
  console.log("[Mock] Skip recap clicado");
});

nextEpisodeBtn.addEventListener("click", () => {
  console.log("[Mock] Próximo episódio clicado");
  video.currentTime = 0;
  video.pause();
});

// --- Cenários ---

const scenarios = {
  // Botão de abertura aparece entre 2s e 35s de playback.
  intro() {
    video.addEventListener("timeupdate", () => {
      const t = video.currentTime;
      const active = t > 2 && t < 35;
      active ? show(skipIntroBtn) : hide(skipIntroBtn);
      badgeIntro.classList.toggle("active", active);
    });
  },

  // Botão de recap aparece nos primeiros 8s.
  recap() {
    video.addEventListener("timeupdate", () => {
      const t = video.currentTime;
      const active = t > 0.5 && t < 8;
      active ? show(skipRecapBtn) : hide(skipRecapBtn);
      badgeRecap.classList.toggle("active", active);
    });
  },

  // Vídeo pula pra perto do fim; botão de próximo episódio aparece.
  next() {
    video.addEventListener("canplay", () => {
      if (isFinite(video.duration) && video.duration > 15) {
        video.currentTime = video.duration - 12;
      }
    }, { once: true });

    video.addEventListener("timeupdate", () => {
      if (!isFinite(video.duration)) return;
      const remaining = video.duration - video.currentTime;
      const active = remaining < 15 && remaining > 0;
      active ? show(nextEpisodeBtn) : hide(nextEpisodeBtn);
      badgeNext.classList.toggle("active", active);
    });
  },

  // Comportamento padrão: timing baseado em porcentagem do vídeo.
  default() {
    video.addEventListener("timeupdate", () => {
      const t   = video.currentTime;
      const dur = video.duration || Infinity;

      const showRecap = t > 0.5 && t < 8;
      showRecap ? show(skipRecapBtn) : hide(skipRecapBtn);
      badgeRecap.classList.toggle("active", showRecap);

      const showIntro = t > 10 && t < 40;
      showIntro ? show(skipIntroBtn) : hide(skipIntroBtn);
      badgeIntro.classList.toggle("active", showIntro);

      const showNext = isFinite(dur) && (dur - t) < 30 && t > 0;
      showNext ? show(nextEpisodeBtn) : hide(nextEpisodeBtn);
      badgeNext.classList.toggle("active", showNext);
    });
  },
};

(scenarios[scenario] ?? scenarios.default)();
