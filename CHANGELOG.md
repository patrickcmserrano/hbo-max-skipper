# Selectors Changelog

Registre aqui toda atualização de seletor com data e contexto.
Quando o Max atualizar o DOM e algum botão parar de funcionar:

1. Abra o DevTools na página do Max (F12)
2. Encontre o botão no painel Elements
3. Copie o seletor novo
4. Atualize `selectors.js` — adicione o novo no topo do array, mantenha os antigos como fallback
5. Atualize `SELECTORS_VERSION` com a data de hoje
6. Registre aqui

---

## v2 — 2026-06-06

Seletores corrigidos com base na inspeção real do DOM do Max BR.
Validado em: Chrome, Max BR (anime com abertura).

| Feature | Seletor primário |
|---|---|
| skipIntro | `[data-testid="player-ux-skip-button"]` + `aria-label="Ignorar abertura"` |
| skipRecap | `[data-testid="player-ux-skip-button"]` + `aria-label="Ignorar recapitulação"` |
| nextEpisode | `[data-testid="player-ux-next-up-card-play-button"]` (a confirmar) |

Nota: o Max usa o mesmo `data-testid` para intro e recap. O botão é genérico
(`player-ux-skip-button`) e o `aria-label` é o que muda entre os contextos.

nextEpisode confirmado via `button[aria-label*="próximo episódio" i]` — promovido
ao topo do array de fallbacks.

---

## v1 — 2026-06-06

Seletores iniciais baseados na inspeção do DOM do Max.
Validado em: Chrome 136, Max BR.

| Feature | Seletor primário |
|---|---|
| skipIntro | `[data-testid="skip-intro-button"]` |
| skipRecap | `[data-testid="skip-recap-button"]` |
| nextEpisode | `[data-testid="next-episode-button"]` |

Fallbacks incluídos: variações de `data-testid`, `aria-label` em EN e PT-BR, classes `.skip-*`.
