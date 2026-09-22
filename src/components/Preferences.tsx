import PreferenceSelector from './PreferenceSelector'

export type HairPreferences = {
  length: 'short' | 'medium' | 'long' | null
  texture: 'straight' | 'wavy' | 'curly' | 'coily' | null
  color: 'natural' | 'black' | 'brown' | 'blonde' | 'red' | null
}

type Props = {
  value: HairPreferences
  onChange: (value: HairPreferences) => void
}

export default function Preferences({ value, onChange }: Props) {
  return (
    <div className="space-y-8">
      <PreferenceSelector label="Length" value={value.length} onChange={(length) => onChange({ ...value, length: length as HairPreferences['length'] })} options={[
        { value: 'short', label: 'Short' }, { value: 'medium', label: 'Medium' }, { value: 'long', label: 'Long' },
      ]} />
      <PreferenceSelector label="Texture" value={value.texture} onChange={(texture) => onChange({ ...value, texture: texture as HairPreferences['texture'] })} options={[
        { value: 'straight', label: 'Straight' }, { value: 'wavy', label: 'Wavy' }, { value: 'curly', label: 'Curly' }, { value: 'coily', label: 'Coily' },
      ]} />
      <PreferenceSelector label="Color" value={value.color} onChange={(color) => onChange({ ...value, color: color as HairPreferences['color'] })} options={[
        { value: 'natural', label: 'Keep my natural color' }, { value: 'black', label: 'Black' }, { value: 'brown', label: 'Brown' }, { value: 'blonde', label: 'Blonde' }, { value: 'red', label: 'Red' },
      ]} />
    </div>
  )
}
