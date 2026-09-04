/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { Link } from 'react-router-dom';
import { STORE_ATLAS_COPY, STORE_ATLAS_SECTORS } from '@/config/storeAtlasTokens';
import { STORE_CONTACT_EMAIL, STORE_FOOTER_CONTACT, STORE_LANDING_COPY, STORE_PUBLIC_NAME_AR } from '@/config/storeFront';
import { STORE_SAIP_COPY } from '@/config/storeSaipRegistry';
import { ROUTE_PATHS } from '@/lib/routePaths';

export function AtlasFooter() {
  return (
    <footer className="border-t border-[var(--atlas-line)] bg-[var(--atlas-raised)] py-10">
      <div className="store-atlas__shell flex flex-col gap-5 text-sm">
        <p className="font-extrabold">{STORE_LANDING_COPY.shopNameAr}</p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 font-bold">
          {STORE_ATLAS_SECTORS.map((sector) => (
            <a key={sector.id} href="#atlas-products">
              {sector.titleAr}
            </a>
          ))}
          <Link to={ROUTE_PATHS.STORE_GENERAL_TRIAL}>{STORE_ATLAS_COPY.headerTrialAr}</Link>
          <Link to={ROUTE_PATHS.STORE_TRUST}>{STORE_ATLAS_COPY.headerWorksAr}</Link>
          <Link to={ROUTE_PATHS.STORE_ISSUED_CARDS_LEGAL}>السياسات</Link>
          <Link to={ROUTE_PATHS.STORE_REQUEST}>{STORE_ATLAS_COPY.headerRequestAr}</Link>
        </nav>
        <p className="text-[var(--atlas-muted)]">
          {STORE_FOOTER_CONTACT.emailLabelAr}: {STORE_CONTACT_EMAIL}
        </p>
        <p className="text-[var(--atlas-muted)]">{STORE_SAIP_COPY.footerLeadAr}</p>
        <p className="text-[var(--atlas-muted)]">حقوق {STORE_PUBLIC_NAME_AR}</p>
      </div>
    </footer>
  );
}
