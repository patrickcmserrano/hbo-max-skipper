# HBO Max Skipper

Extensão Chrome que pula abertura, recap e avança episódios automaticamente no Max.

## Funcionalidades

- **Pular abertura** — clica em "Ignorar abertura" assim que o botão aparece
- **Pular recap** — clica em "Ignorar recapitulação" no início do episódio
- **Próximo episódio automático** — avança para o próximo episódio no fim, com delay configurável
- **Popup de controle** — liga/desliga cada feature independentemente
- **Health check** — mostra no popup quais seletores estão ativos ou quebrados

## Instalação

> Ainda não está publicada na Chrome Web Store. Instale no modo desenvolvedor:

1. Clone o repositório:
   ```bash
   git clone https://github.com/patrickcmserrano/hbo-max-skipper
   ```
2. Abra `chrome://extensions`
3. Ative o **Modo do desenvolvedor** (canto superior direito)
4. Clique em **Carregar sem compactação** e selecione a pasta clonada

## Atualização

```bash
git pull
```

Depois recarregue a extensão em `chrome://extensions` (botão ↺).

## Manutenção de seletores

O Max atualiza o DOM ocasionalmente e pode quebrar a extensão. Quando isso acontecer:

1. Abra o DevTools no Max durante a reprodução
2. Cole no console para listar os botões visíveis:
   ```js
   document.querySelectorAll('button').forEach(b => {
     if (b.offsetWidth > 0 && b.offsetHeight > 0) console.log(b.outerHTML);
   });
   ```
3. Encontre o botão "Ignorar abertura" e copie o `data-testid` ou `aria-label`
4. Atualize `selectors.js` — adicione o novo seletor no topo do array correspondente
5. Atualize `SELECTORS_VERSION` com a data de hoje e registre no `CHANGELOG.md`

Ou rode o script de validação automática (requer `npm install` e o Max aberto):
```bash
node scripts/validate-selectors.js "https://play.hbomax.com/video/watch/..."
```

## Desenvolvimento

### Ambiente

```bash
npm install
npx playwright install chromium
```

Baixe um vídeo de amostra para o mock:
```bash
# Big Buck Bunny — domínio público
curl -L "https://download.blender.org/demo/movies/BBB/bbb_sunflower_720p_30fps_normal.mp4" \
  -o mock/sample.mp4
```

Suba o servidor local:
```bash
python3 -m http.server 8080
```

Acesse `http://localhost:8080/mock/mock-player.html` — a extensão injeta normalmente (localhost está no `matches` do manifest).

### Cenários de teste

| URL | O que simula |
|---|---|
| `?scenario=intro` | Botão de abertura aparece após 2s |
| `?scenario=recap` | Botão de recap aparece no início |
| `?scenario=next` | Vídeo pula pro fim, botão de próximo episódio aparece |
| sem parâmetro | Timing completo baseado em `currentTime` |

### Testes e2e

```bash
npm run test:e2e
```

Abre o Chrome com a extensão carregada e roda os três cenários contra o mock.

### Ciclo de desenvolvimento

```
Edita selectors.js ou content_script.js
→ chrome://extensions → ↺ reload
→ F5 na aba do Max ou do mock
```

## Estrutura

```
├── manifest.json          # MV3, permissões mínimas
├── selectors.js           # Seletores versionados — único arquivo que muda com updates do Max
├── content_script.js      # MutationObserver + polling + health check
├── background.js          # Service worker (relay popup ↔ content script)
├── popup/                 # Interface de toggles e status dos seletores
├── mock/                  # Player local para desenvolvimento sem conta Max
├── tests/e2e/             # Testes Playwright contra o mock
├── scripts/               # validate-selectors.js para validação manual
└── CHANGELOG.md           # Histórico de atualizações de seletores
```

## Segurança e privacidade

- **Zero requisições de rede** — a extensão não faz nenhuma chamada externa
- **Zero dados pessoais** — só lê o DOM para clicar em botões; não lê conteúdo da página
- **Permissões mínimas** — apenas `storage` (preferências) e `activeTab`

Veja [SECURITY.md](SECURITY.md) para reportar vulnerabilidades.

## Licença

MIT
