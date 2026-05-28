import { lazy } from 'react';

/** مرحلة 1 — صفحات ثقيلة فقط؛ الرئيسية و/partners و/radar تبقى eager في App.tsx */
export const AdminLogin = lazy(() => import('@/pages/AdminLogin'));
export const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
export const AdminSentinelPage = lazy(() => import('@/pages/AdminSentinelPage'));
export const AdminRadarFullScreenPage = lazy(() => import('@/app/admin/radar/full-screen/page'));
export const AdminCyberOperationsPage = lazy(() => import('@/app/admin/cyber/page'));
export const StaffHubPage = lazy(() => import('@/app/admin/staff-hub/page'));
export const BarberDashboard = lazy(() => import('@/pages/BarberDashboard'));
export const Register = lazy(() => import('@/pages/Register'));
export const MapCommunity = lazy(() => import('@/pages/MapCommunity'));
export const CosmicShowcase = lazy(() => import('@/pages/CosmicShowcase'));
export const SaudiAgentLanding = lazy(() => import('@/pages/SaudiAgentLanding'));
export const InvoicePreviewSamples = lazy(() => import('@/pages/InvoicePreviewSamples'));
export const InternalPartnerPathPrintCard = lazy(() => import('@/pages/InternalPartnerPathPrintCard'));
