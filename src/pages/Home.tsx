import React, { useMemo, useState } from 'react'
import { Camera, Eye, Palette, Sparkles } from 'lucide-react'

import Header from '../components/Header'
import PhotoUpload from '../components/PhotoUpload'
import HairstyleCard from '../components/HairstyleCard'
import { hairstyles } from '../data/hairstyles'
import Preferences, { type HairPreferences } from '../components/Preferences'
import PromptFallback from '../components/PromptFallback'
import GenerateLook from '../components/GenerateLook'
import { createGenerationRequest, photoViews, type HairstyleChoice, type Photos } from '../domain/generationRequest'

export default function Home() {
  const [hairstyleChoice, setHairstyleChoice] = useState<HairstyleChoice | null>(null)
  const [customDescription, setCustomDescription] = useState('')

  const [photos, setPhotos] = useState<Photos>({})
  const [preferences, setPreferences] = useState<HairPreferences>({ length: null, texture: null, color: null })

  const customSelected = hairstyleChoice?.kind === 'custom'
  const selectedHairstyle = hairstyleChoice?.kind === 'preset' ? hairstyleChoice.id : null
  const selectedHairstyleData = hairstyles.find(
    (hairstyle) => hairstyle.id === selectedHairstyle,
  )
  const customText = customDescription.trim()
  const customValid = customText.length >= 10 && customText.length <= 500
  const photosReady = photoViews.every((view) => Boolean(photos[view]))
  const missingViews = photoViews.filter((view) => !photos[view])
  const styleSelected = Boolean(hairstyleChoice)
  const requestResult = useMemo(() => createGenerationRequest({ photos, hairstyle: hairstyleChoice, preferences }), [photos, hairstyleChoice, preferences])
  const requestReady = requestResult.ok

  return (
    <div className="bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white via-slate-50 to-white py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Hero Text */}
            <div>
              <h1 className="mb-6 text-5xl font-bold leading-tight text-slate-900 sm:text-6xl">
                See Your Hairstyle Before You Cut It
              </h1>

              <p className="mb-8 text-lg leading-relaxed text-slate-600">
                Capture four angles of your head—front, back, left, right.
                Visualize any hairstyle on your complete head shape. Bring
                confidence to your next appointment.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => document.getElementById('photos')?.scrollIntoView({ behavior: 'smooth' })}
                  className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Try Solair
                </button>
              </div>
            </div>

            {/* Hero Visual - 4 View Representation */}
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-sm">
                <div className="flex items-center justify-center">
                  <div className="grid w-full grid-cols-2 gap-4">
                    {/* Front */}
                    <div className="relative flex min-h-48 flex-col items-center justify-center rounded-xl border-2 border-blue-300 bg-blue-50 p-6">
                      <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                        1
                      </div>

                      <Camera className="mb-3 h-10 w-10 text-blue-600" />

                      <span className="font-semibold text-slate-900">
                        Front
                      </span>

                      <span className="mt-1 text-xs text-slate-500">
                        Face-on view
                      </span>
                    </div>

                    {/* Back */}
                    <div className="relative flex min-h-48 flex-col items-center justify-center rounded-xl border-2 border-orange-300 bg-orange-50 p-6">
                      <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                        2
                      </div>

                      <Camera className="mb-3 h-10 w-10 text-orange-500" />

                      <span className="font-semibold text-slate-900">
                        Back
                      </span>

                      <span className="mt-1 text-xs text-slate-500">
                        Rear view
                      </span>
                    </div>

                    {/* Left */}
                    <div className="relative flex min-h-48 flex-col items-center justify-center rounded-xl border-2 border-blue-300 bg-blue-50 p-6">
                      <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                        3
                      </div>

                      <Camera className="mb-3 h-10 w-10 text-blue-600" />

                      <span className="font-semibold text-slate-900">
                        Left
                      </span>

                      <span className="mt-1 text-xs text-slate-500">
                        Side profile
                      </span>
                    </div>

                    {/* Right */}
                    <div className="relative flex min-h-48 flex-col items-center justify-center rounded-xl border-2 border-orange-300 bg-orange-50 p-6">
                      <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                        4
                      </div>

                      <Camera className="mb-3 h-10 w-10 text-orange-500" />

                      <span className="font-semibold text-slate-900">
                        Right
                      </span>

                      <span className="mt-1 text-xs text-slate-500">
                        Side profile
                      </span>
                    </div>
                  </div>
                </div>

                {/* Center Label */}
                <div className="mt-8 text-center">
                  <div className="inline-block rounded-lg border border-slate-200 bg-slate-100 px-4 py-2">
                    <span className="text-sm font-medium text-slate-700">
                      360° Head Shape Understanding
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Solair Works */}
      <section id="how-it-works" className="bg-white py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
              How Solair Works
            </h2>

            <p className="text-lg text-slate-600">
              Three simple steps to your perfect hairstyle
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                1
              </div>

              <h3 className="mb-3 text-xl font-semibold text-slate-900">
                Capture 4 Views
              </h3>

              <p className="text-slate-600">
                Take photos of your head from the front, back, left, and right
                angles using your phone camera.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 font-bold text-white">
                2
              </div>

              <h3 className="mb-3 text-xl font-semibold text-slate-900">
                Choose Your Hairstyle
              </h3>

              <p className="text-slate-600">
                Browse our library of professional hairstyles, filter by
                length and style, or describe your vision.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                3
              </div>

              <h3 className="mb-3 text-xl font-semibold text-slate-900">
                Visualize Your Look
              </h3>

              <p className="text-slate-600">
                Preview how the new hairstyle could look. Bring the
                visualization to your stylist.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why 4 Views */}
      <section id="why-4-views" className="bg-slate-50 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
              Why Four Views Matter
            </h2>

            <p className="text-lg text-slate-600">
              Understanding complete head geometry
            </p>
          </div>

          <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Complete Picture */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="text-center">
                <Eye className="mx-auto mb-4 h-8 w-8 text-blue-600" />

                <h3 className="mb-2 font-semibold text-slate-900">
                  Complete Picture
                </h3>

                <p className="text-sm text-slate-600">
                  See how the back and sides look
                </p>
              </div>
            </div>

            {/* Better Choices */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="text-center">
                <Palette className="mx-auto mb-4 h-8 w-8 text-orange-500" />

                <h3 className="mb-2 font-semibold text-slate-900">
                  Better Choices
                </h3>

                <p className="text-sm text-slate-600">
                  Pick styles that work for you
                </p>
              </div>
            </div>

            {/* Clear Communication */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="text-center">
                <Sparkles className="mx-auto mb-4 h-8 w-8 text-blue-600" />

                <h3 className="mb-2 font-semibold text-slate-900">
                  Clear Communication
                </h3>

                <p className="text-sm text-slate-600">
                  Show your stylist exactly what you want
                </p>
              </div>
            </div>

            {/* Confidence */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="text-center">
                <Camera className="mx-auto mb-4 h-8 w-8 text-orange-500" />

                <h3 className="mb-2 font-semibold text-slate-900">
                  Confidence
                </h3>

                <p className="text-sm text-slate-600">
                  Know exactly what to expect
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-orange-50 p-8">
            <p className="text-center leading-relaxed text-slate-700">
              A single selfie doesn't show the complete picture. Your head has
              depth, curves, and angles that matter for a great haircut. With
              front, back, left, and right views, Solair understands your
              complete head shape—so you can make confident choices.
            </p>
          </div>
        </div>
      </section>

      {/* Photo Upload */}
      <section id="photos" className="bg-slate-50 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PhotoUpload photos={photos} onChange={setPhotos} />
        </div>
      </section>

      {/* Hairstyle Discovery */}
      <section id="hairstyles" className="bg-white py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
              Explore Hairstyles
            </h2>

            <p className="text-lg text-slate-600">
              Explore styles from every angle.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {hairstyles.map((hairstyle) => (
              <HairstyleCard
                key={hairstyle.id}
                hairstyle={hairstyle}
                selected={selectedHairstyle === hairstyle.id}
                onSelect={(selected) => {
                  setHairstyleChoice((current) =>
                    current?.kind === 'preset' && current.id === selected.id
                      ? null : { kind: 'preset', id: selected.id },
                  )
                  setPreferences({ length: null, texture: null, color: null })
                }}
              />
            ))}
          </div>

          <div className={`mt-8 rounded-2xl border-2 bg-white p-6 ${customSelected ? 'border-blue-600' : 'border-slate-200'}`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-900">Have a style in mind?</h3>
                <p className="mt-1 text-sm text-slate-600">Describe your own haircut instead of choosing a preset.</p>
              </div>
              <button type="button" aria-pressed={customSelected} onClick={() => {
                setHairstyleChoice((current) => current?.kind === 'custom'
                  ? null : { kind: 'custom', description: customDescription })
              }} className={`rounded-full px-4 py-2 text-sm font-semibold ${customSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'}`}>
                {customSelected ? 'Custom style selected' : 'Choose custom style'}
              </button>
            </div>
            {customSelected && (
              <div className="mt-5">
                <label htmlFor="custom-style" className="block text-sm font-medium text-slate-900">Describe your hairstyle</label>
                <p id="custom-style-help" className="mt-1 text-sm text-slate-500">Mention the cut, shape, fringe, or details you want. Use 10–500 characters.</p>
                <textarea id="custom-style" aria-describedby="custom-style-help custom-style-count" aria-invalid={customText.length > 0 && !customValid} value={customDescription} onChange={(event) => {
                  setCustomDescription(event.target.value)
                  setHairstyleChoice({ kind: 'custom', description: event.target.value })
                }} maxLength={500} rows={4} placeholder="e.g. Messy wolf cut with curtain bangs and tapered volume" className="mt-3 w-full rounded-xl border border-slate-300 p-3 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                <p id="custom-style-count" className="mt-1 text-sm text-slate-500">{customText.length}/500 characters {customText.length > 0 && !customValid ? '— add more detail' : ''}</p>
              </div>
            )}
          </div>

          {/* Selected Hairstyle */}
          {selectedHairstyleData && (
            <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
              <p className="text-sm text-blue-800">
                Selected hairstyle:{' '}
                <span className="font-semibold">
                  {selectedHairstyleData.name}
                </span>
              </p>
            </div>
          )}

          <p className="mt-8 text-center text-sm text-slate-500">
            More hairstyles will be added to the library.
          </p>
        </div>
      </section>

      <section id="preferences" className="bg-slate-50 py-20 sm:py-28" aria-labelledby="preferences-heading">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 id="preferences-heading" className="text-3xl font-bold text-slate-900">Make this look yours</h2>
          <p className="mb-8 mt-3 text-slate-600">Choose a preset or describe your own hairstyle, then personalize the result.</p>
          {styleSelected ? (
            <>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
                <p className="mb-6 text-sm font-semibold text-blue-700">Selected: {customSelected ? 'Custom hairstyle' : selectedHairstyleData?.name}</p>
                <Preferences value={preferences} onChange={setPreferences} />
              </div>
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6" aria-live="polite">
                <h3 className="font-semibold text-slate-900">Review your choices</h3>
                <dl className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                  <div><dt className="inline font-medium">Style: </dt><dd className="inline">{customSelected ? 'Custom hairstyle' : selectedHairstyleData?.name}</dd></div>
                  {customSelected && <div className="sm:col-span-2"><dt className="font-medium">Your description:</dt><dd className="mt-1 whitespace-pre-wrap break-words">{customText || 'Describe your hairstyle above'}</dd></div>}
                  <div><dt className="inline font-medium">Photos: </dt><dd className="inline">{photosReady ? '4 of 4 ready' : `${4 - missingViews.length} of 4 added — ${missingViews.join(', ')} missing`}</dd></div>
                  <div><dt className="inline font-medium">Length: </dt><dd className="inline capitalize">{preferences.length ?? 'Choose a length'}</dd></div>
                  <div><dt className="inline font-medium">Texture: </dt><dd className="inline capitalize">{preferences.texture ?? 'Choose a texture'}</dd></div>
                  <div><dt className="inline font-medium">Color: </dt><dd className="inline capitalize">{preferences.color === 'natural' ? 'Keep my natural color' : preferences.color ?? 'Choose a color'}</dd></div>
                </dl>
                <p className="mt-5 text-sm text-slate-500">
                  {requestReady
                    ? 'Your request is ready. Generate a look or copy your prompt below.'
                    : requestResult.errors.join(' ')}
                </p>
              </div>
              {requestResult.ok && <><GenerateLook request={requestResult.request} /><PromptFallback key={`${requestResult.request.hairstyle.kind}-${customText}-${preferences.length}-${preferences.texture}-${preferences.color}`} request={requestResult.request} /></>}
            </>
          ) : <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">Select a preset or choose a custom hairstyle above to get started.</p>}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-20 sm:py-32">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl">
            Ready to Visualize Your New Look?
          </h2>

          <p className="mb-8 text-lg text-blue-100">
            See your hairstyle before you cut it. Capture four angles, explore
            styles, and bring confidence to your next appointment.
          </p>

          <button
            type="button"
            onClick={() => document.getElementById('photos')?.scrollIntoView({ behavior: 'smooth' })}
            className="rounded-lg bg-white px-8 py-3 text-lg font-semibold text-blue-600 transition-colors hover:bg-blue-50"
          >
            Try Solair Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 text-slate-300">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm sm:px-6 lg:px-8">
          <p>&copy; 2026 Solair. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
