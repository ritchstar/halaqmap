import type { ComponentProps } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

export const BARBER_DASHBOARD_OUTBOUND_TARGET = {
  target: '_blank',
  rel: 'noopener noreferrer',
} as const;

export function BarberDashboardOutboundLink({
  target = '_blank',
  rel = 'noopener noreferrer',
  ...props
}: LinkProps) {
  return <Link target={target} rel={rel} {...props} />;
}

export function BarberDashboardOutboundAnchor({
  target = '_blank',
  rel = 'noopener noreferrer',
  ...props
}: ComponentProps<'a'>) {
  return <a target={target} rel={rel} {...props} />;
}
