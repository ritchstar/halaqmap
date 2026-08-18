/**
 * عزل قطاع كوافير ماب عن تسجيل وبحث الرجال.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

async function main() {
  const mod = await import('../api/_lib/coiffeurListingSector.ts');
  const business = await import('../api/_lib/registrationBusinessValidation.ts');

  assert.equal(mod.normalizeListingSector('coiffeur_women'), 'coiffeur_women');
  assert.equal(mod.normalizeListingSector(undefined), 'mens_barber');

  const coiffeurOk = mod.validateRegistrationListingSector({
    listingSector: 'coiffeur_women',
    categories: ['كوافير نسائي', 'مشغل تجميل'],
    specialtyTrack: 'general',
  });
  assert.equal(coiffeurOk.ok, true);

  const coiffeurBadTrack = mod.validateRegistrationListingSector({
    listingSector: 'coiffeur_women',
    categories: ['كوافير نسائي'],
    specialtyTrack: 'children',
  });
  assert.equal(coiffeurBadTrack.ok, false);

  const menRejectCoiffeurCat = mod.validateRegistrationListingSector({
    listingSector: 'mens_barber',
    categories: ['حلاقة رجالي', 'كوافير نسائي'],
  });
  assert.equal(menRejectCoiffeurCat.ok, false);

  const menHomeVisitOk = mod.validateRegistrationListingSector({
    listingSector: 'mens_barber',
    categories: ['حلاقة رجالي', 'زيارة منزلية'],
  });
  assert.equal(menHomeVisitOk.ok, true);

  const biz = business.validateRegistrationBusinessPayload({
    tier: 'gold',
    listingSector: 'coiffeur_women',
    categories: ['سبا ومساج'],
  });
  assert.equal(biz.ok, true);

  const bizBad = business.validateRegistrationBusinessPayload({
    tier: 'gold',
    listingSector: 'coiffeur_women',
    categories: ['حلاقة رجالي'],
  });
  assert.equal(bizBad.ok, false);

  assert.equal(
    mod.listingMatchesCoiffeurIntent({
      specialties: ['مكياج وسهرات'],
      intent: 'makeup',
      openForCustomers: true,
    }),
    true,
  );
  assert.equal(
    mod.listingMatchesCoiffeurIntent({
      specialties: ['مكياج وسهرات'],
      intent: 'nails',
      openForCustomers: true,
    }),
    false,
  );
  assert.equal(
    mod.listingMatchesCoiffeurIntent({
      specialties: ['كوافير نسائي'],
      intent: 'near_open',
      openForCustomers: false,
    }),
    false,
  );

  const inquiry = readFileSync(join(root, 'src/lib/coiffeurInquiryIsolation.ts'), 'utf8');
  assert.equal(/\/api\/public-barbers/.test(inquiry), false);
  assert.match(inquiry, /\/api\/public-coiffeur-listings/);

  const hostRedirect = readFileSync(join(root, 'src/lib/coiffeurHostRedirect.ts'), 'utf8');
  assert.equal(/coiffeurPartnerSector/.test(hostRedirect), false);
  assert.equal(/partnerLegal/.test(hostRedirect), false);

  const form = readFileSync(join(root, 'src/components/RegistrationForm.tsx'), 'utf8');
  assert.match(form, /coiffeurPartnerSector/);
  assert.equal(/from ['"]@\/config\/coiffeurMapUmbrella['"]/.test(form), false);

  const whitelist = readFileSync(join(root, 'api/_lib/approveBarberUpsertWhitelist.ts'), 'utf8');
  assert.match(whitelist, /listing_sector/);

  console.log('coiffeur listing sector: all checks passed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
