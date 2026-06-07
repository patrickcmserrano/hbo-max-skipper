// Simula o timing dos botões de skip exatamente como o Max faz:
// os botões aparecem e somem via display, não via remoção do DOM.
// O MutationObserver do content_script.js detecta a mudança de atributo/style.

const video         = document.getElementById("video");
const skipIntroBtn  = document.getElementById("skipIntroBtn");
const skipRecapBtn  = document.getElementById("skipRecapBtn");
const nextEpisodeBtn = document.getElementById("nextEpisodeBtn");

const badgeRecap = document.getElementById("badge-recap");
const badgeIntro = document.getElementById("badge-intro");
const badgeNext  = document.getElementById("badge-next");

function show(el) { el.style.display = "block"; }
function hide(el) { el.style.display = "none";  }

video.addEventListener("timeupdate", () => {
  const t   = video.currentTime;
  const dur = video.duration || Infinity;

  // Recap: primeiros 8 segundos
  const showRecap = t > 0.5 && t < 8;
  showRecap ? show(skipRecapBtn) : hide(skipRecapBtn);
  badgeRecap.classList.toggle("active", showRecap);

  // Abertura: entre 10s e 40s
  const showIntro = t > 10 && t < 40;
  showIntro ? show(skipIntroBtn) : hide(skipIntroBtn);
  badgeIntro.classList.toggle("active", showIntro);

  // Próximo episódio: últimos 30s
  const showNext = isFinite(dur) && (dur - t) < 30 && t > 0;
  showNext ? show(nextEpisodeBtn) : hide(nextEpisodeBtn);
  badgeNext.classList.toggle("active", showNext);
});

// Clique manual nos botões avança o vídeo para simular o skip
skipIntroBtn.addEventListener("click", () => {
  video.currentTime = 40;
  console.log("[Mock] Skip intro clicado");
});

skipRecapBtn.addEventListener("click", () => {
  video.currentTime = 8;
  console.log("[Mock] Skip recap clicado");
});

nextEpisodeBtn.addEventListener("click", () => {
  console.log("[Mock] Próximo episódio clicado — em produção navegaria para o próximo ep");
  video.currentTime = 0;
  video.pause();
});
