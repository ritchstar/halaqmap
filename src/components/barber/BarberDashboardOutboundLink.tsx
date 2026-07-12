import type { ComponentProps } from 'react';
import { Link, type LinkProps, type To } from 'react-router-dom';

export const BARBER_DASHBOARD_OUTBOUND_TARGET = {
  target: '_blank',
  rel: 'noopener noreferrer',
} as const;

function hashRoutePathFromTo(to: To): string {
  if (typeof to === 'string') return to.startsWith('/') ? to : `/${to}`;
  const pathname = to.pathname ?? '';
  const search = typeof to.search === 'string' ? to.search : '';
  const hash = typeof to.hash === 'string' ? to.hash : '';
  return `${pathname}${search}${hash}` || '/';
}

/**
 * يستخرج مسار HashRouter من رابط نسبي أو مطلق.
 * مهم: `buildShopOpenManageHashLink` يعيد `https://…/#/partners/shop-open?t=…`
 * ولفّه مرة ثانية كان يُنتج `#/https://…` فيختفي معامل t وتفشل صفحة التبديل.
 */
export function extractHashAppPath(href: string): string | null {
  const trimmed = href.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('/#')) {
    const rest = trimmed.slice(2);
    return rest.startsWith('/') ? rest : `/${rest}`;
  }
  if (trimmed.startsWith('#/')) return trimmed.slice(1);
  if (trimmed.startsWith('#')) {
    const rest = trimmed.slice(1);
    return rest.startsWith('/') ? rest : `/${rest}`;
  }
  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const u = new URL(trimmed);
      const h = u.hash || '';
      if (h.startsWith('#/')) return h.slice(1);
      if (h.length > 1) {
        const rest = h.slice(1);
        return rest.startsWith('/') ? rest : `/${rest}`;
      }
      return null;
    }
  } catch {
    /* ignore */
  }
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;
  return null;
}

function absoluteHashRouteUrl(relativePath: string): string {
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://www.halaqmap.com';
  return `${origin.replace(/\/+$/, '')}/#${path}`;
}

/**
 * يفتح مسار HashRouter في تبويب جديد ويبقي لوحة التحكم دون تنقل.
 * لا يُمرَّر noopener في features — يجعل window.open يُرجع null حتى عند النجاح.
 */
export function openHashRouteInNewTab(relativePath: string): boolean {
  if (typeof window === 'undefined') return false;
  const w = window.open(absoluteHashRouteUrl(relativePath), '_blank');
  if (!w) return false;
  w.opener = null;
  return true;
}

export function BarberDashboardOutboundLink({
  target = '_blank',
  rel = 'noopener noreferrer',
  to,
  onClick,
  ...props
}: LinkProps) {
  if (target === '_blank') {
    const path = hashRoutePathFromTo(to);
    return (
      <a
        href={absoluteHashRouteUrl(path)}
        target={target}
        rel={rel}
        onClick={(e) => {
          e.preventDefault();
          openHashRouteInNewTab(path);
          onClick?.(e);
        }}
        {...(props as ComponentProps<'a'>)}
      />
    );
  }
  return <Link to={to} target={target} rel={rel} onClick={onClick} {...props} />;
}

export function BarberDashboardOutboundAnchor({
  target = '_blank',
  rel = 'noopener noreferrer',
  href,
  onClick,
  ...props
}: ComponentProps<'a'>) {
  if (target === '_blank' && href && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
    const routePath = extractHashAppPath(href);
    if (routePath) {
      return (
        <a
          href={absoluteHashRouteUrl(routePath)}
          target={target}
          rel={rel}
          onClick={(e) => {
            e.preventDefault();
            openHashRouteInNewTab(routePath);
            onClick?.(e);
          }}
          {...props}
        />
      );
    }
  }
  return <a href={href} target={target} rel={rel} onClick={onClick} {...props} />;
}
