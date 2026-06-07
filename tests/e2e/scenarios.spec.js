import { test as base, expect, chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXTENSION_PATH = path.resolve(__dirname, '../../');
const MOCK = (scenario) =>
  `http://localhost:8080/mock/mock-player.html?scenario=${scenario}`;

// Fixture que carrega a extensão numa sessão persistente do Chrome.
const test = base.extend({
  context: async ({}, use) => {
    const ctx = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
      ],
    });
    await use(ctx);
    await ctx.close();
  },
  page: async ({ context }, use) => {
    const page = await context.newPage();
    await use(page);
    await page.close();
  },
});

// Inicia o vídeo e aguarda currentTime > 0 (autoplay pode ser bloqueado).
async function playVideo(page) {
  await page.evaluate(() => {
    const v = document.querySelector('video');
    return v.play().catch(() => {});
  });
  await page.waitForFunction(() => {
    const v = document.querySelector('video');
    return v && v.currentTime > 0;
  }, { timeout: 5000 });
}

// ---

test('skip intro: extensão clica no botão automaticamente', async ({ page }) => {
  await page.goto(MOCK('intro'));
  await playVideo(page);

  // Aguarda botão aparecer (aparece após 2s de playback no cenário intro).
  const btn = page.locator('[data-testid="player-ux-skip-button"]');
  await expect(btn).toBeVisible({ timeout: 8000 });

  // Extensão deve clicar em até 1s (polling de 800ms).
  // Após o clique, currentTime salta pra 40 e o botão some.
  await expect(btn).not.toBeVisible({ timeout: 5000 });

  // Confirma que o vídeo avançou (clique no mock seta currentTime = 40).
  const currentTime = await page.evaluate(() => document.querySelector('video').currentTime);
  expect(currentTime).toBeGreaterThanOrEqual(38);
});

test('skip recap: extensão clica no botão automaticamente', async ({ page }) => {
  await page.goto(MOCK('recap'));
  await playVideo(page);

  // Botão de recap aparece nos primeiros 0.5s.
  const btn = page.locator('[data-testid="player-ux-skip-button"]');
  await expect(btn).toBeVisible({ timeout: 5000 });

  // Extensão clica e currentTime salta pra 8.
  await expect(btn).not.toBeVisible({ timeout: 5000 });

  const currentTime = await page.evaluate(() => document.querySelector('video').currentTime);
  expect(currentTime).toBeGreaterThanOrEqual(7);
});

test('próximo episódio: extensão clica após o delay configurado', async ({ page }) => {
  // Reduz o delay pra 1s antes de navegar.
  await page.goto(MOCK('next'));

  // Seta delay = 1s via chrome.storage (antes do content script ler).
  await page.evaluate(() => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ autoNextDelay: 1 }, resolve);
    });
  }).catch(() => {
    // chrome.storage não acessível na página — ignora, usa o default.
  });

  await playVideo(page);

  const btn = page.locator('[data-testid="player-ux-next-up-card-play-button"], button[aria-label*="próximo" i]');

  // Aguarda botão de próximo episódio aparecer.
  await expect(btn).toBeVisible({ timeout: 10000 });

  // Extensão agenda o clique (default 5s). Aguarda o clique acontecer.
  await expect(btn).not.toBeVisible({ timeout: 12000 });
});
