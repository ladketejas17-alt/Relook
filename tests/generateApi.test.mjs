import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../server/index.mjs'
import { hairstyles } from '../src/data/hairstyles.ts'
import { createServer as createVite } from 'vite'
import viteConfig from '../vite.config.ts'

const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0]).toString('base64')
const photo = { mimeType: 'image/png', data: png }
const payload = {
  apiKey: 'private-test-key',
  photos: { Front: photo, Back: photo, Left: photo, Right: photo },
  hairstyle: { kind: 'preset', id: hairstyles[0].id },
  preferences: { length: 'short', texture: 'wavy', color: 'natural' },
}

async function withServer(provider, action) {
  const server = createApp({ provider })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const origin = `http://127.0.0.1:${server.address().port}`
  try { await action(origin) } finally { await new Promise(resolve => server.close(resolve)) }
}

const send = (origin, body, headers = {}) => fetch(`${origin}/api/generate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: origin, ...headers },
  body: JSON.stringify(body),
})

test('sends four ordered reference images with a stateless request and transient key', async () => {
  let called = false
  await withServer(async (url, options) => {
    called = true
    assert.equal(url, 'https://generativelanguage.googleapis.com/v1beta/interactions')
    assert.equal(options.headers['x-goog-api-key'], payload.apiKey)
    const request = JSON.parse(options.body)
    assert.equal(request.store, false)
    assert.equal(request.model, 'gemini-3.1-flash-image')
    assert.deepEqual(request.input.filter(item => item.type === 'image').map(item => item.data), [png, png, png, png])
    assert.match(request.input.at(-1).text, /FRONT, BACK, LEFT, RIGHT/)
    return { ok: true, json: async () => ({ steps: [{ type: 'model_output', content: [{ type: 'image', mime_type: 'image/png', data: png }] }] }) }
  }, async origin => {
    const response = await send(origin, payload)
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    assert.deepEqual(await response.json(), { mimeType: 'image/png', data: png })
  })
  assert.equal(called, true)
})

test('rejects incomplete, forged, and cross-origin requests before calling provider', async () => {
  await withServer(() => { throw Error('Provider must not be called') }, async origin => {
    const missing = await send(origin, { ...payload, photos: { Front: photo, Back: photo, Left: photo } })
    assert.equal(missing.status, 400)
    assert.match((await missing.json()).error, /right photo/)
    const forged = await send(origin, { ...payload, photos: { ...payload.photos, Front: { ...photo, data: Buffer.from('not a photo').toString('base64') } } })
    assert.equal(forged.status, 400)
    const crossOrigin = await send(origin, payload, { Origin: 'https://elsewhere.example' })
    assert.equal(crossOrigin.status, 403)
  })
})

test('redacts provider failure details and rejects responses without an image', async () => {
  await withServer(async () => ({ ok: false, status: 403 }), async origin => {
    const response = await send(origin, payload)
    assert.equal(response.status, 502)
    assert.doesNotMatch(JSON.stringify(await response.json()), /private-test-key/)
  })
  await withServer(async () => ({ ok: true, json: async () => ({ steps: [{ type: 'model_output', content: [{ type: 'text', text: 'No image' }] }] }) }), async origin => {
    const response = await send(origin, payload)
    assert.equal(response.status, 502)
    assert.match((await response.json()).error, /did not return an image/)
  })
})

test('Vite forwards the browser host for same-origin generation requests', async () => {
  await withServer(() => { throw Error('Provider must not be called') }, async apiOrigin => {
    const vite = await createVite({
      ...viteConfig,
      configFile: false,
      server: { ...viteConfig.server, port: 0, proxy: { '/api': { ...viteConfig.server.proxy['/api'], target: apiOrigin } } },
    })
    try {
      await vite.listen()
      const origin = `http://localhost:${vite.httpServer.address().port}`
      const response = await send(origin, {})
      assert.equal(response.status, 400)
      assert.match((await response.json()).error, /API key/)
      assert.equal((await send(origin, {}, { Origin: 'https://elsewhere.example' })).status, 403)
    } finally { await vite.close() }
  })
})
