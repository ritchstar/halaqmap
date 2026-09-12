/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * اختيار توصيل/استلام — أعلى الرف في تجربة جار الحي.
 */
import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

export type NeighborServiceOption = {
  id: string;
  labelAr: string;
};

export function NeighborServiceBar({
  label = 'طريقة الاستلام',
  value,
  options,
  accent,
  onChange,
  hint,
}: {
  label?: string;
  value: string;
  options: readonly NeighborServiceOption[];
  accent: string;
  onChange: (id: string) => void;
  hint?: string;
}) {
  return (
    <div id="neighbor-service-bar" className="neighbor-service-bar">
      <p className="neighbor-service-bar__label">{label}</p>
      <div className="neighbor-service-bar__options" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              'neighbor-service-bar__chip',
              value === option.id && 'neighbor-service-bar__chip--active',
            )}
            style={value === option.id ? ({ '--neighbor-accent': accent } as CSSProperties) : undefined}
            aria-pressed={value === option.id}
          >
            {option.labelAr}
          </button>
        ))}
      </div>
      {hint ? <p className="neighbor-service-bar__hint">{hint}</p> : null}
    </div>
  );
}

export function NeighborServiceSummary({
  value,
  options,
}: {
  value: string;
  options: readonly NeighborServiceOption[];
}) {
  const active = options.find((option) => option.id === value);
  if (!active) return null;

  function scrollToServiceBar() {
    document.getElementById('neighbor-service-bar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <p className="neighbor-service-summary">
      طريقة الاستلام: <span className="neighbor-service-summary__value">{active.labelAr}</span>
      {' · '}
      <button type="button" onClick={scrollToServiceBar} className="neighbor-service-summary__link">
        تغيير
      </button>
    </p>
  );
}
