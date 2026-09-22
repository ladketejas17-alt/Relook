import assert from 'node:assert/strict'
import test from 'node:test'
import { buildPrompt } from '../src/domain/buildPrompt.ts'
import type { GenerationRequest } from '../src/domain/generationRequest.ts'

const photo = (name: string) => new File(['image'], name, { type: 'image/jpeg' })
const request = (): GenerationRequest => ({
  photos: {
    Front: photo('private-front.jpg'),
    Back: photo('private-back.jpg'),
    Left: photo('private-left.jpg'),
    Right: photo('private-right.jpg'),
  },
  hairstyle: { kind: 'preset', id: 'pompadour' },
  preferences: { length: 'medium', texture: 'wavy', color: 'natural' },
})

test('builds a four-view prompt without including photo names or bytes', () => {
  const prompt = buildPrompt(request())
  assert.match(prompt, /Pompadour/)
  assert.match(prompt, /FRONT, BACK, LEFT, RIGHT/)
  assert.match(prompt, /Preserve my natural hair color/)
  assert.doesNotMatch(prompt, /private-front|image bytes/)
})

test('uses custom description and explicit color', () => {
  const input = request()
  input.hairstyle = { kind: 'custom', description: 'A layered bob with soft bangs' }
  input.preferences.color = 'brown'
  const prompt = buildPrompt(input)
  assert.match(prompt, /A layered bob with soft bangs/)
  assert.match(prompt, /Use brown hair color/)
  assert.doesNotMatch(prompt, /Pompadour/)
})

test('rejects an unknown preset even if called without request validation', () => {
  const input = request()
  input.hairstyle = { kind: 'preset', id: 'missing' }
  assert.throws(() => buildPrompt(input), /available hairstyle/)
})
