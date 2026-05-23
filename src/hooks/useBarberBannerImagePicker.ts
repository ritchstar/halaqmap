import { useCallback, useState } from 'react';
import { BARBER_BANNER_IMAGE_ENHANCEMENT_TIPS_AR } from '@/config/barberBannerImagePolicy';
import {
  barberBannerRawFileTooLargeMessage,
  optimizeImageFileForBarberBanner,
} from '@/lib/barberBannerImageOptimization';

export type BarberBannerPickResult =
  | { ok: true; file: File }
  | { ok: false; error: string };

/**
 * منطق رقابة رفع صور بنر الحلاق: معالجة، حد 500KB، ونصائح للحلاق أثناء الرفع.
 */
export function useBarberBannerImagePicker() {
  const [processing, setProcessing] = useState(false);
  const [activeTip, setActiveTip] = useState<string>(() => BARBER_BANNER_IMAGE_ENHANCEMENT_TIPS_AR[0]);

  const rotateTip = useCallback(() => {
    const i = Math.floor(Math.random() * BARBER_BANNER_IMAGE_ENHANCEMENT_TIPS_AR.length);
    setActiveTip(BARBER_BANNER_IMAGE_ENHANCEMENT_TIPS_AR[i]);
  }, []);

  const processBannerFile = useCallback(
    async (file: File | null): Promise<BarberBannerPickResult> => {
      if (!file) return { ok: false, error: 'لم يُحدد ملف.' };
      const rawMsg = barberBannerRawFileTooLargeMessage(file);
      if (rawMsg) return { ok: false, error: rawMsg };
      rotateTip();
      setProcessing(true);
      try {
        const out = await optimizeImageFileForBarberBanner(file);
        return out;
      } finally {
        setProcessing(false);
      }
    },
    [rotateTip]
  );

  return {
    processing,
    activeTip,
    rotateTip,
    processBannerFile,
  };
}
