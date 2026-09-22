import { hairstyles } from '../data/hairstyles.ts'
import type { GenerationRequest } from './generationRequest.ts'

/** Build a text-only prompt. The four photo files remain on the user's device. */
export function buildPrompt(request: GenerationRequest): string {
  const choice = request.hairstyle
  const style = choice.kind === 'preset'
    ? hairstyles.find((item) => item.id === choice.id)?.name
    : choice.description

  if (!style) throw new Error('Choose an available hairstyle before building a prompt.')

  const color = request.preferences.color === 'natural'
    ? 'Preserve my natural hair color as shown in the reference photos.'
    : `Use ${request.preferences.color} hair color.`

  return [
    'Create a realistic hairstyle visualization using the four attached photos of the same person.',
    'I will attach and label the photos in this order: FRONT, BACK, LEFT, RIGHT. Use each photo as the reference for its matching view.',
    'Show the proposed hairstyle from front, back, left, and right in a clear four-panel result, with each panel labeled.',
    'Keep the person’s facial features, skin tone, head shape, and other non-hair features consistent with the references. Do not change their identity.',
    `Hairstyle request: ${style}.`,
    `Length: ${request.preferences.length}. Texture: ${request.preferences.texture}. ${color}`,
    'Apply the requested hairstyle consistently across all four angles. Keep the lighting and background simple so the hair is easy to compare.',
    'If any view cannot be represented faithfully, explain the limitation instead of inventing details.',
  ].join('\n\n')
}
