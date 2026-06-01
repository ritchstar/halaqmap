import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import RooLanding from '@/pages/RooLanding';
import { ROUTE_PATHS } from '@/lib';
import { buildLabCommunityUrl, buildLabProductionUrl } from '@/lab/labExternalUrls';

function ExternalRedirect({ to }: { to: string }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);

  return (
    <div dir="rtl" className="flex min-h-dvh items-center justify-center bg-slate-950 px-6 text-center text-slate-100">
      جاري التحويل...
    </div>
  );
}

function LabDomainGuard() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const host = window.location.hostname.toLowerCase();
    if (host === 'community.nota-council.com') {
      window.location.replace(buildLabCommunityUrl());
    }
  }, []);

  return null;
}

export default function LabApp() {
  return (
    <HashRouter>
      <LabDomainGuard />
      <Routes>
        <Route path="/" element={<RooLanding />} />
        <Route path={ROUTE_PATHS.ROO_LANDING_LAB} element={<Navigate to="/" replace />} />
        <Route path={ROUTE_PATHS.ABOUT} element={<ExternalRedirect to={buildLabProductionUrl(ROUTE_PATHS.ABOUT)} />} />
        <Route path={ROUTE_PATHS.BARBERS_LANDING} element={<ExternalRedirect to={buildLabProductionUrl(ROUTE_PATHS.BARBERS_LANDING)} />} />
        <Route path={ROUTE_PATHS.PLATFORM_REVIEWS} element={<ExternalRedirect to={buildLabProductionUrl(ROUTE_PATHS.PLATFORM_REVIEWS)} />} />
        <Route path={ROUTE_PATHS.REGISTER} element={<ExternalRedirect to={buildLabProductionUrl(ROUTE_PATHS.REGISTER)} />} />
        <Route path={ROUTE_PATHS.TERMS_OF_SERVICE} element={<ExternalRedirect to={buildLabProductionUrl(ROUTE_PATHS.TERMS_OF_SERVICE)} />} />
        <Route path={ROUTE_PATHS.USER_PRIVACY_POLICY} element={<ExternalRedirect to={buildLabProductionUrl(ROUTE_PATHS.USER_PRIVACY_POLICY)} />} />
        <Route path={ROUTE_PATHS.PRIVACY_DETAILED} element={<ExternalRedirect to={buildLabProductionUrl(ROUTE_PATHS.PRIVACY_DETAILED)} />} />
        <Route path={ROUTE_PATHS.PRIVACY} element={<Navigate to={ROUTE_PATHS.PRIVACY_DETAILED} replace />} />
        <Route path={ROUTE_PATHS.MAP_COMMUNITY} element={<ExternalRedirect to={buildLabCommunityUrl()} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
