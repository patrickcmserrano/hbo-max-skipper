// ÚNICO arquivo que muda quando o Max atualiza o DOM.
// Antes de editar: abra o DevTools no Max, inspecione o botão,
// copie o seletor e atualize aqui. Registre no CHANGELOG.md.

const SELECTORS_VERSION = "2026-06-06-v2";

const SELECTORS = {
  // Cada entrada é um array de seletores em ordem de prioridade.
  // tryClick() testa cada um até achar um que exista no DOM.

  // O Max usa o mesmo data-testid para intro e recap ("player-ux-skip-button").
  // Diferenciamos pelo aria-label quando necessário, mas na prática basta clicar
  // em qualquer botão visível com esse testid.
  skipIntro: [
    '[data-testid="player-ux-skip-button"]',
    'button[aria-label="Ignorar abertura"]',
    'button[aria-label*="abertura" i]',
    'button[aria-label*="intro" i]',
  ],

  skipRecap: [
    '[data-testid="player-ux-skip-button"]',
    'button[aria-label="Ignorar recapitulação"]',
    'button[aria-label*="recap" i]',
    'button[aria-label*="recapitulação" i]',
  ],

  nextEpisode: [
    'button[aria-label*="próximo episódio" i]',
    'button[aria-label*="proximo episodio" i]',
    '[data-testid="player-ux-next-up-card-play-button"]',
    '[data-testid="player-ux-next-episode-button"]',
    'button[aria-label*="next episode" i]',
  ],
};
