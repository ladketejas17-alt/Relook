import ViewSlider from './ViewSlider'
import type { Hairstyle } from '../data/hairstyles'
import { Check } from 'lucide-react'

type HairstyleCardProps = {
  hairstyle: Hairstyle
  selected?: boolean
  onSelect?: (hairstyle: Hairstyle) => void
}

export default function HairstyleCard({
  hairstyle,
  selected = false,
  onSelect,
}: HairstyleCardProps) {
  return (
    <article
      className={[
        'overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition',
        selected
          ? 'border-blue-600 shadow-md'
          : 'border-slate-200 hover:border-blue-200 hover:shadow-md',
      ].join(' ')}
    >
      <div className="p-4">
        <ViewSlider image={hairstyle.src} />
      </div>

      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {hairstyle.name}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="capitalize">{hairstyle.gender}</span>
              <span>•</span>
              <span className="capitalize">{hairstyle.category}</span>
              <span>•</span>
              <span className="capitalize">{hairstyle.length}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelect?.(hairstyle)}
            aria-pressed={selected}
            className={[
              'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition',
              selected
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100',
            ].join(' ')}
          >
            {selected && <Check className="h-4 w-4" />}
            {selected ? 'Selected' : 'Select'}
          </button>
        </div>
      </div>
    </article>
  )
}