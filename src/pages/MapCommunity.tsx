/**
 * MapCommunity — مجتمع ماب للشركاء.
 *
 * Phase A: live feed from Supabase via Vercel API + YouTube embeds.
 * Falls back to local mock data when the API returns 503 / is unavailable.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Bot,
  Eye,
  Film,
  MessageCircle,
  Send,
  Sparkles,
  Users,
  Video,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';
import { resolveAdminAccess } from '@/lib/adminAccessRemote';
import { ROUTE_PATHS } from '@/lib';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MapCommunityYoutubeEmbed } from '@/components/MapCommunityYoutubeEmbed';
import {
  fetchMapCommunityFeedRemote,
  markMapCommunityReadRemote,
  postMapCommunityMessageRemote,
} from '@/lib/mapCommunityRemote';
import { POLL_MS } from '@/lib/pollingPolicy';
import { readBarberAuthSession, buildBarberLoginUrl } from '@/lib/barberPortalSession';

type CommunityMessage = {
  id: string;
  author: string;
  role: 'barber' | 'ai' | 'system' | 'admin';
  content: string;
  timestamp: string;
};

type CommunityVideo = {
  id: string;
  barberName: string;
  title: string;
  duration: string;
  views: string;
  gradient?: string;
  youtubeVideoId?: string;
};

type CommunityAccess =
  | { status: 'checking' }
  | { status: 'nologin' }
  | { status: 'denied'; email: string | null }
  | { status: 'allowed'; role: 'admin' | 'barber' | 'founder'; name: string; isVerified: boolean; email: string | null; canPostLive?: boolean };

const badWords = ['سب', 'قذف', 'عنصري', 'إهانة', 'فضيحة'];

const FALLBACK_VIDEOS: CommunityVideo[] = [
  {
    id: 'v1',
    barberName: 'حلاق الرياض الذهبي',
    title: 'قصّة تدرّج ناعم قبل العيد',
    duration: '00:58',
    views: '1.2k',
    gradient: 'from-emerald-500/25 via-cyan-500/15 to-slate-950',
  },
  {
    id: 'v2',
    barberName: 'ستايل برو جدة',
    title: 'ترتيب لحية كلاسيكي',
    duration: '00:45',
    views: '840',
    gradient: 'from-amber-500/25 via-orange-500/10 to-slate-950',
  },
  {
    id: 'v3',
    barberName: 'نجد للعناية الرجالية',
    title: 'تنظيف خط الرقبة باحتراف',
    duration: '00:52',
    views: '690',
    gradient: 'from-blue-500/25 via-cyan-500/10 to-slate-950',
  },
  {
    id: 'v4',
    barberName: 'صالون المدينة',
    title: 'طريقة تصوير نتيجة قبل/بعد',
    duration: '00:60',
    views: '1.8k',
    gradient: 'from-violet-500/25 via-emerald-500/10 to-slate-950',
  },
];

const FALLBACK_MESSAGES: CommunityMessage[] = [
  {
    id: 'm1',
    author: 'مساعد ماب',
    role: 'ai',
    content:
      'يا هلا يا مبدعين. موضوع اليوم: وش أكثر شيء يخلي الزبون يرجع لنفس الحلاق؟ جودة القصّة، سرعة الرد، ولا طريقة الاستقبال؟',
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: 'm2',
    author: 'حلاق الرياض الذهبي',
    role: 'barber',
    content: 'بالنسبة لي طريقة الاستقبال تفرق كثير، بعدها جودة القصة تثبت الزبون.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'm3',
    author: 'ستايل برو جدة',
    role: 'barber',
    content: '@مساعد_ماب كيف أصور شغلي بطريقة تقنع الزبون؟',
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
];

const FALLBACK_STATS = [
  { label: 'حلاق نشط', value: '128', tone: 'text-emerald-300' },
  { label: 'فيديو هذا الأسبوع', value: '36', tone: 'text-cyan-300' },
  { label: 'سؤال مهني', value: '214', tone: 'text-amber-300' },
];

const VIDEO_GRADIENTS = [
  'from-emerald-500/25 via-cyan-500/15 to-slate-950',
  'from-amber-500/25 via-orange-500/10 to-slate-950',
  'from-blue-500/25 via-cyan-500/10 to-slate-950',
  'from-violet-500/25 via-emerald-500/10 to-slate-950',
];

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function normalizeRole(raw: string): CommunityMessage['role'] {
  if (raw === 'ai' || raw === 'system' || raw === 'admin') return raw;
  return 'barber';
}

function containsBadWords(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  return badWords.some((w) => normalized.includes(w));
}

async function askMapAssistant(message: string, history: CommunityMessage[]) {
  const res = await fetch('/api/map-community-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      history: history.slice(-10).map((m) => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: `${m.author}: ${m.content}`,
      })),
    }),
  });
  return (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    shouldReply?: boolean;
    moderated?: boolean;
    reply?: string;
  };
}

export default function MapCommunity() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const founderView = searchParams.get('view') === 'founder';
  const [access, setAccess] = useState<CommunityAccess>({ status: 'checking' });
  const [ephemeralMessages, setEphemeralMessages] = useState<CommunityMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [aiThinking, setAiThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const seq = useRef(0);

  const socketMode = Boolean(import.meta.env.VITE_MAP_COMMUNITY_SOCKET_URL);
  const feedEnabled = access.status === 'allowed';

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!isSupabaseConfigured()) {
        if (!cancelled) setAccess({ status: 'denied', email: null });
        return;
      }

      const client = getSupabaseClient();
      if (!client) {
        if (!cancelled) setAccess({ status: 'denied', email: null });
        return;
      }

      const { data: sessionData } = await client.auth.getSession();
      const user = sessionData.session?.user;
      const email = user?.email ?? null;
      if (user && email) {
        const admin = await resolveAdminAccess(email);
        if (admin.allowed) {
          if (!cancelled) {
            setAccess({
              status: 'allowed',
              role: founderView && admin.bootstrap ? 'founder' : 'admin',
              name: founderView && admin.bootstrap ? '' : (admin.displayName || 'مشرف حلاق ماب'),
              isVerified: true,
              email,
              canPostLive: true,
            });
          }
          return;
        }

        const { data: barber } = await client
          .from('barbers')
          .select('name, is_active, is_verified')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (barber?.is_active === true) {
          if (!cancelled) {
            setAccess({
              status: 'allowed',
              role: 'barber',
              name: String(barber.name || 'حلاق ماب'),
              isVerified: Boolean(barber.is_verified),
              email,
              canPostLive: true,
            });
          }
          return;
        }

        if (!cancelled) setAccess({ status: 'denied', email });
        return;
      }

      const portalSession = readBarberAuthSession();
      if (portalSession?.email) {
        const { data: barber } = await client
          .from('barbers')
          .select('name, is_active, is_verified')
          .ilike('email', portalSession.email.trim())
          .eq('is_active', true)
          .maybeSingle();

        if (barber?.is_active === true) {
          if (!cancelled) {
            setAccess({
              status: 'allowed',
              role: 'barber',
              name: String(barber.name || portalSession.name || 'حلاق ماب'),
              isVerified: Boolean(barber.is_verified),
              email: portalSession.email,
              canPostLive: false,
            });
          }
          return;
        }
      }

      if (!cancelled) setAccess({ status: 'nologin' });
    })();

    return () => {
      cancelled = true;
    };
  }, [founderView]);

  const feedQuery = useQuery({
    queryKey: ['map-community-feed'],
    queryFn: async () => {
      const res = await fetchMapCommunityFeedRemote();
      if (res.ok === false) throw new Error(res.error);
      return res.body;
    },
    enabled: feedEnabled,
    refetchInterval: POLL_MS.MAP_COMMUNITY_FEED,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    staleTime: POLL_MS.MAP_COMMUNITY_FEED - 5_000,
    retry: 1,
  });

  const usingFallback = feedQuery.isError || !feedQuery.data?.ok;

  useEffect(() => {
    if (access.status !== 'allowed' || usingFallback) return;
    void markMapCommunityReadRemote().then(() => {
      void queryClient.invalidateQueries({ queryKey: ['map-community-badge'] });
    });
  }, [access.status, usingFallback, queryClient]);

  const baseMessages = useMemo((): CommunityMessage[] => {
    if (usingFallback || !feedQuery.data?.messages?.length) {
      return FALLBACK_MESSAGES;
    }
    return feedQuery.data.messages.map((m) => ({
      id: m.id,
      author: m.author,
      role: normalizeRole(m.role),
      content: m.content,
      timestamp: m.timestamp,
    }));
  }, [usingFallback, feedQuery.data?.messages]);

  const videos = useMemo((): CommunityVideo[] => {
    if (usingFallback || !feedQuery.data?.videos?.length) {
      return FALLBACK_VIDEOS;
    }
    return feedQuery.data.videos.map((v, i) => ({
      id: v.id,
      barberName: v.barberName,
      title: v.title,
      duration: v.duration,
      views: v.views,
      youtubeVideoId: v.youtubeVideoId,
      gradient: VIDEO_GRADIENTS[i % VIDEO_GRADIENTS.length],
    }));
  }, [usingFallback, feedQuery.data?.videos]);

  const stats = useMemo(() => {
    if (usingFallback || !feedQuery.data?.stats) return FALLBACK_STATS;
    const s = feedQuery.data.stats;
    return [
      { label: 'حلاق نشط', value: String(s.activeBarbers || 0), tone: 'text-emerald-300' },
      { label: 'فيديو هذا الأسبوع', value: String(s.videosThisWeek || 0), tone: 'text-cyan-300' },
      { label: 'سؤال مهني', value: String(s.professionalQuestions || 0), tone: 'text-amber-300' },
    ];
  }, [usingFallback, feedQuery.data?.stats]);

  const messages = useMemo(
    () => [...baseMessages, ...ephemeralMessages],
    [baseMessages, ephemeralMessages],
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, aiThinking]);

  const pushEphemeral = useCallback((msg: Omit<CommunityMessage, 'id' | 'timestamp'>) => {
    setEphemeralMessages((prev) => [
      ...prev,
      {
        ...msg,
        id: `msg-${Date.now()}-${++seq.current}`,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  const send = useCallback(async (overrideText?: string) => {
    const content = (overrideText ?? draft).trim();
    if (!content || aiThinking || access.status !== 'allowed') return;

    if (containsBadWords(content)) {
      pushEphemeral({
        author: 'نظام المجتمع',
        role: 'system',
        content: 'تم إيقاف الرسالة قبل النشر. خلّونا نحافظ على مجتمع مهني ومحترم.',
      });
      setDraft('');
      return;
    }

    const isFounder = access.role === 'founder';
    if (isFounder) return;

    let historyBase = messages;

    if (!usingFallback) {
      if (access.canPostLive === false) {
        pushEphemeral({
          author: 'نظام المجتمع',
          role: 'system',
          content:
            'يمكنك تصفّح مجتمع ماب، لكن النشر المباشر يتطلّب الدخول بكلمة مرور حسابك على المنصة (وليس الرمز الموحّد فقط) من صفحة دخول الحلاق.',
        });
        setDraft('');
        return;
      }
      const posted = await postMapCommunityMessageRemote({
        content,
        silentView: founderView,
      });
      if (posted.ok === false) {
        if (posted.moderated && posted.reply) {
          pushEphemeral({ author: 'نظام المجتمع', role: 'system', content: posted.reply });
          setDraft('');
          return;
        }
        pushEphemeral({
          author: 'نظام المجتمع',
          role: 'system',
          content: posted.error || 'تعذر نشر الرسالة.',
        });
        setDraft('');
        return;
      }
      await feedQuery.refetch();
      historyBase = [
        ...baseMessages,
        {
          ...posted.message,
          role: normalizeRole(posted.message.role),
        },
      ];
    } else {
      pushEphemeral({
        author: access.name || 'عضو',
        role: 'barber',
        content,
      });
      historyBase = [
        ...messages,
        {
          id: 'draft',
          author: access.name || 'عضو',
          role: 'barber' as const,
          content,
          timestamp: new Date().toISOString(),
        },
      ];
    }

    if (!overrideText) setDraft('');

    setAiThinking(true);
    const ai = await askMapAssistant(content, historyBase);
    setAiThinking(false);

    if (ai.moderated && ai.reply) {
      pushEphemeral({ author: 'نظام المجتمع', role: 'system', content: ai.reply });
      return;
    }
    if (ai.shouldReply && ai.reply) {
      pushEphemeral({ author: 'مساعد ماب', role: 'ai', content: ai.reply });
    }
  }, [
    access,
    aiThinking,
    baseMessages,
    draft,
    feedQuery,
    founderView,
    messages,
    pushEphemeral,
    usingFallback,
  ]);

  if (access.status === 'checking') {
    return (
      <div dir="rtl" className="flex min-h-[70vh] items-center justify-center bg-[#0a0f0d] px-4 text-white">
        <div className="rounded-3xl border border-emerald-400/20 bg-slate-950/80 p-8 text-center shadow-[0_0_45px_rgba(16,185,129,0.12)]">
          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-emerald-400/30" />
          <p className="font-black">جاري التحقق من صلاحية الدخول لمجتمع ماب…</p>
          <p className="mt-2 text-sm text-slate-500">المجتمع مخصص لمنسوبي حلاق ماب فقط.</p>
        </div>
      </div>
    );
  }

  if (access.status === 'nologin' || access.status === 'denied') {
    return (
      <div dir="rtl" className="relative min-h-[70vh] overflow-hidden bg-[#0a0f0d] px-4 py-12 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-1/4 top-10 h-80 w-80 rounded-full bg-emerald-500/10 blur-[110px]" />
          <div className="absolute left-1/4 bottom-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-2xl rounded-3xl border border-amber-400/25 bg-slate-950/80 p-8 text-center shadow-[0_0_55px_rgba(245,158,11,0.12)] backdrop-blur-xl">
          <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-amber-300" />
          <h1 className="text-2xl font-black">مجتمع ماب مخصص لمنسوبي حلاق ماب</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-400">
            لا يمكن الدخول لغير الإداريين والمشرفين والحلاقين المفعّلين داخل منصة حلاق ماب. سجّل دخولك بالحساب المرتبط بالمنصة أو فعّل رخصة النفاذ أولاً.
          </p>
          {access.status === 'denied' && access.email ? (
            <p className="mt-3 text-xs text-slate-600">الحساب الحالي: {access.email}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild className="bg-emerald-500 text-black hover:bg-emerald-400">
              <Link to={buildBarberLoginUrl(ROUTE_PATHS.MAP_COMMUNITY)}>دخول الحلاق</Link>
            </Button>
            <Button asChild variant="outline" className="border-amber-400/35 bg-amber-500/10 text-amber-100">
              <Link to={ROUTE_PATHS.REGISTER}>تفعيل رخصة النفاذ</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isFounder = access.status === 'allowed' && access.role === 'founder';
  const readOnlyCommunity = access.status === 'allowed' && access.canPostLive === false;

  return (
    <div
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-[#0a0f0d] px-4 py-10 text-slate-100"
    >
      {readOnlyCommunity ? (
        <div className="relative z-20 mx-auto mb-6 max-w-4xl rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-center text-sm leading-7 text-amber-100">
          أنت داخل مجتمع ماب بتصفّح مرتبط بلوحة التحكم. للنشر المباشر وشارة «جديد»، أعد الدخول من{' '}
          <Link to={buildBarberLoginUrl(ROUTE_PATHS.MAP_COMMUNITY)} className="font-bold underline underline-offset-2">
            صفحة دخول الحلاق
          </Link>{' '}
          بكلمة مرور حسابك على المنصة (وليس الرمز الموحّد فقط).
        </div>
      ) : null}
      <motion.button
        type="button"
        onClick={() => navigate(ROUTE_PATHS.SAUDI_AGENT)}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, type: 'spring', stiffness: 280, damping: 26 }}
        whileHover={{ x: 5, scale: 1.04 }}
        whileTap={{ scale: 0.95 }}
        className="fixed left-0 z-[48] hidden flex-col items-center gap-1.5 py-3 px-2.5 sm:flex"
        style={{
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'linear-gradient(180deg,#0b2e14 0%,#0e3d1c 50%,#0b2e14 100%)',
          border: '1.5px solid rgba(34,145,63,0.48)',
          borderRight: 'none',
          borderRadius: '0 0 0 14px',
          boxShadow: '4px 0 22px rgba(34,145,63,0.30),0 0 12px rgba(201,162,39,0.15)',
        }}
        title="سعودي — الوكيل الذكي"
      >
        <motion.span
          className="pointer-events-none absolute inset-0"
          style={{ background: 'rgba(34,145,63,0.08)', borderRadius: 'inherit' }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="relative z-10 text-lg leading-none" style={{ filter: 'drop-shadow(0 0 5px rgba(201,162,39,0.65))' }}>
          🇸🇦
        </span>
        <motion.span
          className="relative z-10 h-1.5 w-1.5 rounded-full bg-emerald-400"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{ boxShadow: '0 0 5px rgba(52,211,153,0.8)' }}
        />
        <span
          className="relative z-10 text-[0.5rem] font-black tracking-widest text-yellow-400/70"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          سعودي
        </span>
      </motion.button>

      {isFounder && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-50 mb-4 flex items-center justify-between gap-3 rounded-2xl border border-fuchsia-400/35 bg-fuchsia-500/10 px-5 py-3 shadow-[0_0_24px_rgba(217,70,239,0.18)] backdrop-blur-md"
        >
          <div className="flex items-center gap-2.5">
            <Eye className="h-5 w-5 text-fuchsia-300" />
            <div>
              <p className="text-sm font-black text-fuchsia-100">وضع الاطلاع الصامت</p>
              <p className="text-[0.62rem] text-fuchsia-300/70">هويتك غير مكشوفة للمجتمع · القراءة فقط · لا تفاعل</p>
            </div>
          </div>
          <motion.span
            className="h-2.5 w-2.5 rounded-full bg-fuchsia-300"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ boxShadow: '0 0 8px rgba(217,70,239,0.9)' }}
          />
        </motion.div>
      )}

      {usingFallback ? (
        <p className="relative z-40 mb-3 text-center text-[0.62rem] text-amber-300/80">
          وضع احتياطي — البيانات الحية غير متاحة مؤقتاً (تحقق من ترحيل Supabase 93).
        </p>
      ) : null}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-10%] top-12 h-96 w-96 rounded-full bg-emerald-500/10 blur-[110px]" />
        <div className="absolute left-[-8%] top-1/3 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-amber-500/8 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(34,197,94,1) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,1) 1px,transparent 1px)',
            backgroundSize: '54px 54px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-8">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl border border-emerald-400/20 bg-slate-950/70 p-6 shadow-[0_0_50px_rgba(16,185,129,0.12)] backdrop-blur-xl md:p-8"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-black text-emerald-200">
                <Users className="h-3.5 w-3.5" />
                مجتمع ماب · مساحة مهنية للحلاقين
              </div>
              <h1 className="text-3xl font-black text-white md:text-5xl">
                مجتمع ماب
                <span className="block bg-gradient-to-l from-emerald-300 via-cyan-300 to-amber-300 bg-clip-text text-transparent">
                  خبرة الحلاقين في مكان واحد
                </span>
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-400">
                شارك أفكارك، ناقش زملاءك، وتابع فيديوهات YouTube المختارة — واسأل مساعد ماب عن تطوير الصالون باحتراف.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center">
                  <p className={`font-mono text-2xl font-black ${s.tone}`}>{s.value}</p>
                  <p className="mt-1 text-[0.62rem] text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.header>

        <section className="rounded-3xl border border-white/10 bg-slate-950/65 p-5 shadow-[0_0_45px_rgba(34,211,238,0.08)] backdrop-blur-xl md:p-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-black text-white">
                <Film className="h-5 w-5 text-cyan-300" />
                معرض فيديوهات الحلاقين
              </h2>
              <p className="mt-1 text-xs text-slate-500">فيديوهات YouTube قصيرة لا تتجاوز دقيقة واحدة</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {videos.map((video, i) => (
              <motion.article
                key={video.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]"
              >
                <div
                  className={cn(
                    'relative aspect-[9/14] bg-gradient-to-br',
                    video.youtubeVideoId ? 'bg-black' : video.gradient || VIDEO_GRADIENTS[0],
                  )}
                >
                  {video.youtubeVideoId ? (
                    <MapCommunityYoutubeEmbed videoId={video.youtubeVideoId} title={video.title} />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.14),transparent_48%)]" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-black/40 backdrop-blur-md transition-transform group-hover:scale-110">
                          <Video className="h-7 w-7 text-white" />
                        </div>
                      </div>
                    </>
                  )}
                  <span className="absolute bottom-3 left-3 z-10 rounded-full bg-black/60 px-2.5 py-1 text-[0.65rem] font-bold text-white">
                    {video.duration}
                  </span>
                  <span className="absolute right-3 top-3 z-10 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[0.62rem] text-slate-200">
                    {video.views} مشاهدة
                  </span>
                </div>
                <div className="space-y-1 p-3">
                  <p className="text-sm font-black text-white">{video.title}</p>
                  <p className="text-xs text-emerald-300">{video.barberName}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_22rem]">
          <div className="overflow-hidden rounded-3xl border border-emerald-400/18 bg-slate-950/70 shadow-[0_0_50px_rgba(16,185,129,0.10)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-black text-white">
                  <MessageCircle className="h-5 w-5 text-emerald-300" />
                  Map Chat
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {usingFallback
                    ? 'وضع احتياطي · Socket-ready'
                    : socketMode
                      ? 'بيانات حية · Socket-ready'
                      : 'بيانات حية · تحديث كل 30 ثانية'}
                </p>
              </div>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-200">
                {usingFallback ? 'احتياطي' : 'مباشر'}
              </span>
            </div>

            <div className="h-[30rem] overflow-y-auto px-5 py-4">
              <div className="flex flex-col gap-3">
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'max-w-[88%] rounded-2xl border px-4 py-3',
                      m.role === 'ai'
                        ? 'self-start border-cyan-400/25 bg-cyan-500/10 text-cyan-50'
                        : m.role === 'system'
                          ? 'self-center border-amber-400/25 bg-amber-500/10 text-amber-100'
                          : 'self-end border-white/10 bg-white/[0.06] text-slate-100',
                    )}
                  >
                    <div className="mb-1 flex items-center justify-between gap-3 text-[0.62rem] opacity-60">
                      <span>{m.author}</span>
                      <span dir="ltr">{formatTime(m.timestamp)}</span>
                    </div>
                    <p className="whitespace-pre-wrap break-words text-sm leading-7">{m.content}</p>
                  </motion.div>
                ))}
                {aiThinking ? (
                  <div className="self-start rounded-2xl border border-cyan-400/25 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
                    مساعد ماب يكتب…
                  </div>
                ) : null}
                <div ref={endRef} />
              </div>
            </div>

            {!isFounder ? (
              <div className="border-t border-white/10 p-4">
                <div className="flex items-end gap-3">
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void send();
                      }
                    }}
                    placeholder="اكتب رسالة للمجتمع… أو نادِ @مساعد_ماب"
                    className="min-h-14 flex-1 resize-none rounded-2xl border-emerald-400/20 bg-[#07120f] text-white placeholder:text-slate-600"
                  />
                  <Button
                    onClick={() => void send()}
                    disabled={!draft.trim() || aiThinking}
                    className="h-14 w-14 rounded-2xl bg-emerald-500 text-black hover:bg-emerald-400"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-t border-fuchsia-400/15 p-4 text-center text-[0.65rem] text-fuchsia-400/55">
                <Eye className="mx-auto mb-1 h-4 w-4 opacity-50" /> اطلاع صامت — التفاعل للمشرفين المعينين
              </div>
            )}
          </div>

          <aside className="rounded-3xl border border-cyan-400/20 bg-slate-950/70 p-5 shadow-[0_0_45px_rgba(34,211,238,0.10)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/35 bg-cyan-500/15">
                <Bot className="h-6 w-6 text-cyan-200" />
              </div>
              <div>
                <p className="font-black text-white">مساعد ماب</p>
                <p className="text-xs text-cyan-300/70">وكيل تطوير الصالونات</p>
              </div>
            </div>
            <div className="space-y-3 text-sm leading-7 text-slate-400">
              <p>
                يتدخل عند مناداته بـ <span className="font-mono text-cyan-300">@مساعد_ماب</span> أو عند ظهور سؤال مهني.
              </p>
              <p>محقون بمعرفة عن تطوير الصالونات، صيحات القصات، إدارة الأعمال، وتحسين تجربة العميل.</p>
            </div>
            <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/8 p-4">
              <p className="mb-2 flex items-center gap-2 text-xs font-bold text-emerald-200">
                <ShieldCheck className="h-4 w-4" />
                سياسة المجتمع
              </p>
              <p className="text-xs leading-6 text-slate-500">
                الرسائل تمر على رقابة تقنية تمنع الإساءة وتضمن نقاشاً مهنياً محترماً بين الشركاء.
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-5 w-full border-cyan-400/30 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20"
              onClick={() => {
                void send('@مساعد_ماب أعطني موضوع نقاش اليوم للحلاقين');
              }}
              disabled={isFounder}
            >
              <Sparkles className="ml-2 h-4 w-4" />
              افتح موضوع اليوم
            </Button>
          </aside>
        </section>
      </div>
    </div>
  );
}
