/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ExternalLink,
  MapPinned,
  MessageSquare,
  QrCode,
  Rocket,
  Store,
  Youtube,
} from 'lucide-react';
import { ROUTE_PATHS } from '@/lib';
import { SalesOfficeSaudiStyleChat } from '@/components/SalesOfficeSaudiStyleChat';
import { MapCommunityYoutubeEmbed } from '@/components/MapCommunityYoutubeEmbed';
import { PlatformOfficialFooterStrip } from '@/components/PlatformOfficialFooterStrip';
import { GEO_NEAR_HUB_PATH, geoNearPath, listGeoNearCities } from '@/config/geoNearRegistry';
import {
  MERCHANT_SETTLEMENT_CTA,
  MERCHANT_SETTLEMENT_GROUND_TACTICS,
  MERCHANT_SETTLEMENT_HERO,
  MERCHANT_SETTLEMENT_INVESTOR_QA,
  MERCHANT_SETTLEMENT_META,
  MERCHANT_SETTLEMENT_PROOF_STATS,
  MERCHANT_SETTLEMENT_VIDEOS,
  MERCHANT_SETTLEMENT_WHY_PAUSE,
  type MerchantSettlementVideo,
} from '@/config/merchantSettlementLandingCopy';

function uniqueVideos(list: readonly MerchantSettlementVideo[]): MerchantSettlementVideo[] {
  const seen = new Set<string>();
  const out: MerchantSettlementVideo[] = [];
  for (const v of list) {
    if (seen.has(v.videoId)) continue;
    seen.add(v.videoId);
    out.push(v);
  }
  return out;
}

export default function MerchantSettlementLanding() {
  const videos = useMemo(() => uniqueVideos(MERCHANT_SETTLEMENT_VIDEOS), []);
  const [activeVideoId, setActiveVideoId] = useState(videos[0]?.videoId ?? '');
  const activeVideo = videos.find((v) => v.videoId === activeVideoId) ?? videos[0];

  useEffect(() => {
    document.title = MERCHANT_SETTLEMENT_META.titleAr;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', MERCHANT_SETTLEMENT_META.descriptionAr);
  }, []);

  return (
    <div
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#061223_0%,#0a1f33_45%,#071525_100%)] text-slate-100"
    >
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute right-[10%] top-[6%] h-[28rem] w-[28rem] rounded-full bg-teal-400/15 blur-[120px]" />
        <div className="absolute left-[8%] top-[30%] h-[22rem] w-[22rem] rounded-full bg-amber-300/10 blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.9) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-[max(1.25rem,env(safe-area-inset-top))] md:px-6 md:pb-20 md:pt-8">
        <Link
          to={ROUTE_PATHS.BARBERS_LANDING}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-teal-300/40 hover:text-teal-100"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة لمسار الشركاء
        </Link>

        {/* Hero — brand first, one composition */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-10 max-w-3xl"
        >
          <p className="text-sm font-bold tracking-wide text-teal-300/90 sm:text-base">
            {MERCHANT_SETTLEMENT_HERO.eyebrowAr}
          </p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl">
            {MERCHANT_SETTLEMENT_HERO.brandAr}
          </h1>
          <p className="mt-4 text-xl font-bold leading-snug text-teal-100 sm:text-2xl md:text-3xl">
            {MERCHANT_SETTLEMENT_HERO.headlineAr}
          </p>
          <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
            {MERCHANT_SETTLEMENT_HERO.leadAr}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to={ROUTE_PATHS.REGISTER}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-teal-500 to-cyan-500 px-5 py-3 text-base font-black text-[#041016] shadow-lg shadow-teal-500/20 transition hover:brightness-110"
            >
              <Store className="h-5 w-5" />
              {MERCHANT_SETTLEMENT_CTA.primaryAr}
            </Link>
            <Link
              to={ROUTE_PATHS.PARTNER_SALES_OFFICE}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-base font-bold text-white transition hover:border-teal-300/40 hover:bg-white/10"
            >
              <MessageSquare className="h-5 w-5" />
              {MERCHANT_SETTLEMENT_CTA.salesOfficeAr}
            </Link>
          </div>
        </motion.header>

        {/* Proof stats */}
        <section className="mb-12" aria-labelledby="settlement-proof-heading">
          <h2 id="settlement-proof-heading" className="mb-4 text-lg font-bold text-teal-200 sm:text-xl">
            ما تحقق فعلياً — بلا جدل
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {MERCHANT_SETTLEMENT_PROOF_STATS.map((stat, i) => (
              <motion.article
                key={stat.labelAr}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="rounded-2xl border border-teal-400/25 bg-teal-500/10 p-4 sm:p-5"
              >
                <p className="text-2xl font-black text-white sm:text-3xl">{stat.valueAr}</p>
                <p className="mt-1 text-base font-bold text-teal-100">{stat.labelAr}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{stat.noteAr}</p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Investor Q&A */}
        <section className="mb-12 rounded-2xl border border-amber-400/25 bg-amber-500/10 p-5 sm:p-7">
          <p className="text-sm font-bold text-amber-200/90">سؤال المستثمر الصارم</p>
          <h2 className="mt-2 text-xl font-black leading-snug text-white sm:text-2xl">
            {MERCHANT_SETTLEMENT_INVESTOR_QA.questionAr}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-200 sm:text-lg">
            {MERCHANT_SETTLEMENT_INVESTOR_QA.answerAr}
          </p>
        </section>

        {/* Why pause + ground tactics */}
        <div className="mb-12 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white sm:text-xl">
              <Rocket className="h-5 w-5 text-teal-300" />
              لماذا أوقفنا الحملات الآن؟
            </h2>
            <ul className="mt-4 space-y-3">
              {MERCHANT_SETTLEMENT_WHY_PAUSE.map((line) => (
                <li key={line} className="flex gap-2 text-base leading-relaxed text-slate-300">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-teal-400" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white sm:text-xl">
              <QrCode className="h-5 w-5 text-amber-300" />
              بعد التسكين — نشر تكتيكي على الأرض
            </h2>
            <ul className="mt-4 space-y-3">
              {MERCHANT_SETTLEMENT_GROUND_TACTICS.map((line) => (
                <li key={line} className="flex gap-2 text-base leading-relaxed text-slate-300">
                  <Building2 className="mt-1 h-4 w-4 shrink-0 text-amber-300/90" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* YouTube in-page */}
        <section className="mb-12" aria-labelledby="settlement-video-heading">
          <h2
            id="settlement-video-heading"
            className="mb-2 flex items-center gap-2 text-lg font-bold text-white sm:text-xl"
          >
            <Youtube className="h-5 w-5 text-red-400" />
            شاهد التجربة دون مغادرة الصفحة
          </h2>
          <p className="mb-4 max-w-2xl text-base leading-relaxed text-slate-400">
            مقطع تجربة المستخدم كان كافياً لإثبات إمكانية نشر المنصة. شغّله هنا، ثم أكمل طلب الاشتراك.
          </p>
          {videos.length > 1 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {videos.map((v) => (
                <button
                  key={v.videoId}
                  type="button"
                  onClick={() => setActiveVideoId(v.videoId)}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    activeVideoId === v.videoId
                      ? 'border-teal-300/50 bg-teal-500/20 text-teal-50'
                      : 'border-white/15 bg-white/5 text-slate-300 hover:border-white/30'
                  }`}
                >
                  {v.titleAr}
                </button>
              ))}
            </div>
          ) : null}
          {activeVideo ? (
            <>
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl">
                <MapCommunityYoutubeEmbed videoId={activeVideo.videoId} title={activeVideo.titleAr} />
              </div>
              <p className="mt-3 text-base font-semibold text-slate-200">{activeVideo.titleAr}</p>
              <p className="text-sm leading-relaxed text-slate-400">{activeVideo.blurbAr}</p>
              <a
                href={`https://www.youtube.com/watch?v=${activeVideo.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-teal-300 hover:underline"
              >
                فتح على يوتيوب
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </>
          ) : null}
        </section>

        {/* Chat */}
        <section className="mb-12" aria-labelledby="settlement-chat-heading">
          <h2 id="settlement-chat-heading" className="mb-3 text-lg font-bold text-white sm:text-xl">
            ناقش معنا — شات مكتوب ثابت
          </h2>
          <p className="mb-4 max-w-2xl text-base leading-relaxed text-slate-400">
            اسأل عن الباقات، التسكين، أو خطوات التسجيل. للإقفال السريع استخدم زر طلب الاشتراك أعلاه.
          </p>
          <SalesOfficeSaudiStyleChat />
        </section>

        {/* Links hub */}
        <section className="mb-12 rounded-2xl border border-teal-400/20 bg-teal-500/5 p-5 sm:p-7">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white sm:text-xl">
            <MapPinned className="h-5 w-5 text-teal-300" />
            روابط الإقفال والمعاينة
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to={ROUTE_PATHS.REGISTER}
              className="rounded-xl border border-teal-400/35 bg-teal-500/15 px-4 py-3 text-base font-bold text-teal-50 transition hover:bg-teal-500/25"
            >
              {MERCHANT_SETTLEMENT_CTA.primaryAr}
            </Link>
            <Link
              to={ROUTE_PATHS.BARBERS_LANDING}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base font-bold text-slate-100 transition hover:bg-white/10"
            >
              {MERCHANT_SETTLEMENT_CTA.secondaryAr}
            </Link>
            <Link
              to={ROUTE_PATHS.REGISTER_GUIDE}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base font-bold text-slate-100 transition hover:bg-white/10"
            >
              دليل متطلبات الاشتراك
            </Link>
            <Link
              to={ROUTE_PATHS.PARTNER_SUPPORT}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base font-bold text-slate-100 transition hover:bg-white/10"
            >
              {MERCHANT_SETTLEMENT_CTA.supportAr}
            </Link>
            <a
              href={GEO_NEAR_HUB_PATH}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base font-bold text-slate-100 transition hover:bg-white/10"
            >
              {MERCHANT_SETTLEMENT_CTA.nearAr}
            </a>
            <Link
              to={ROUTE_PATHS.HOME}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base font-bold text-slate-100 transition hover:bg-white/10"
            >
              {MERCHANT_SETTLEMENT_CTA.homeDemoAr}
            </Link>
          </div>
          <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm font-bold text-teal-200">معاينة سريعة — مدن كبرى في /near</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {listGeoNearCities()
                .slice(0, 8)
                .map((city) => (
                  <li key={city.slug}>
                    <a
                      href={geoNearPath(city)}
                      className="inline-flex rounded-lg border border-teal-400/30 bg-teal-500/10 px-3 py-1.5 text-sm font-semibold text-teal-100 hover:bg-teal-500/20"
                    >
                      {city.nameAr}
                    </a>
                  </li>
                ))}
            </ul>
            <a
              href={GEO_NEAR_HUB_PATH}
              className="mt-3 inline-block text-sm font-semibold text-teal-300 hover:underline"
            >
              كل المدن على /near
            </a>
          </div>
        </section>

        <div className="mb-8 flex flex-wrap justify-center gap-3">
          <Link
            to={ROUTE_PATHS.REGISTER}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-teal-500 to-cyan-500 px-6 py-3.5 text-lg font-black text-[#041016] shadow-lg"
          >
            <Store className="h-5 w-5" />
            {MERCHANT_SETTLEMENT_CTA.primaryAr}
          </Link>
        </div>

        <PlatformOfficialFooterStrip variant="dark" />
      </div>
    </div>
  );
}
