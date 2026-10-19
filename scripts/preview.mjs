#!/usr/bin/env node
/**
 * Render the demo page to the two README screenshots with headless Chrome.
 *
 * Usage: npm run preview
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const candidates = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean)
const chrome = candidates.find((candidate) => existsSync(candidate))
if (chrome === undefined) {
  console.error('No Chrome/Chromium executable found; set CHROME_PATH to render the preview')
  process.exit(1)
}

const page = join(root, 'demo/preview.html')
for (const theme of ['light', 'dark']) {
  const output = join(root, `demo/preview-${theme}.png`)
  const profile = mkdtempSync(join(tmpdir(), 'dsh-better-reasoning-effort-preview-'))
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--disable-background-networking',
    '--disable-component-update',
    '--no-first-run',
    '--no-default-browser-check',
    '--allow-file-access-from-files',
    '--hide-scrollbars',
    '--force-device-scale-factor=2',
    '--window-size=1100,760',
    '--virtual-time-budget=2500',
    '--user-data-dir=' + profile,
    '--screenshot=' + output,
    `file://${page}?theme=${theme}`,
  ]
  try {
    const result = spawnSync(chrome, args, { encoding: 'utf8', timeout: 60_000 })
    if (result.status !== 0) {
      console.error(result.stderr || `Chrome exited with ${result.status}`)
      process.exit(1)
    }
  } finally {
    rmSync(profile, { recursive: true, force: true })
  }
  console.log(`rendered ${output}`)
}
