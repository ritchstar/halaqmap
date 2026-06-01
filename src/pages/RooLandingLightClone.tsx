import LandingPreview from '@/pages/LandingPreview'
import { useSearchParams } from 'react-router-dom'

type LabVariant = 'v1' | 'v2' | 'v3'

const VARIANTS: Array<{ key: LabVariant; label: string; hint: string }> = [
  { key: 'v1', label: 'V1', hint: 'Baseline Light' },
  { key: 'v2', label: 'V2', hint: 'Contrast Balanced' },
  { key: 'v3', label: 'V3', hint: 'Luminous Accent' },
]

function normalizeVariant(value: string | null): LabVariant {
  if (value === 'v2' || value === 'v3') return value
  return 'v1'
}

/**
 * نسخة مختبرية مطابقة لصفحة المنصة الحالية،
 * مع تعديل الخلفية فقط إلى طابع فاتح.
 */
export default function RooLandingLightClone() {
  const [searchParams, setSearchParams] = useSearchParams()
  const variant = normalizeVariant(searchParams.get('v'))

  const setVariant = (next: LabVariant) => {
    const params = new URLSearchParams(searchParams)
    params.set('v', next)
    setSearchParams(params, { replace: true })
  }

  return (
    <div dir="rtl" className={`roo-light-clone roo-lab-${variant}`}>
      <div className="roo-lab-switcher" role="group" aria-label="مختبر نسخ التصميم">
        <p className="roo-lab-switcher-title">مختبر نسخ الهبوط</p>
        <div className="roo-lab-switcher-grid">
          {VARIANTS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setVariant(item.key)}
              className={`roo-lab-switcher-btn ${variant === item.key ? 'is-active' : ''}`}
            >
              <span className="roo-lab-switcher-btn-key">{item.label}</span>
              <span className="roo-lab-switcher-btn-hint">{item.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <LandingPreview />
    </div>
  )
}
