import { useEffect, useRef, useState } from 'react'
import { Camera, Check, ImagePlus, RotateCcw } from 'lucide-react'
import { photoViews, validatePhoto, type Photos, type PhotoView } from '../domain/generationRequest'

type PhotoUploadProps = {
  photos: Photos
  onChange: (photos: Photos) => void
}

function PhotoPreview({ file, view }: { file: File; view: PhotoView }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    const nextUrl = URL.createObjectURL(file)
    setUrl(nextUrl)
    return () => URL.revokeObjectURL(nextUrl)
  }, [file])
  return url ? <img src={url} alt={`${view} view`} className="h-full w-full object-cover" /> : null
}

export default function PhotoUpload({ photos, onChange }: PhotoUploadProps) {

  const [activeView, setActiveView] = useState<PhotoView>('Front')
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file?: File) => {
    if (!file) return
    const validationError = validatePhoto(file)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)

    const updatedPhotos = {
      ...photos,
      [activeView]: file,
    }

    onChange(updatedPhotos)

    const nextView = photoViews.find((view) => !updatedPhotos[view])

    if (nextView) {
      setActiveView(nextView)
    }
  }

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    handleFile(event.target.files?.[0])

    event.target.value = ''
  }

  const removePhoto = (view: PhotoView) => {
    const updated = { ...photos }
    delete updated[view]
    onChange(updated)
    setError(null)
    setActiveView(view)
  }

  const completedCount = photoViews.filter((view) => photos[view]).length
  const allComplete = completedCount === photoViews.length

  return (
    <section className="w-full">
      <div className="mb-8 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          Your Photos
        </p>

        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          Show Us Your Hair From Every Angle
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-slate-600">
          Upload four clear photos so Solair can understand your head shape
          and create a more accurate hairstyle preview.
        </p>
      </div>

      <div className="mx-auto mb-8 max-w-xl">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">
            {completedCount} of 4 photos added
          </span>

          {allComplete && (
            <span className="flex items-center gap-1 font-semibold text-green-600">
              <Check className="h-4 w-4" />
              Ready
            </span>
          )}
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${completedCount * 25}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {photoViews.map((view) => {
          const photo = photos[view]
          const isActive = activeView === view

          return (
            <div
              key={view}
              className={[
                'overflow-hidden rounded-2xl border-2 bg-white transition',
                isActive
                  ? 'border-blue-500 shadow-md'
                  : 'border-slate-200',
              ].join(' ')}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                {photo ? (
                  <>
                    <PhotoPreview file={photo} view={view} />

                    <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white shadow">
                      <Check className="h-4 w-4" />
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveView(view)
                      fileInputRef.current?.click()
                    }}
                    className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <Camera className="h-7 w-7" />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {view}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Add photo
                      </p>
                    </div>
                  </button>
                )}
              </div>

              {photo && (
                <div className="flex items-center justify-between gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveView(view)
                      fileInputRef.current?.click()
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <ImagePlus className="h-4 w-4" />
                    Replace
                  </button>

                  <button
                    type="button"
                    onClick={() => removePhoto(view)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Retake
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />

      {error && <p role="alert" className="mt-4 text-center text-sm text-red-700">{error}</p>}

      {!allComplete && (
        <p className="mt-6 text-center text-sm text-slate-500">
          Start with your <span className="font-semibold">{activeView}</span>{' '}
          view.
        </p>
      )}

      {allComplete && (
        <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
          <p className="font-semibold text-green-800">
            All four views are ready.
          </p>

          <p className="mt-1 text-sm text-green-700">
            You're ready to choose a hairstyle.
          </p>
        </div>
      )}
    </section>
  )
}
