import { useEffect, useState } from 'react';
import { getPlatformVatSettings, type PlatformVatSettings } from '@/lib/platformVatSettings';

export function usePlatformVatSettings(): PlatformVatSettings {
  const [s, setS] = useState<PlatformVatSettings>(() => getPlatformVatSettings());

  useEffect(() => {
    const onChange = () => setS(getPlatformVatSettings());
    window.addEventListener('halaqmap-vat-settings', onChange);
    return () => window.removeEventListener('halaqmap-vat-settings', onChange);
  }, []);

  return s;
}
