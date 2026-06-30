import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib';
import {
  PRICING_POLICY_SECTION_ID,
  REFUND_POLICY_SECTION_ID,
} from '@/config/moyasarMerchantCompliance';

/**
 * يصلح روابط HashRouter القديمة مثل:
 * `/#/partners/subscription-policy#pricing` أو `...%23refund-policy`
 */
export function PolicySectionHashRedirect(): null {
  const navigate = useNavigate();

  useEffect(() => {
    const raw = window.location.hash.slice(1);
    if (!raw) return;

    const embeddedHash = raw.match(
      /^(\/partners\/subscription-policy)#(refund-policy|pricing)$/,
    );
    if (embeddedHash) {
      navigate(`${embeddedHash[1]}?section=${embeddedHash[2]}`, { replace: true });
      return;
    }

    const encodedHash = raw.match(
      /^\/partners\/subscription-policy%23(refund-policy|pricing)$/,
    );
    if (encodedHash) {
      navigate(`${ROUTE_PATHS.SUBSCRIPTION_POLICY}?section=${encodedHash[1]}`, { replace: true });
      return;
    }

    if (raw === '/partners/refund-policy') {
      navigate(`${ROUTE_PATHS.SUBSCRIPTION_POLICY}?section=${REFUND_POLICY_SECTION_ID}`, {
        replace: true,
      });
      return;
    }

    if (raw === '/partners/pricing') {
      navigate(`${ROUTE_PATHS.SUBSCRIPTION_POLICY}?section=${PRICING_POLICY_SECTION_ID}`, {
        replace: true,
      });
    }
  }, [navigate]);

  return null;
}
