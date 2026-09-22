import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type ViewKey = 'Front' | 'Back' | 'Left' | 'Right'

const views: ViewKey[] = ['Front', 'Back', 'Left', 'Right']

const viewConfig: Record<
  ViewKey,
  { label: string; position: string }
> = {
  Front: {
    label: 'Front',
    position: '6% 21%',
  },
  Back: {
    label: 'Back',
    position: '94% 21%',
  },
  Left: {
    label: 'Left',
    position: '6% 89%',
  },
  Right: {
    label: 'Right',
    position: '94% 89%',
  },
}

type ViewSliderProps = {
  image: string
}

export default function ViewSlider({ image }: ViewSliderProps) {
  const [currentView, setCurrentView] = useState<ViewKey>('Front')

  const currentIndex = views.indexOf(currentView)

  const goTo = (direction: number) => {
    const nextIndex =
      (currentIndex + direction + views.length) % views.length

    setCurrentView(views[nextIndex])
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
          View
        </p>

        <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
          {viewConfig[currentView].label}
        </div>
      </div>

      <div className="relative aspect-[0.9] overflow-hidden rounded-xl bg-slate-100">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("${image}")`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: '215% 287%',
            backgroundPosition: viewConfig[currentView].position,
          }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <button
          type="button"
          aria-label="Previous view"
          onClick={() => goTo(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-blue-200 hover:text-blue-600"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center justify-center gap-2">
          {views.map((view) => (
            <button
              key={view}
              type="button"
              aria-label={`Show ${view}`}
              onClick={() => setCurrentView(view)}
              className={[
                'h-2.5 w-2.5 rounded-full transition',
                currentView === view
                  ? 'bg-blue-600'
                  : 'bg-slate-300',
              ].join(' ')}
            />
          ))}
        </div>

        <button
          type="button"
          aria-label="Next view"
          onClick={() => goTo(1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-blue-200 hover:text-blue-600"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}