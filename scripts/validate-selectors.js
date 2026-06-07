#!/usr/bin/env node
/**
 * Valida se os seletores da extensão ainda funcionam no Max real.
 * Abre o Chrome com o seu perfil existente (sessão logada) e verifica
 * cada seletor durante a reprodução.
 *
 * Uso:
 *   node scripts/validate-selectors.js "https://play.hbomax.com/video/watch/..."
 *
 * Pré-requisitos:
 *   - Chrome fechado (ou usar --profile-dir com um perfil separado)
 *   - npx playwright install chromium
 */

import { chromium } from '@playwright/test';
import os from 'os';
import path from 'path';

const url = process.argv[2];

if (!url || !url.startsWith('http')) {
  console.error('Uso: node scripts/validate-selectors.js "https://play.hbomax.com/..."');
  process.exit(1);
}

// Seletores a validar — manter em sincronia com selectors.js
const CHECKS = [
  {
    name: 'skipIntro',
    description: 'Botão "Ignorar abertura" (aparece durante a abertura)',
    selectors: [
      '[data-testid="player-ux-skip-button"]',
      'button[aria-label="Ignorar abertura"]',
      'button[aria-label*="abertura" i]',
    ],
  },
  {
    name: 'skipRecap',
    description: 'Botão "Ignorar recapitulação" (aparece no início do ep)',
    selectors: [
      '[data-testid="player-ux-skip-button"]',
      'button[aria-label="Ignorar recapitulação"]',
      'button[aria-label*="recap" i]',
    ],
  },
  {
    name: 'nextEpisode',
    description: 'Botão de próximo episódio (aparece perto do fim)',
    selectors: [
      'button[aria-label*="próximo episódio" i]',
      '[data-testid="player-ux-next-up-card-play-button"]',
      '[data-testid="player-ux-next-episode-button"]',
    ],
  },
];

// Perfil padrão do Chrome no Linux. Ajuste se necessário.
const CHROME_PROFILE = path.join(os.homedir(), '.config', 'google-chrome');

async function run() {
  console.log(`\n🔍 HBO Max Skipper — Validação de Seletores`);
  console.log(`URL: ${url}\n`);

  const ctx = await chromium.launchPersistentContext(CHROME_PROFILE, {
    headless: false,
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-first-run', '--no-default-browser-check'],
  });

  const page = await ctx.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Aguardando player carregar (15s)...\n');
    await page.waitForTimeout(15000);

    for (const check of CHECKS) {
      console.log(`▶ ${check.name}: ${check.description}`);

      let found = false;
      for (const sel of check.selectors) {
        const count = await page.locator(sel).count();
        const status = count > 0 ? '✓' : '✗';
        const note   = count > 0 ? `(${count} elemento${count > 1 ? 's' : ''} no DOM)` : '';
        console.log(`  ${status} ${sel} ${note}`);
        if (count > 0 && !found) found = true;
      }

      if (!found) {
        console.log(`  ⚠️  Nenhum seletor encontrado — pode não ter aparecido ainda`);
        console.log(`     Tente rodar de novo durante a abertura/recap/fim do episódio`);
      }
      console.log();
    }
  } finally {
    await ctx.close();
  }
}

run().catch((err) => {
  console.error('Erro:', err.message);
  process.exit(1);
});
