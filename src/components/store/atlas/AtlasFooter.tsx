/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { Link } from 'react-router-dom';
import { STORE_ATLAS_COPY, STORE_ATLAS_SECTORS, STORE_ATLAS_SERVICES } from '@/config/storeAtlasTokens';
import { STORE_CONTACT_EMAIL, STORE_FOOTER_CONTACT, STORE_LANDING_COPY, STORE_PUBLIC_NAME_AR } from '@/config/storeFront';
import { STORE_SAIP_COPY } from '@/config/storeSaipRegistry';
import { ROUTE_PATHS } from '@/lib/routePaths';

export function AtlasFooter() {
  return (
    <footer className="store-atlas__footer border-t border-[var(--atlas-line)] py-10">
      <div className="store-atlas__shell">
        <div className="store-atlas__footer-grid text-sm">
          <div>
            <p className="font-extrabold">{STORE_ATLAS_COPY.footerIntroAr}</p>
            <p className="mt-2 font-extrabold">{STORE_LANDING_COPY.shopNameAr}</p>
            <p className="mt-2 text-[var(--atlas-muted)]">{STORE_ATLAS_COPY.footerIntroLeadAr}</p>
          </div>
          <nav>
            <p className="font-extrabold">{STORE_ATLAS_COPY.footerProductsAr}</p>
            <ul className="mt-2 space-y-2 font-bold">
              {STORE_ATLAS_SECTORS.map((sector) => (
                <li key={sector.id}>
                  <a href="#atlas-products">{sector.titleAr}</a>
                </li>
              ))}
            </ul>
          </nav>
          <nav>
            <p className="font-extrabold">{STORE_ATLAS_COPY.footerTrialServicesAr}</p>
            <ul className="mt-2 space-y-2 font-bold">
              <li>
                <Link to={ROUTE_PATHS.STORE_GENERAL_TRIAL}>{STORE_ATLAS_COPY.headerTrialAr}</Link>
              </li>
              <li>
                <Link to={ROUTE_PATHS.STORE_REQUEST}>{STORE_ATLAS_COPY.headerRequestAr}</Link>
              </li>
              {STORE_ATLAS_SERVICES.map((item) => (
                <li key={item.id}>
                  <a href={item.href}>{item.nameAr}</a>
                </li>
              ))}
            </ul>
          </nav>
          <nav>
            <p className="font-extrabold">{STORE_ATLAS_COPY.footerLegalAr}</p>
            <ul className="mt-2 space-y-2 font-bold">
              <li>
                <Link to={ROUTE_PATHS.STORE_TRUST}>{STORE_ATLAS_COPY.headerWorksAr}</Link>
              </li>
              <li>
                <Link to={ROUTE_PATHS.STORE_ISSUED_CARDS_LEGAL}>السياسات</Link>
              </li>
            </ul>
          </nav>
          <div>
            <p className="font-extrabold">{STORE_ATLAS_COPY.footerContactAr}</p>
            <p className="mt-2 text-[var(--atlas-muted)]">
              {STORE_FOOTER_CONTACT.emailLabelAr}: {STORE_CONTACT_EMAIL}
            </p>
          </div>
        </div>
        <p className="mt-8 text-sm text-[var(--atlas-muted)]">{STORE_SAIP_COPY.footerLeadAr}</p>
        <p className="mt-2 text-sm text-[var(--atlas-muted)]">حقوق {STORE_PUBLIC_NAME_AR}</p>
      </div>
    </footer>
  );
}
