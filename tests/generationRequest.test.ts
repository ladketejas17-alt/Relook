import assert from 'node:assert/strict'
import test from 'node:test'
import { createGenerationRequest, type GenerationDraft } from '../src/domain/generationRequest.ts'

const image = () => new File(['image bytes'], 'photo.jpg', { type: 'image/jpeg' })
const complete = (): GenerationDraft => ({
  photos: { Front: image(), Back: image(), Left: image(), Right: image() },
  hairstyle: { kind: 'preset', id: 'pompadour' },
  preferences: { length: 'medium', texture: 'wavy', color: 'natural' },
})

test('accepts four files and a known preset as a structured request', () => {
  const draft = complete()
  const result = createGenerationRequest(draft)
  assert.equal(result.ok, true)
  if (result.ok) {
    assert.equal(result.request.photos.Front, draft.photos.Front)
    assert.deepEqual(result.request.hairstyle, { kind: 'preset', id: 'pompadour' })
  }
})

test('removing a photo makes the request incomplete', () => {
  const draft = complete()
  delete draft.photos.Left
  const result = createGenerationRequest(draft)
  assert.equal(result.ok, false)
  if (!result.ok) assert.ok(result.errors.includes('Add a left photo.'))
})

test('rejects invalid photos and unknown presets', () => {
  const draft = complete()
  draft.photos.Back = new File(['text'], 'bad.txt', { type: 'text/plain' })
  draft.hairstyle = { kind: 'preset', id: 'missing' }
  const result = createGenerationRequest(draft)
  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.ok(result.errors.some((error) => error.startsWith('Back:')))
    assert.ok(result.errors.includes('Choose an available hairstyle.'))
  }
})

test('trims a custom description and rejects whitespace-only input', () => {
  const draft = complete()
  draft.hairstyle = { kind: 'custom', description: '  A layered bob with soft bangs  ' }
  const result = createGenerationRequest(draft)
  assert.equal(result.ok, true)
  if (result.ok) assert.deepEqual(result.request.hairstyle, { kind: 'custom', description: 'A layered bob with soft bangs' })

  draft.hairstyle = { kind: 'custom', description: '       ' }
  assert.equal(createGenerationRequest(draft).ok, false)
})

test('requires every preference', () => {
  const draft = complete()
  draft.preferences.color = null
  const result = createGenerationRequest(draft)
  assert.equal(result.ok, false)
  if (!result.ok) assert.ok(result.errors.includes('Choose a color.'))
})
