import { useState } from 'react'
import type { GenerationRequest } from '../domain/generationRequest'
import { buildPrompt } from '../domain/buildPrompt'

export default function PromptFallback({ request }: { request: GenerationRequest }) {
  const [message, setMessage] = useState('')
  const prompt = buildPrompt(request)

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setMessage('Prompt copied. Attach your four photos in the same order before submitting it to your AI tool.')
    } catch {
      setMessage('Could not copy automatically. Select the prompt below and copy it manually.')
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-blue-200 bg-white p-6" aria-labelledby="prompt-heading">
      <h3 id="prompt-heading" className="text-lg font-semibold text-slate-900">Use your prompt in an AI image tool</h3>
      <p className="mt-2 text-sm text-slate-600">
        Copy the text, then attach your four photos separately in this order: Front, Back, Left, Right.
        Your photos stay on this device until you choose to upload them to that tool.
      </p>
      <label htmlFor="generated-prompt" className="mt-5 block text-sm font-medium text-slate-900">Your prompt</label>
      <textarea id="generated-prompt" readOnly value={prompt} rows={12} className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-800" />
      <button type="button" onClick={copyPrompt} className="mt-3 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700">
        Copy prompt
      </button>
      {message && <p role="status" className="mt-3 text-sm text-slate-700">{message}</p>}
    </section>
  )
}
