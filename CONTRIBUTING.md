# Contribuindo

## Adicionando suporte a um novo serviço

A extensão foi desenhada para suportar múltiplos serviços com zero mudança na lógica principal. Todo o trabalho fica em dois arquivos.

### 1. Descobrir os seletores

Abra o serviço no Chrome, inicie um episódio e aguarde o botão de skip aparecer. Com o DevTools aberto (F12), cole no console:

```js
document.querySelectorAll('button').forEach(b => {
  if (b.offsetWidth > 0 && b.offsetHeight > 0) console.log(b.outerHTML);
});
```

Procure os botões de:
- **Pular abertura** — aparece nos primeiros minutos do episódio
- **Pular recap** — aparece no início de episódios com continuação
- **Próximo episódio** — aparece nos últimos minutos

Para cada botão, anote o `data-testid`, `aria-label` e classes relevantes.

### 2. Atualizar `selectors.js`

Adicione uma entrada para o novo serviço em `SELECTORS_BY_SERVICE` e atualize a detecção de domínio:

```js
const SELECTORS_BY_SERVICE = {
  "hbomax.com": {
    skipIntro:   ['[data-testid="player-ux-skip-button"]', ...],
    skipRecap:   ['[data-testid="player-ux-skip-button"]', ...],
    nextEpisode: ['button[aria-label*="próximo episódio" i]', ...],
  },

  // Novo serviço:
  "netflix.com": {
    skipIntro:   ['[data-uia="player-skip-intro"]',   'button[aria-label*="intro" i]'],
    skipRecap:   ['[data-uia="player-skip-recap"]',   'button[aria-label*="recap" i]'],
    nextEpisode: ['[data-uia="next-episode-seamless-button"]', 'button[aria-label*="next" i]'],
  },
};

const service = Object.keys(SELECTORS_BY_SERVICE)
  .find(s => location.hostname.includes(s));

const SELECTORS = SELECTORS_BY_SERVICE[service] ?? {};
```

> Use arrays com múltiplos seletores em ordem de prioridade. O primeiro que existir no DOM é usado. Isso garante fallbacks quando o serviço atualizar.

### 3. Atualizar `manifest.json`

Adicione o domínio ao `matches` dos content scripts:

```json
"content_scripts": [{
  "matches": [
    "*://*.hbomax.com/*",
    "*://*.max.com/*",
    "*://*.netflix.com/*"
  ],
  ...
}]
```

### 4. Registrar no `CHANGELOG.md`

```md
## v3 — YYYY-MM-DD

Adicionado suporte a Netflix.

| Feature | Seletor primário |
|---|---|
| skipIntro   | `[data-uia="player-skip-intro"]` |
| skipRecap   | `[data-uia="player-skip-recap"]` |
| nextEpisode | `[data-uia="next-episode-seamless-button"]` |

Validado em: Chrome XXX, Netflix BR.
```

### 5. Adicionar cenário no mock (opcional)

Se quiser cobrir o novo serviço nos testes e2e, adicione um cenário em `mock/mock-player.js` e um teste em `tests/e2e/scenarios.spec.js` — o padrão já está estabelecido.

---

## Atualizando seletores quebrados

Quando um serviço atualiza o DOM e quebra um seletor existente:

1. Abra o DevTools no serviço afetado e rode o script de inspeção acima
2. Copie o novo seletor
3. Adicione-o **no topo** do array em `selectors.js` (mantendo os antigos como fallback)
4. Atualize `SELECTORS_VERSION` com a data de hoje
5. Registre no `CHANGELOG.md`

Para validar automaticamente contra o serviço real:

```bash
node scripts/validate-selectors.js "https://play.hbomax.com/video/watch/..."
```

---

## Seletores conhecidos por serviço

> Status validado pela comunidade. Contribua atualizando esta tabela via PR.

### HBO Max (`play.hbomax.com`)

| Feature | Seletor | Validado em |
|---|---|---|
| skipIntro | `[data-testid="player-ux-skip-button"]` | 2026-06-06 |
| skipRecap | `[data-testid="player-ux-skip-button"]` | 2026-06-06 |
| nextEpisode | `button[aria-label*="próximo episódio" i]` | 2026-06-06 |

### Netflix (`netflix.com`)

> Não validado — contribuição bem-vinda.

| Feature | Seletor provável | Validado em |
|---|---|---|
| skipIntro | `[data-uia="player-skip-intro"]` | — |
| skipRecap | `[data-uia="player-skip-recap"]` | — |
| nextEpisode | `[data-uia="next-episode-seamless-button"]` | — |

### Prime Video (`primevideo.com`)

> Não validado — contribuição bem-vinda.

| Feature | Seletor provável | Validado em |
|---|---|---|
| skipIntro | `button[aria-label*="intro" i]` | — |
| skipRecap | — | — |
| nextEpisode | `[data-testid="next-button"]` | — |

### Disney+ (`disneyplus.com`)

> Não validado — contribuição bem-vinda.

| Feature | Seletor provável | Validado em |
|---|---|---|
| skipIntro | `button[aria-label*="intro" i]` | — |
| skipRecap | — | — |
| nextEpisode | `[aria-label*="next" i]` | — |
