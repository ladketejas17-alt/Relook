import { Check } from 'lucide-react'

type PreferenceOption = {
  value: string
  label: string
}

type PreferenceSelectorProps = {
  label: string
  options: PreferenceOption[]
  value: string | null
  onChange: (value: string) => void
}

export default function PreferenceSelector({
  label,
  options,
  value,
  onChange,
}: PreferenceSelectorProps) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-slate-900">
        {label}
      </h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {options.map((option) => {
          const selected = value === option.value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={selected}
              className={[
                'flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition',
                selected
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-slate-50',
              ].join(' ')}
            >
              <span className="font-medium">{option.label}</span>

              {selected && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}