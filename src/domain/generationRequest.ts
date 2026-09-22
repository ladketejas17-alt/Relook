import type { HairPreferences } from '../components/Preferences'
import { hairstyles } from '../data/hairstyles.ts'

export const photoViews = ['Front', 'Back', 'Left', 'Right'] as const
export type PhotoView = (typeof photoViews)[number]
export type Photos = Partial<Record<PhotoView, File>>

export type HairstyleChoice =
  | { kind: 'preset'; id: string }
  | { kind: 'custom'; description: string }

export type GenerationDraft = {
  photos: Photos
  hairstyle: HairstyleChoice | null
  preferences: HairPreferences
}

export type GenerationRequest = {
  photos: Record<PhotoView, File>
  hairstyle: HairstyleChoice
  preferences: { length: NonNullable<HairPreferences['length']>; texture: NonNullable<HairPreferences['texture']>; color: NonNullable<HairPreferences['color']> }
}

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export function validatePhoto(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as typeof ACCEPTED_IMAGE_TYPES[number])) return 'Choose a JPEG, PNG, or WebP image.'
  if (file.size === 0 || file.size > MAX_PHOTO_BYTES) return 'Choose an image between 1 byte and 10 MB.'
  return null
}

export function createGenerationRequest(draft: GenerationDraft):
  | { ok: true; request: GenerationRequest }
  | { ok: false; errors: string[] } {
  const errors: string[] = []
  for (const view of photoViews) {
    const photo = draft.photos[view]
    if (!photo) errors.push(`Add a ${view.toLowerCase()} photo.`)
    else {
      const error = validatePhoto(photo)
      if (error) errors.push(`${view}: ${error}`)
    }
  }

  const choice = draft.hairstyle
  if (!choice) errors.push('Choose a hairstyle.')
  else if (choice.kind === 'custom') {
    const length = choice.description.trim().length
    if (length < 10 || length > 500) errors.push('Describe your custom hairstyle in 10–500 characters.')
  } else if (!hairstyles.some((style) => style.id === choice.id)) {
    errors.push('Choose an available hairstyle.')
  }
  if (!draft.preferences.length) errors.push('Choose a length.')
  if (!draft.preferences.texture) errors.push('Choose a texture.')
  if (!draft.preferences.color) errors.push('Choose a color.')
  if (errors.length) return { ok: false, errors }

  // Each field has been checked above. Keep the validated shape at the boundary.
  const validChoice = choice!
  return {
    ok: true,
    request: {
      photos: draft.photos as Record<PhotoView, File>,
      hairstyle: validChoice.kind === 'custom'
        ? { kind: 'custom', description: validChoice.description.trim() }
        : validChoice,
      preferences: draft.preferences as GenerationRequest['preferences'],
    },
  }
}
