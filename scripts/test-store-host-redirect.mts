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
    hashPath: ROUTE_PATHS.STORE_TRUST,
  }),
  'https://store.halaqmap.com/#/store/trust',
);

assert.equal(isStoreHostPaymentPath('/pay/occasion-card/abc'), true);
assert.equal(isStoreHostPaymentPath('/pay/wedding/abc'), true);
assert.equal(isStoreHostPaymentPath('/pay/event/abc'), true);
assert.equal(isStoreHostPaymentPath('/pay/lounge/abc'), true);
assert.equal(isStoreHostPaymentPath('/pay/grocers/abc'), true);
assert.equal(
  resolveMensHostStoreRedirect({
    host: 'www.halaqmap.com',
    hashPath: '/pay/occasion-card/abc',
  }),
  null,
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
    host: 'www.halaqmap.com',
    hashPath: ROUTE_PATHS.STORE_WEDDING,
  }),
  'https://store.halaqmap.com/#/store/wedding',
);

assert.equal(
  resolveMensHostStoreRedirect({
    host: 'www.halaqmap.com',
    hashPath: ROUTE_PATHS.STORE_WEDDING_WOMEN,
  }),
  'https://store.halaqmap.com/#/store/wedding/women',
);

assert.equal(
  resolveMensHostStoreRedirect({
    host: 'www.halaqmap.com',
    hashPath: '/w/lab/guest',
  }),
  'https://store.halaqmap.com/#/w/lab/guest',
);

assert.equal(
  resolveMensHostStoreRedirect({
    host: 'www.halaqmap.com',
    hashPath: ROUTE_PATHS.STORE_EVENT,
  }),
  'https://store.halaqmap.com/#/store/event',
);

assert.equal(
  resolveMensHostStoreRedirect({
    host: 'www.halaqmap.com',
    hashPath: '/e/lab/guest',
  }),
  'https://store.halaqmap.com/#/e/lab/guest',
);

assert.equal(
  resolveMensHostStoreRedirect({
    host: 'www.halaqmap.com',
    hashPath: ROUTE_PATHS.STORE_LOUNGE,
  }),
  'https://store.halaqmap.com/#/store/lounge',
);

assert.equal(
  resolveMensHostStoreRedirect({
    host: 'www.halaqmap.com',
    hashPath: '/l/lab/guest',
  }),
  'https://store.halaqmap.com/#/l/lab/guest',
);

assert.equal(
  resolveMensHostStoreRedirect({
    host: 'www.halaqmap.com',
    hashPath: ROUTE_PATHS.STORE_GROCERS,
  }),
  'https://store.halaqmap.com/#/store/grocers',
);

assert.equal(
  resolveMensHostStoreRedirect({
    host: 'www.halaqmap.com',
    hashPath: '/g/grocers-lab/desk',
  }),
  'https://store.halaqmap.com/#/g/grocers-lab/desk',
);

assert.equal(
  resolveMensHostStoreRedirect({
    host: 'store.halaqmap.com',
    hashPath: ROUTE_PATHS.STORE_LANDING,
  }),
  null,
);

console.log('store host redirect ok');
