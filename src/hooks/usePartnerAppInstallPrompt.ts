/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useCallback, useEffect, useState } from 'react';
import { isPartnerAppShell } from '@/lib/partnerAppShell';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

/**
 * التقاط beforeinstallprompt لتثبيت PWA تطبيق الصالون من المتصفح.
 */
export function usePartnerAppInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => isPartnerAppShell());
  const [prompting, setPrompting] = useState(false);

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener('beforeinstallprompt', onBip);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBip);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const canPrompt = Boolean(deferred) && !installed;

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferred) return 'unavailable';
    setPrompting(true);
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalled(true);
        setDeferred(null);
      }
      return choice.outcome;
    } catch {
      return 'unavailable';
    } finally {
      setPrompting(false);
    }
  }, [deferred]);

  return {
    canPrompt,
    installed,
    prompting,
    promptInstall,
    isIos:
      typeof navigator !== 'undefined' &&
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !(window.navigator as Navigator & { standalone?: boolean }).standalone,
  };
}
