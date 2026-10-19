#!/usr/bin/env node
/**
 * Build the browser bundle without a bundler.
 *
 * DSH's client-module protocol expects a script that calls
 * `window.__ModuleLoader__.load({ id, factory })`. The plugin has no runtime
 * imports, so wrapping the source and inlining its stylesheet is sufficient
 * and keeps the project dependency-free.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const packageJson = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
const source = await readFile(join(root, 'src/plugin.js'), 'utf8')
const css = await readFile(join(root, 'src/plugin.css'), 'utf8')

const body = source.replace(/^export\s+/gm, '')
if (/^\s*(?:import|export)\s/m.test(body)) {
  throw new Error('src/plugin.js must not contain runtime import/export statements after stripping')
}

const bundle = `window.__ModuleLoader__.load({
\tid: ${JSON.stringify(packageJson.name)},
\tfactory: (require) => {
\t\tvar module = { exports: {} };
\t\tvar exports = module.exports;
\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
\t\tconst __RLS_CSS__ = ${JSON.stringify(css)};
${body}
\t\tconst __React__ = require("react");
\t\tconst __plugin = createPlugin(__RLS_CSS__, __React__);
\t\texports.inject = __plugin.inject;
\t\texports.apply = __plugin.apply;
\t\treturn module.exports;
\t}
});
`

// Fail the build on a syntax error before writing a broken bundle.
new Function(bundle)

const outDir = join(root, 'lib')
await mkdir(outDir, { recursive: true })
await writeFile(join(outDir, 'client.js'), bundle)
console.log(`built lib/client.js (${Buffer.byteLength(bundle)} bytes, ${Buffer.byteLength(css)} bytes of CSS)`)
