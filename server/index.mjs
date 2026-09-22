import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createGenerationRequest, photoViews, MAX_PHOTO_BYTES } from '../src/domain/generationRequest.ts'
import { buildPrompt } from '../src/domain/buildPrompt.ts'

const MAX_BODY_BYTES = 56 * 1024 * 1024
const MAX_OUTPUT_BYTES = 16 * 1024 * 1024
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions'
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' }

function reply(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' })
  res.end(JSON.stringify(payload))
}

function isImage(data, type) {
  if (type === 'image/png') return data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  if (type === 'image/jpeg') return data[0] === 255 && data[1] === 216 && data[2] === 255
  if (type === 'image/webp') return data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP'
  return false
}

function decodePhoto(value) {
  if (!value || typeof value !== 'object' || !['image/png', 'image/jpeg', 'image/webp'].includes(value.mimeType) || typeof value.data !== 'string') throw new Error('Invalid photo.')
  if (value.data.length > Math.ceil(MAX_PHOTO_BYTES * 4 / 3) + 4 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value.data)) throw new Error('Invalid photo.')
  const bytes = Buffer.from(value.data, 'base64')
  if (!bytes.length || bytes.length > MAX_PHOTO_BYTES || !isImage(bytes, value.mimeType)) throw new Error('Invalid photo.')
  return new File([bytes], 'photo', { type: value.mimeType })
}

function parseDraft(body) {
  if (!body || typeof body !== 'object' || !body.photos || typeof body.photos !== 'object') throw new Error('Invalid request.')
  const photos = {}
  for (const view of photoViews) {
    if (!body.photos[view]) continue
    photos[view] = decodePhoto(body.photos[view])
  }
  // Do not trust object shape or preference values received over the network.
  const hairstyle = body.hairstyle?.kind === 'preset' && typeof body.hairstyle.id === 'string'
    ? { kind: 'preset', id: body.hairstyle.id }
    : body.hairstyle?.kind === 'custom' && typeof body.hairstyle.description === 'string'
      ? { kind: 'custom', description: body.hairstyle.description }
      : null
  const preferences = {
    length: ['short', 'medium', 'long'].includes(body.preferences?.length) ? body.preferences.length : null,
    texture: ['straight', 'wavy', 'curly', 'coily'].includes(body.preferences?.texture) ? body.preferences.texture : null,
    color: ['natural', 'black', 'brown', 'blonde', 'red'].includes(body.preferences?.color) ? body.preferences.color : null,
  }
  const result = createGenerationRequest({ photos, hairstyle, preferences })
  if (!result.ok) throw new Error(result.errors.join(' '))
  return result.request
}

function imageFromResponse(response) {
  const steps = response?.interaction?.steps ?? response?.steps
  if (!Array.isArray(steps)) return null
  for (const step of [...steps].reverse()) {
    if (step.type !== 'model_output' || !Array.isArray(step.content)) continue
    for (const item of step.content) {
      const mimeType = item.mime_type ?? item.mimeType
      if (item.type !== 'image' || typeof item.data !== 'string' || item.data.length > Math.ceil(MAX_OUTPUT_BYTES * 4 / 3) + 4 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(item.data)) continue
      const bytes = Buffer.from(item.data, 'base64')
      if (bytes.length && bytes.length <= MAX_OUTPUT_BYTES && isImage(bytes, mimeType)) return { mimeType, data: item.data }
    }
  }
  return null
}

async function providerFailure(response) {
  // Google can return account details and request fragments in error messages.
  // Map only its documented machine-readable code, never forward raw text.
  let code
  try {
    const body = await response.json()
    code = typeof body?.error?.code === 'string' && /^[a-z_]{1,50}$/.test(body.error.code)
      ? body.error.code : undefined
  } catch { /* Some upstream failures contain no JSON body. */ }
  const byCode = {
    authentication: 'Gemini could not authenticate this key. Create a new restricted Gemini API key.',
    failed_precondition: 'Gemini says this project is missing a requirement, often paid API access. Check the project linked to this key in Google AI Studio.',
    payment_required: 'Gemini reports that this project needs billing credits. Check its billing settings in Google AI Studio.',
    permission_denied: 'This key or its project cannot use Gemini image generation. Check its API restrictions and project access.',
    invalid_request: 'Gemini rejected the request format. This may be a Solair integration issue; report the error code to us.',
    parameter_unknown: 'Gemini rejected a request parameter. This may be a Solair integration issue; report the error code to us.',
    model_not_found: 'This Gemini image model is unavailable for the selected project.',
    quota_exceeded: 'This project has no remaining Gemini image quota. Check the project’s tier and limits.',
    rate_limit_exceeded: 'Gemini rate limit reached. Please try again later.',
  }
  const byStatus = {
    400: 'Gemini could not process this request. Check the project’s billing status or report this error to us.',
    401: 'Gemini could not authenticate this key. Check the key in Google AI Studio.',
    402: 'Gemini says this project needs billing credits.',
    403: 'This key or project does not have permission to use Gemini image generation.',
    404: 'The Gemini image model is unavailable for this project.',
    429: 'Gemini quota or rate limit reached. Check the project’s tier and limits.',
  }
  return { error: code && Object.hasOwn(byCode, code) ? byCode[code] : byStatus[response.status] ?? 'Gemini is unavailable. Please try again later.', providerStatus: response.status, ...(code ? { providerCode: code } : {}) }
}

async function readJson(req) {
  const declared = Number(req.headers['content-length'])
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) throw new Error('Request too large.')
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_BODY_BYTES) throw new Error('Request too large.')
    chunks.push(chunk)
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')) } catch { throw new Error('Invalid JSON.') }
}

export function createApp({ provider = fetch, dist = resolve('dist') } = {}) {
  return createServer(async (req, res) => {
    res.setHeader('Referrer-Policy', 'no-referrer')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    const pathname = new URL(req.url, 'http://localhost').pathname
    if (pathname === '/api/generate') {
      if (req.method !== 'POST') return reply(res, 405, { error: 'Method not allowed.' })
      const host = req.headers.host
      let origin
      try { origin = new URL(req.headers.origin) } catch { return reply(res, 403, { error: 'Use Solair to make this request.' }) }
      if (!host || origin.host !== host || !['http:', 'https:'].includes(origin.protocol)) return reply(res, 403, { error: 'Use Solair to make this request.' })
      if (!req.headers['content-type']?.startsWith('application/json')) return reply(res, 415, { error: 'Send JSON.' })
      let body, draft
      try {
        body = await readJson(req)
        if (typeof body.apiKey !== 'string' || !body.apiKey.trim() || body.apiKey.length > 256 || /[\r\n]/.test(body.apiKey)) throw new Error('Enter a valid Gemini API key.')
        draft = parseDraft(body)
      } catch (error) {
        return reply(res, error.message === 'Request too large.' ? 413 : 400, { error: error.message })
      }
      const input = photoViews.flatMap(view => [
        { type: 'text', text: `${view.toUpperCase()} reference photo:` },
        { type: 'image', mime_type: body.photos[view].mimeType, data: body.photos[view].data },
      ])
      input.push({ type: 'text', text: buildPrompt(draft) })
      try {
        const result = await provider(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': body.apiKey.trim() },
          body: JSON.stringify({ model: 'gemini-3.1-flash-image', store: false, input, response_format: { type: 'image', mime_type: 'image/png', aspect_ratio: '1:1', image_size: '1K' } }),
          signal: AbortSignal.timeout(120_000),
        })
        if (!result.ok) {
          return reply(res, 502, await providerFailure(result))
        }
        const image = imageFromResponse(await result.json())
        return image ? reply(res, 200, image) : reply(res, 502, { error: 'Gemini did not return an image. Try again or use the copyable prompt.' })
      } catch {
        return reply(res, 502, { error: 'Could not complete the Gemini request. Try again or use the copyable prompt.' })
      }
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return reply(res, 405, { error: 'Method not allowed.' })
    let file
    try {
      file = resolve(dist, '.' + decodeURIComponent(pathname))
      if (file !== dist && !file.startsWith(dist + sep)) throw new Error('Invalid path')
      if (!(await stat(file)).isFile()) throw new Error('Not a file')
    } catch {
      file = resolve(dist, 'index.html')
    }
    try {
      const bytes = await readFile(file)
      res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' })
      res.end(req.method === 'HEAD' ? undefined : bytes)
    } catch { reply(res, 404, { error: 'Build the site with npm run build first.' }) }
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  createApp().listen(Number(process.env.PORT || 8787), '127.0.0.1', () => {
    process.stdout.write(`Solair API listening on http://127.0.0.1:${process.env.PORT || 8787}\n`)
  })
}
