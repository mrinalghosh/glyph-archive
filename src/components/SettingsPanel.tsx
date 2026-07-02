import { useRef, type Dispatch, type SetStateAction } from 'react'
import type { FontChoice, Projection, Settings, TileSize } from '../types'
import { DEFAULT_SETTINGS, WIRE_COLORS } from '../lib/settings'

interface Props {
  settings: Settings
  setSettings: Dispatch<SetStateAction<Settings>>
  onClose: () => void
  /** Download the user's archive + favorites + settings as a JSON backup. */
  onExport: () => void
  /** Merge a chosen backup file into the user's data. */
  onImport: (file: File) => void
}

/** A labeled group in the settings panel. */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="sfield">
      <div className="slabel">{label}</div>
      {children}
    </div>
  )
}

/** A segmented pick-one control. */
function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button key={o} className={'segbtn' + (o === value ? ' on' : '')} onClick={() => onChange(o)}>
          {o}
        </button>
      ))}
    </div>
  )
}

/** A range slider with a live numeric readout. */
function Slider({
  min,
  max,
  step,
  value,
  onChange,
  format,
}: {
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
  format?: (v: number) => string
}) {
  return (
    <div className="srange">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="sval">{format ? format(value) : value}</span>
    </div>
  )
}

/**
 * The settings drawer. Exposes every tweakable render/display parameter from
 * the design spec, persisted via the parent's Settings state.
 */
export function SettingsPanel({ settings, setSettings, onClose, onExport, onImport }: Props) {
  const set = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }))
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className="panel" role="dialog" aria-label="settings">
      <div className="phead">
        <span>settings</span>
        <button className="pclose" onClick={onClose} title="close">
          ✕
        </button>
      </div>
      <div className="pbody">
        <Field label="display font">
          <Segmented<FontChoice>
            options={['System', 'Mono', 'Serif', 'Sans']}
            value={settings.font}
            onChange={(font) => set({ font })}
          />
        </Field>

        <Field label="tile size">
          <Segmented<TileSize>
            options={['Dense', 'Standard', 'Comfortable']}
            value={settings.tileSize}
            onChange={(tileSize) => set({ tileSize })}
          />
        </Field>

        <Field label="wireframe color">
          <div className="swatches">
            {WIRE_COLORS.map((c) => (
              <button
                key={c.value}
                className={'swatch' + (settings.wireColor === c.value ? ' on' : '')}
                style={{ background: c.value }}
                onClick={() => set({ wireColor: c.value })}
                title={c.label}
                aria-label={c.label}
              />
            ))}
          </div>
        </Field>

        <Field label="density">
          <Slider min={12} max={44} step={1} value={settings.density} onChange={(density) => set({ density })} />
        </Field>

        <Field label="depth">
          <Slider
            min={0.05}
            max={0.6}
            step={0.01}
            value={settings.depth}
            onChange={(depth) => set({ depth })}
            format={(v) => v.toFixed(2)}
          />
        </Field>

        <Field label="projection">
          <Segmented<Projection>
            options={['Perspective', 'Orthographic']}
            value={settings.projection}
            onChange={(projection) => set({ projection })}
          />
        </Field>

        <Field label="auto-rotate">
          <button
            className={'toggle' + (settings.autoRotate ? ' on' : '')}
            onClick={() => set({ autoRotate: !settings.autoRotate })}
            aria-pressed={settings.autoRotate}
          >
            <span className="knob" />
            <span className="tlabel">{settings.autoRotate ? 'on' : 'off'}</span>
          </button>
        </Field>

        <Field label="rotate speed">
          <Slider
            min={0}
            max={1}
            step={0.05}
            value={settings.rotateSpeed}
            onChange={(rotateSpeed) => set({ rotateSpeed })}
            format={(v) => v.toFixed(2)}
          />
        </Field>

        <Field label="data">
          <div className="datarow">
            <button className="preset" onClick={onExport} title="download a JSON backup of your archive">
              export backup
            </button>
            <button
              className="preset"
              onClick={() => fileRef.current?.click()}
              title="merge a JSON backup into your archive"
            >
              import backup
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onImport(file)
              // Reset so choosing the same file again still fires onChange.
              e.target.value = ''
            }}
          />
        </Field>

        <button className="preset" onClick={() => setSettings(DEFAULT_SETTINGS)}>
          reset to defaults
        </button>
      </div>
    </div>
  )
}
