import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildStops,
  capitalizeFirst,
  createPlugin,
  positionOf,
  stopIndexOf,
} from '../src/plugin.js'

test('builds stops from the adapter effort list', () => {
  const reasoning = {
    efforts: [
      { id: 'low', name: 'Low' },
      { id: 'medium', name: 'Medium' },
      { id: 'high' },
    ],
    defaultEffort: 'medium',
  }
  assert.deepEqual(buildStops(reasoning, 'Default'), [
    { id: 'low', name: 'Low' },
    { id: 'medium', name: 'Medium' },
    { id: 'high', name: 'high' },
  ])
})

test('adds the provider-default stop only when the adapter has no default', () => {
  assert.deepEqual(
    buildStops({ efforts: [{ id: 'low', name: 'Low' }] }, '默认'),
    [
      { id: undefined, name: '默认' },
      { id: 'low', name: 'Low' },
    ],
  )
  assert.deepEqual(buildStops(undefined, 'Default'), [])
  assert.deepEqual(buildStops({ efforts: [] }, 'Default'), [{ id: undefined, name: 'Default' }])
})

test('capitalizes only the first letter of the current level', () => {
  assert.equal(capitalizeFirst('high'), 'High')
  assert.equal(capitalizeFirst('extra high'), 'Extra high')
  assert.equal(capitalizeFirst('max'), 'Max')
  assert.equal(capitalizeFirst('最高'), '最高')
  assert.equal(capitalizeFirst(''), '')
  assert.equal(capitalizeFirst(undefined), '')
})

test('maps effort ids onto slider positions', () => {
  const stops = buildStops({ efforts: [{ id: 'low' }, { id: 'high' }], defaultEffort: 'low' }, 'Default')
  assert.equal(stopIndexOf(stops, 'low'), 0)
  assert.equal(stopIndexOf(stops, 'high'), 1)
  assert.equal(stopIndexOf(stops, 'unknown'), 0)
  assert.equal(positionOf(0, 3), 0)
  assert.equal(positionOf(1, 3), 0.5)
  assert.equal(positionOf(2, 3), 1)
  assert.equal(positionOf(0, 1), 0.5)
})

test('createPlugin exposes the Cordis client contract', () => {
  const plugin = createPlugin('/* css */', {})
  assert.deepEqual(plugin.inject, ['slots', 'locale', 'modelDirectories', 'sessions', 'remote', 'remote.session'])
  assert.equal(typeof plugin.apply, 'function')

  // Outside a browser the plugin is inert and never touches ctx.
  let touched = false
  plugin.apply({
    effect() {
      touched = true
    },
  })
  assert.equal(touched, false)
})

test('the generated bundle follows the DSH client-module protocol', async () => {
  const { readFile } = await import('node:fs/promises')
  const bundle = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  assert.match(bundle, /^window\.__ModuleLoader__\.load\(\{/u)
  assert.match(bundle, /id: "dsh-better-reasoning-effort"/u)
  assert.match(bundle, /require\("react"\)/u)
  assert.match(bundle, /exports\.apply = __plugin\.apply/u)
  assert.match(bundle, /\.rls-track/u)
  assert.doesNotMatch(bundle, /^\s*(?:import|export)\s/mu)
})
