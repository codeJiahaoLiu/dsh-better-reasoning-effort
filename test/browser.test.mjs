#!/usr/bin/env node
/**
 * Run the browser integration page with headless Chrome.
 *
 * The page loads the generated `lib/client.js`, applies it to a DOM shaped
 * like the real model picker, mutates the trigger label, and asserts that the
 * observer and the disposer both behave. Chrome is the only external tool;
 * the plugin itself has no test dependencies.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const page = join(root, 'test/browser.html')

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
  console.log('SKIP browser test: no Chrome/Chromium executable found (set CHROME_PATH to run it)')
  process.exit(0)
}

const profile = mkdtempSync(join(tmpdir(), 'dsh-better-reasoning-effort-'))
const args = [
  '--headless=new',
  '--disable-gpu',
  '--disable-background-networking',
  '--no-first-run',
  '--no-default-browser-check',
  '--allow-file-access-from-files',
  '--virtual-time-budget=5000',
  '--user-data-dir=' + profile,
  '--dump-dom',
  new URL(`file://${page}`).href,
]

let result
try {
  result = spawnSync(chrome, args, { encoding: 'utf8', timeout: 30_000 })
} finally {
  rmSync(profile, { recursive: true, force: true })
}

const dom = result?.stdout ?? ''
const failed = !dom.includes('data-test-status="pass"')
if (failed) {
  const text = dom.match(/<pre id="result">([\s\S]*?)<\/pre>/)?.[1] ?? ''
  const decoded = text
    .replaceAll('&quot;', '"')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
  console.error(decoded || 'browser page did not reach the assertion phase')
  if (result?.stderr) console.error(result.stderr.trim())
  process.exit(1)
}
console.log('browser test passed')
