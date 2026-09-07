/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * SEO — عنوان، وصف، JSON-LD لصفحة مسار الشركاء.
 */
import { useEffect } from 'react';
import {
  PARTNER_LANDING_PAGE_META,
  buildPartnerLandingSoftwareRegistrationJsonLd,
} from '@/config/partnerLandingPageCopy';

const JSON_LD_SCRIPT_ID = 'partner-landing-software-registration-jsonld';

export function PartnerLandingSeoHead() {
  useEffect(() => {
    document.title = PARTNER_LANDING_PAGE_META.titleAr;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', PARTNER_LANDING_PAGE_META.descriptionAr);

    let script = document.getElementById(JSON_LD_SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = JSON_LD_SCRIPT_ID;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = buildPartnerLandingSoftwareRegistrationJsonLd();

    return () => {
      script?.remove();
    };
  }, []);

  return null;
}
