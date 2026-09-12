/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowUpLeft,
  Briefcase,
  Check,
  ClipboardList,
  CreditCard,
  LayoutGrid,
  PartyPopper,
  Search,
  Send,
  Sparkles,
  Store,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import {
  STORE_SOLUTION_CATALOG_CATEGORIES,
  STORE_SOLUTION_CATALOG_COPY,
  STORE_SOLUTION_CATALOG_JOURNEY,
  STORE_SOLUTION_CATALOG_PRODUCTS,
  parseSolutionCatalogProductHash,
  solutionCatalogProductHash,
  solutionCatalogSearchHaystack,
  type SolutionCatalogProduct,
} from '@/config/storeSolutionCatalog';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { CatalogSignalLayer } from '@/components/store/catalog/CatalogSignalLayer';
import { ProductMark } from '@/components/store/catalog/ProductMark';
import { SolutionCatalogProductCard } from '@/components/store/catalog/SolutionCatalogProductCard';
import {
  SOLUTION_CATALOG_HOOD_CODES,
  SolutionCatalogHoodScene,
} from '@/components/store/catalog/SolutionCatalogHoodScene';
import { StoreBrandMark } from '@/components/store/StoreBrandMark';

const SOLUTION_CATALOG_CATEGORY_ICONS: Record<string, LucideIcon> = {
  all: LayoutGrid,
  trades: Briefcase,
  neighbor: Store,
  food: UtensilsCrossed,
  events: PartyPopper,
  cards: CreditCard,
};

function ProductModal({
  product,
  onClose,
}: {
  product: SolutionCatalogProduct;
  onClose: () => void;
}) {
  return (
    <div className="solution-catalog__modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="solution-catalog__modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`catalog-modal-${product.code}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <ProductMark
              logoSrc={product.logoSrc}
              name={product.nameAr}
              code={product.code}
              accent={product.stripe}
            />
            <div>
              <p className="solution-catalog__code text-sm text-[var(--sc-muted)]">{product.code}</p>
              <h2 id={`catalog-modal-${product.code}`} className="solution-catalog__product-name mt-1">
                {product.nameAr}
              </h2>
              <p className="text-sm text-[var(--sc-muted)]">{product.nameEn}</p>
            </div>
          </div>
          <button type="button" className="solution-catalog__btn solution-catalog__btn--ghost" onClick={onClose} aria-label={STORE_SOLUTION_CATALOG_COPY.modalCloseAr}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 text-sm font-bold">{product.categoryAr}</p>
        <p className="mt-3 font-bold">{product.summaryAr}</p>
        <p className="solution-catalog__product-desc mt-2">{product.descriptionAr}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <span key={tag} className="solution-catalog__tag">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-5 border-t border-[var(--sc-border)] pt-4">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <ClipboardList className="h-4 w-4" />
            {STORE_SOLUTION_CATALOG_COPY.modalPathAr}
          </h3>
          <ul className="mt-2 space-y-2 text-sm leading-relaxed text-[var(--sc-muted)]">
            {product.pathItems.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sc-blue)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            to={`${ROUTE_PATHS.STORE_REQUEST}?product=${encodeURIComponent(product.code)}&name=${encodeURIComponent(product.nameAr)}`}
            className="solution-catalog__btn solution-catalog__btn--primary inline-flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {STORE_SOLUTION_CATALOG_COPY.modalStartAr}
          </Link>
          {product.external ? (
            <a
              href={product.href}
              target="_blank"
              rel="noreferrer"
              className="solution-catalog__btn solution-catalog__btn--ghost inline-flex items-center gap-2"
            >
              {STORE_SOLUTION_CATALOG_COPY.modalBrowseAr}
              <ArrowUpLeft className="h-4 w-4" />
            </a>
          ) : (
            <Link to={product.href} className="solution-catalog__btn solution-catalog__btn--ghost inline-flex items-center gap-2">
              {STORE_SOLUTION_CATALOG_COPY.modalBrowseAr}
              <ArrowUpLeft className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function SolutionCatalogApp() {
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [active, setActive] = useState<SolutionCatalogProduct | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return STORE_SOLUTION_CATALOG_PRODUCTS.filter((product) => {
      if (categoryId !== 'all' && product.categoryId !== categoryId) return false;
      if (!q) return true;
      return solutionCatalogSearchHaystack(product).includes(q);
    });
  }, [query, categoryId]);

  const hoodProducts = useMemo(
    () =>
      SOLUTION_CATALOG_HOOD_CODES.map((code) =>
        STORE_SOLUTION_CATALOG_PRODUCTS.find((product) => product.code === code),
      ).filter((product): product is SolutionCatalogProduct => Boolean(product)),
    [],
  );

  useEffect(() => {
    const openFromHash = () => {
      const code = parseSolutionCatalogProductHash(window.location.hash);
      if (!code) return;
      const hit = STORE_SOLUTION_CATALOG_PRODUCTS.find((item) => item.code === code);
      if (hit) setActive(hit);
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, []);

  function openProduct(product: SolutionCatalogProduct) {
    setActive(product);
    window.history.replaceState(null, '', `#${solutionCatalogProductHash(product.code)}`);
  }

  function closeProduct() {
    setActive(null);
    if (window.location.hash.startsWith('#product-')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  function resetFilters() {
    setQuery('');
    setCategoryId('all');
  }

  return (
    <div className="solution-catalog" dir="rtl">
      <p className="solution-catalog__lab-note">{STORE_SOLUTION_CATALOG_COPY.kickerAr}</p>
      <header className="solution-catalog__header px-4 py-4">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <StoreBrandMark className="h-9 w-9" />
            <span className="text-lg font-bold">{STORE_SOLUTION_CATALOG_COPY.brandAr}</span>
          </div>
          <Link to={ROUTE_PATHS.STORE_LANDING} className="text-sm underline underline-offset-4 opacity-90">
            العودة للمتجر
          </Link>
        </div>
      </header>

      <div className="solution-catalog__layout">
        <aside className="solution-catalog__sidebar">
          <p className="mb-3 hidden px-2 text-xs font-bold text-[var(--sc-muted)] md:block">التصنيف</p>
          <ul>
            {STORE_SOLUTION_CATALOG_CATEGORIES.map((cat) => {
              const CatIcon = SOLUTION_CATALOG_CATEGORY_ICONS[cat.id];
              return (
                <li key={cat.id}>
                  <button
                    type="button"
                    className="solution-catalog__cat-btn"
                    aria-pressed={categoryId === cat.id}
                    onClick={() => setCategoryId(cat.id)}
                  >
                    {CatIcon ? <CatIcon className="solution-catalog__cat-icon" aria-hidden /> : null}
                    {cat.titleAr}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <main className="solution-catalog__main">
          <CatalogSignalLayer />
          <section>
            <h1 className="solution-catalog__hero-title">{STORE_SOLUTION_CATALOG_COPY.heroTitleAr}</h1>
            <p className="mt-4 max-w-3xl text-base leading-[1.85] text-[var(--sc-muted)]">{STORE_SOLUTION_CATALOG_COPY.heroLeadAr}</p>
            <p className="mt-3 flex items-center gap-2 text-sm font-bold">
              <Sparkles className="h-4 w-4 text-[var(--sc-yellow)]" />
              {STORE_SOLUTION_CATALOG_COPY.heroCountAr}
            </p>
          </section>

          <section className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="solution-catalog__section-title">{STORE_SOLUTION_CATALOG_COPY.indexTitleAr}</h2>
              <label className="relative block w-full max-w-md">
                <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sc-muted)]" />
                <input
                  className="solution-catalog__search pe-3 ps-10"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={STORE_SOLUTION_CATALOG_COPY.searchPlaceholderAr}
                />
              </label>
            </div>

            {filtered.length ? (
              <div className="solution-catalog__grid">
                {filtered.map((product) => (
                  <SolutionCatalogProductCard key={product.code} product={product} onOpen={openProduct} />
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-sm border border-[var(--sc-border)] bg-[var(--sc-surface)] p-8 text-center">
                <p className="text-lg font-bold">{STORE_SOLUTION_CATALOG_COPY.emptyTitleAr}</p>
                <p className="mt-2 text-[var(--sc-muted)]">{STORE_SOLUTION_CATALOG_COPY.emptyLeadAr}</p>
                <button type="button" className="solution-catalog__btn solution-catalog__btn--primary mt-4" onClick={resetFilters}>
                  {STORE_SOLUTION_CATALOG_COPY.resetIndexAr}
                </button>
              </div>
            )}
          </section>

          <section className="solution-catalog__custom">
            <h2 className="solution-catalog__section-title text-2xl">{STORE_SOLUTION_CATALOG_COPY.customTitleAr}</h2>
            <p className="solution-catalog__custom-lead">{STORE_SOLUTION_CATALOG_COPY.customLeadAr}</p>
            <Link to={ROUTE_PATHS.STORE_REQUEST} className="solution-catalog__btn solution-catalog__btn--primary mt-5 inline-flex">
              {STORE_SOLUTION_CATALOG_COPY.customCtaAr}
            </Link>
          </section>

          <section className="solution-catalog__journey">
            <h2 className="solution-catalog__section-title">{STORE_SOLUTION_CATALOG_COPY.journeyTitleAr}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {STORE_SOLUTION_CATALOG_JOURNEY.map((step) => (
                <article key={step.step} className="border border-[var(--sc-border)] bg-[var(--sc-card)] p-4">
                  <p className="solution-catalog__code text-sm font-bold text-[var(--sc-blue)]">{step.step}</p>
                  <h3 className="mt-2 text-lg font-bold">{step.titleAr}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--sc-muted)]">{step.leadAr}</p>
                </article>
              ))}
            </div>
          </section>

          {hoodProducts.length === SOLUTION_CATALOG_HOOD_CODES.length ? (
            <div className="solution-catalog__hood-wrap">
              <SolutionCatalogHoodScene products={hoodProducts} onOpen={openProduct} />
            </div>
          ) : null}
        </main>
      </div>

      {active ? <ProductModal product={active} onClose={closeProduct} /> : null}
    </div>
  );
}
