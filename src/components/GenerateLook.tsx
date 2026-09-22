import { useEffect, useRef, useState } from 'react'
import { photoViews, type GenerationRequest } from '../domain/generationRequest'

type GeneratedImage = { mimeType: string; data: string }

async function encode(file: File): Promise<string> {
  const url = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read a photo. Please replace it and try again.'))
    reader.readAsDataURL(file)
  })
  return url.slice(url.indexOf(',') + 1)
}

export default function GenerateLook({ request }: { request: GenerationRequest }) {
  const [key, setKey] = useState('')
  const [image, setImage] = useState<GeneratedImage | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const controller = useRef<AbortController | null>(null)

  useEffect(() => {
    controller.current?.abort()
    setImage(null)
    setError('')
    setBusy(false)
    return () => controller.current?.abort()
  }, [request])

  const generate = async () => {
    if (!key.trim() || busy) return
    const abort = new AbortController()
    controller.current = abort
    setBusy(true)
    setImage(null)
    setError('')
    try {
      const photos = Object.fromEntries(await Promise.all(photoViews.map(async view => [view, {
        mimeType: request.photos[view].type,
        data: await encode(request.photos[view]),
      }])))
      if (abort.signal.aborted) return
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key.trim(), photos, hairstyle: request.hairstyle, preferences: request.preferences }),
        signal: abort.signal,
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(typeof payload.error === 'string' ? payload.error : 'Generation failed. Try again.')
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(payload.mimeType) || typeof payload.data !== 'string') throw new Error('Gemini returned an unexpected image.')
      if (!abort.signal.aborted) setImage(payload)
    } catch (cause) {
      if (!abort.signal.aborted) setError(cause instanceof Error ? cause.message : 'Generation failed. Try again.')
    } finally {
      if (!abort.signal.aborted) setBusy(false)
    }
  }

  const imageUrl = image && `data:${image.mimeType};base64,${image.data}`

  return <section className="mt-6 rounded-2xl border border-blue-200 bg-white p-6" aria-labelledby="generate-heading">
    <h3 id="generate-heading" className="text-lg font-semibold text-slate-900">Generate your look with Gemini</h3>
    <p className="mt-2 text-sm text-slate-600">Use your own Gemini API key. When you generate, Solair sends the key and your four photos through its server to Google for this request. We do not save them in your browser storage or on the Solair server. Google may charge your project for the generation.</p>
    <label htmlFor="gemini-key" className="mt-5 block text-sm font-medium text-slate-900">Your Gemini API key</label>
    <input id="gemini-key" type="password" autoComplete="off" value={key} onChange={event => setKey(event.target.value)} placeholder="Paste your key" className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-slate-900" />
    <button type="button" disabled={!key.trim() || busy} onClick={generate} className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Generating…' : 'Generate look'}</button>
    <div aria-live="polite">{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}{busy && <p className="mt-3 text-sm text-slate-600">This may take a minute. Keep this tab open.</p>}</div>
    {imageUrl && <div className="mt-6"><h4 className="font-semibold text-slate-900">Your preview</h4><p className="mb-3 text-sm text-slate-600">AI previews can differ from the final haircut. Check each angle before showing your stylist.</p><img src={imageUrl} alt="AI generated four-view hairstyle preview" className="w-full rounded-xl border border-slate-200" /><a href={imageUrl} download={`solair-preview.${image?.mimeType === 'image/jpeg' ? 'jpg' : image?.mimeType === 'image/webp' ? 'webp' : 'png'}`} className="mt-3 inline-block rounded-lg border border-blue-600 px-5 py-2 text-sm font-semibold text-blue-700">Download preview</a></div>}
  </section>
}
