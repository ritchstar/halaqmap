/**
 * توجيه واجهة المتجر إلى store.halaqmap.com دون سحب الشؤون القانونية إلى App.
 */
import assert from 'node:assert/strict';
import { ROUTE_PATHS } from '../src/lib/routePaths.ts';
import {
  isHalaqmapStoreHost,
  isStoreHostPaymentPath,
  resolveMensHostStoreRedirect,
} from '../src/lib/storeHostRedirect.ts';

assert.equal(isHalaqmapStoreHost('store.halaqmap.com'), true);
assert.equal(isHalaqmapStoreHost('www.halaqmap.com'), false);
assert.equal(isStoreHostPaymentPath(ROUTE_PATHS.PAYMENT), true);
assert.equal(isStoreHostPaymentPath(ROUTE_PATHS.STORE_LANDING), false);

assert.equal(
  resolveMensHostStoreRedirect({
    host: 'www.halaqmap.com',
    hashPath: ROUTE_PATHS.STORE_LANDING,
  }),
  'https://store.halaqmap.com/#/store',
);

assert.equal(
  resolveMensHostStoreRedirect({
    host: 'www.halaqmap.com',
    hashPath: ROUTE_PATHS.STORE_CARDS,
    hashSearch: '?kind=national_day',
  }),
  'https://store.halaqmap.com/#/store/cards?kind=national_day',
);

assert.equal(
  resolveMensHostStoreRedirect({
    host: 'www.halaqmap.com',
    hashPath: ROUTE_PATHS.STORE_ABOUT,
  }),
  'https://store.halaqmap.com/#/store/about',
);

assert.equal(
  resolveMensHostStoreRedirect({
    host: 'www.halaqmap.com',
    hashPath: ROUTE_PATHS.HOME,
  }),
  null,
);

assert.equal(
  resolveMensHostStoreRedirect({
    host: 'store.halaqmap.com',
    hashPath: ROUTE_PATHS.STORE_LANDING,
  }),
  null,
);

console.log('store host redirect ok');
