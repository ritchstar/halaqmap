/**
 * MapCommunity — مجتمع ماب للحلاقين المسجّلين والمفعّلون في حلاق ماب.
 *
 * Phase A: live feed from Supabase via Vercel API + YouTube embeds.
 * Falls back to local mock data when the API returns 503 / is unavailable.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAgentChatInputFocus, useAgentChatScroll } from '@/hooks/useAgentChatSurface';
import { motion } from 'framer-motion';
import {
  Bot,
  Eye,
  Film,
  HelpCircle,
  LayoutGrid,
  Lightbulb,
  Link2,
  MessageCircle,
  Send,
  Sparkles,
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
  type MapCommunityFeedResponse,
} from '@/lib/mapCommunityRemote';
import { POLL_MS } from '@/lib/pollingPolicy';
import { readBarberAuthSession } from '@/lib/barberPortalSession';
import {
  MAP_COMMUNITY_ACCESS_DENIED_AR,
  MAP_COMMUNITY_CHECKING_AR,
  MAP_COMMUNITY_DISCUSSION_PROMPTS,
  MAP_COMMUNITY_DOCTRINE_AR,
  MAP_COMMUNITY_FAQ,
  MAP_COMMUNITY_LOUNGE_HERO,
  MAP_COMMUNITY_LOUNGE_STRIPS,
  MAP_COMMUNITY_PRO_TIPS,
  MAP_COMMUNITY_QUICK_LINKS,
} from '@/config/mapCommunityCopy';

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
  const founderView = searchParams.get('view') === 'founder';
  const localPreviewMode = import.meta.env.DEV && searchParams.get('preview') === '1';
  const [access, setAccess] = useState<CommunityAccess>({ status: 'checking' });
  const [ephemeralMessages, setEphemeralMessages] = useState<CommunityMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [aiThinking, setAiThinking] = useState(false);
  const [feedData, setFeedData] = useState<MapCommunityFeedResponse | null>(null);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState<Error | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatSectionRef = useRef<HTMLElement>(null);
  const videosSectionRef = useRef<HTMLElement>(null);
  const toolsSectionRef = useRef<HTMLElement>(null);
  const seq = useRef(0);

  const socketMode = Boolean(import.meta.env.VITE_MAP_COMMUNITY_SOCKET_URL);
  const feedEnabled = access.status === 'allowed';

  const refreshFeed = useCallback(async () => {
    const res = await fetchMapCommunityFeedRemote();
    if (res.ok === false) throw new Error(res.error);
    return res.body;
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (localPreviewMode) {
        if (!cancelled) {
          setAccess({
            status: 'allowed',
            role: 'admin',
            name: 'معاينة محلية',
            isVerified: true,
            email: null,
            canPostLive: false,
          });
        }
        return;
      }

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
  }, [founderView, localPreviewMode]);

  useEffect(() => {
    if (!feedEnabled) {
      setFeedData(null);
      setFeedError(null);
      setFeedLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      if (!cancelled) setFeedLoading(true);
      try {
        const res = await refreshFeed();
        if (!cancelled) {
          setFeedData(res);
          setFeedError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setFeedError(e instanceof Error ? e : new Error('تعذّر تحميل مجتمع ماب'));
          setFeedData(null);
        }
      } finally {
        if (!cancelled) setFeedLoading(false);
      }
    };

    void load();
    const id = window.setInterval(() => {
      void load();
    }, POLL_MS.MAP_COMMUNITY_FEED);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [feedEnabled, refreshFeed]);

  const usingFallback = Boolean(feedError) || !feedData?.ok;

  useEffect(() => {
    if (access.status !== 'allowed' || usingFallback) return;
    void markMapCommunityReadRemote();
  }, [access.status, usingFallback]);

  const baseMessages = useMemo((): CommunityMessage[] => {
    if (usingFallback || !feedData?.messages?.length) {
      return FALLBACK_MESSAGES;
    }
    return feedData.messages.map((m) => ({
      id: m.id,
      author: m.author,
      role: normalizeRole(m.role),
      content: m.content,
      timestamp: m.timestamp,
    }));
  }, [usingFallback, feedData?.messages]);

  const videos = useMemo((): CommunityVideo[] => {
    if (usingFallback || !feedData?.videos?.length) {
      return FALLBACK_VIDEOS;
    }
    return feedData.videos.map((v, i) => ({
      id: v.id,
      barberName: v.barberName,
      title: v.title,
      duration: v.duration,
      views: v.views,
      youtubeVideoId: v.youtubeVideoId,
      gradient: VIDEO_GRADIENTS[i % VIDEO_GRADIENTS.length],
    }));
  }, [usingFallback, feedData?.videos]);

  const stats = useMemo(() => {
    if (usingFallback || !feedData?.stats) return FALLBACK_STATS;
    const s = feedData.stats;
    return [
      { label: 'حلاق نشط', value: String(s.activeBarbers || 0), tone: 'text-emerald-300' },
      { label: 'فيديو هذا الأسبوع', value: String(s.videosThisWeek || 0), tone: 'text-cyan-300' },
      { label: 'سؤال مهني', value: String(s.professionalQuestions || 0), tone: 'text-amber-300' },
    ];
  }, [usingFallback, feedData?.stats]);

  const messages = useMemo(
    () => [...baseMessages, ...ephemeralMessages],
    [baseMessages, ephemeralMessages],
  );

  const tipOfDay = useMemo(() => {
    const dayIndex = Math.floor(Date.now() / 86_400_000);
    return MAP_COMMUNITY_PRO_TIPS[dayIndex % MAP_COMMUNITY_PRO_TIPS.length];
  }, []);

  useAgentChatScroll(messagesRef, [messages, aiThinking]);
  useAgentChatInputFocus(aiThinking, inputRef);

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
            'يمكنك تصفّح مجتمع ماب، لكن النشر المباشر يتطلّب الوصول عبر رابطك الخاص الذي وصلك في البريد من منصة حلاق ماب.',
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
      const refreshed = await refreshFeed();
      setFeedData(refreshed);
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
    founderView,
    messages,
    pushEphemeral,
    refreshFeed,
    usingFallback,
  ]);

  if (access.status === 'checking') {
    return (
      <div dir="rtl" className="flex min-h-[70vh] items-center justify-center bg-[#0a0f0d] px-4 text-white">
        <div className="rounded-3xl border border-emerald-400/20 bg-slate-950/80 p-8 text-center shadow-[0_0_45px_rgba(16,185,129,0.12)]">
          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-emerald-400/30" />
          <p className="font-black">{MAP_COMMUNITY_CHECKING_AR}</p>
          <p className="mt-2 text-[0.95rem] leading-7 text-slate-500">{MAP_COMMUNITY_DOCTRINE_AR}</p>
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
          <h1 className="text-2xl font-black">مجتمع ماب</h1>
          <p className="mx-auto mt-3 max-w-md text-[0.96rem] leading-8 text-slate-400">
            {MAP_COMMUNITY_ACCESS_DENIED_AR}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild className="bg-emerald-500 text-black hover:bg-emerald-400">
              <Link to={ROUTE_PATHS.BARBERS_LANDING}>الصفحة التسويقية</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isFounder = access.status === 'allowed' && access.role === 'founder';
  const readOnlyCommunity = access.status === 'allowed' && access.canPostLive === false;
  const liveLabel = usingFallback ? 'احتياطي' : socketMode ? 'مباشر' : 'محدّث';

  const toolsPanel = (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-[1.6rem] border border-cyan-200 bg-[linear-gradient(155deg,rgba(236,254,255,0.96),rgba(255,255,255,0.98))] p-5 shadow-[0_18px_38px_rgba(34,211,238,0.10)]">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-700">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="font-black text-slate-950">مساعد ماب</p>
            <p className="text-[0.84rem] leading-6 text-cyan-700/80">رفيق النقاش اليومي للحلاقين</p>
          </div>
        </div>
        <p className="text-[0.98rem] leading-8 text-slate-600">
          نادِه بـ <span className="font-mono text-cyan-700">@مساعد_ماب</span> داخل المجلس، واسأله عن
          فكرة اليوم أو تطوير خدمة أو رفع جودة النتيجة.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 w-full border-cyan-200 bg-cyan-50/80 text-cyan-800 hover:bg-cyan-100"
          onClick={() => {
            chatSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            void send('@مساعد_ماب أعطني موضوع نقاش اليوم للحلاقين');
          }}
          disabled={isFounder}
        >
          <Sparkles className="ml-2 h-4 w-4" />
          افتح موضوع اليوم
        </Button>
      </div>

      <div className="rounded-[1.6rem] border border-amber-200 bg-[linear-gradient(155deg,rgba(255,247,237,0.96),rgba(255,255,255,0.98))] p-5 shadow-[0_18px_38px_rgba(245,158,11,0.10)]">
        <p className="mb-2 flex items-center gap-2 text-sm font-black text-amber-800">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          نصيحة اليوم
        </p>
        <p className="text-sm leading-7 text-slate-600">{tipOfDay}</p>
      </div>

      <div className="rounded-[1.6rem] border border-emerald-200 bg-[linear-gradient(155deg,rgba(236,253,245,0.96),rgba(255,255,255,0.98))] p-5 shadow-[0_18px_38px_rgba(16,185,129,0.10)]">
        <p className="mb-3 flex items-center gap-2 text-sm font-black text-emerald-800">
          <Link2 className="h-4 w-4 text-emerald-600" />
          اختصارات مفيدة
        </p>
        <ul className="space-y-2">
          {MAP_COMMUNITY_QUICK_LINKS.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className="group flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-white/90 px-3 py-2.5 transition-colors hover:border-emerald-200 hover:bg-emerald-50/70"
              >
                <div className="min-w-0 text-right">
                  <p className="text-[0.98rem] font-bold text-slate-950 group-hover:text-emerald-900">{item.label}</p>
                  <p className="mt-0.5 text-[0.84rem] leading-6 text-slate-500">{item.hint}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-[1.6rem] border border-slate-200 bg-white/95 p-5 shadow-[0_18px_38px_rgba(148,163,184,0.10)]">
        <p className="mb-3 flex items-center gap-2 text-sm font-black text-slate-900">
          <HelpCircle className="h-4 w-4 text-cyan-600" />
          أسئلة متكررة بين الحلاقين
        </p>
        <ul className="space-y-3">
          {MAP_COMMUNITY_FAQ.map((item) => (
            <li key={item.q} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
              <p className="text-[0.98rem] font-bold text-slate-800">{item.q}</p>
              <p className="mt-1 text-[0.9rem] leading-7 text-slate-500">{item.a}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div dir="rtl" className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#fcfbf6_0%,#f2f8f5_38%,#f3f7fb_100%)] text-slate-900">
      {localPreviewMode ? (
        <div className="relative z-20 border-b border-cyan-200 bg-cyan-50/95 px-3 py-2 text-center text-[0.9rem] leading-7 text-cyan-900">
          وضع معاينة محلي فقط — هذا المسار مخصص للتطوير ولن يعمل بهذا الشكل في الإنتاج
        </div>
      ) : null}
      {readOnlyCommunity ? (
        <div className="relative z-20 border-b border-amber-200 bg-amber-50/95 px-3 py-2 text-center text-[0.9rem] leading-7 text-amber-900">
          للنشر المباشر في المجتمع استخدم رابطك الخاص المرسل إلى بريدك من منصة حلاق ماب.
        </div>
      ) : null}
      {isFounder ? (
        <div className="relative z-20 flex items-center justify-center gap-2 border-b border-fuchsia-200 bg-fuchsia-50/95 px-3 py-2 text-[0.88rem] text-fuchsia-800">
          <Eye className="h-4 w-4 shrink-0 text-fuchsia-500" />
          <span className="font-bold">اطلاع صامت</span>
          <span className="text-fuchsia-700/75">قراءة فقط</span>
        </div>
      ) : null}
      {usingFallback ? (
        <p className="relative z-20 border-b border-amber-200 bg-amber-50/95 px-3 py-1.5 text-center text-[0.86rem] leading-7 text-amber-800">
          وضع احتياطي — البيانات الحية غير متاحة مؤقتاً
        </p>
      ) : null}

      <motion.button
        type="button"
        onClick={() => navigate(ROUTE_PATHS.SAUDI_AGENT)}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, type: 'spring', stiffness: 280, damping: 26 }}
        whileHover={{ x: 5, scale: 1.04 }}
        whileTap={{ scale: 0.95 }}
        className="fixed left-0 z-[48] hidden flex-col items-center gap-1.5 px-2.5 py-3 sm:flex"
        style={{
          top: '42%',
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

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[8%] top-[5%] h-[28rem] w-[28rem] rounded-full bg-emerald-300/7 blur-[135px]" />
        <div className="absolute left-[4%] top-[24%] h-[26rem] w-[26rem] rounded-full bg-cyan-200/10 blur-[135px]" />
        <div className="absolute bottom-[8%] right-[20%] h-[18rem] w-[18rem] rounded-full bg-amber-200/9 blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(148,163,184,0.8) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 md:px-5 md:py-8">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/92 p-5 shadow-[0_22px_50px_rgba(148,163,184,0.14)] backdrop-blur md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[0.82rem] font-black text-emerald-800">
              <MessageCircle className="h-3.5 w-3.5" />
              {MAP_COMMUNITY_LOUNGE_HERO.badge}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-[0.8rem] font-bold text-cyan-800">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {liveLabel}
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
            <div>
              <h1 className="text-[clamp(2rem,4.4vw,3.1rem)] font-black leading-[1.1] text-slate-950">
                {MAP_COMMUNITY_LOUNGE_HERO.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                {MAP_COMMUNITY_LOUNGE_HERO.lead}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {MAP_COMMUNITY_LOUNGE_STRIPS.map((strip) => (
                  <span
                    key={strip}
                    className="inline-flex max-w-full items-start gap-2 rounded-full border border-white bg-white/92 px-4 py-2.5 text-[0.95rem] leading-7 text-slate-700 shadow-[0_10px_22px_rgba(148,163,184,0.07)]"
                  >
                    <Sparkles className="mt-1 h-3.5 w-3.5 shrink-0 text-amber-500" />
                    <span>{strip}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-amber-200 bg-[linear-gradient(155deg,rgba(255,247,237,0.92),rgba(255,255,255,0.98))] p-5 shadow-[0_18px_38px_rgba(245,158,11,0.10)]">
              <p className="mb-2 flex items-center gap-2 text-sm font-black text-amber-800">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                نبضة اليوم
              </p>
              <p className="text-sm leading-7 text-slate-600">{tipOfDay}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
                    <p className={`text-lg font-black tabular-nums ${s.tone}`}>{s.value}</p>
                    <p className="mt-1 text-[0.82rem] font-bold text-slate-600">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => chatSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-emerald-500 to-emerald-700 px-5 py-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(16,185,129,0.18)]"
            >
              <MessageCircle className="h-4 w-4" />
              ابدأ من مجلس المحادثة
            </button>
            <button
              type="button"
              onClick={() => videosSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50/90 px-5 py-3 text-sm font-bold text-cyan-800"
            >
              <Film className="h-4 w-4" />
              فيديوهات الحلاقين
            </button>
            <button
              type="button"
              onClick={() => toolsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700"
            >
              <LayoutGrid className="h-4 w-4" />
              مساعدات يومية
            </button>
          </div>
        </section>

        <section ref={chatSectionRef} className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.72fr)]">
          <div className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white/92 shadow-[0_20px_46px_rgba(148,163,184,0.12)] backdrop-blur">
            <div className="border-b border-slate-200 px-4 py-4 md:px-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[0.82rem] font-black tracking-[0.16em] text-emerald-700">مجلس اليوم</p>
                  <h2 className="mt-1 text-2xl font-black text-slate-950">Map Chat</h2>
                  <p className="mt-2 text-[0.96rem] leading-8 text-slate-600">
                    مساحة السؤال اليومي وتبادل الخبرة بين الحلاقين المفعّلين في حلاق ماب.
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-900">
                  <p className="font-black">{access.name}</p>
                  <p className="mt-1 text-[0.82rem] text-emerald-700/80">
                    {readOnlyCommunity ? 'تصفّح مباشر من جلستك الحالية' : 'جلسة نشطة داخل المجتمع'}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-slate-100 px-4 py-3 md:px-5">
              <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {MAP_COMMUNITY_DISCUSSION_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    disabled={isFounder || aiThinking}
                    onClick={() => {
                      setDraft(prompt);
                      void send(prompt);
                    }}
                    className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50/90 px-3 py-1.5 text-[0.84rem] font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 disabled:opacity-45"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div ref={messagesRef} className="max-h-[min(55vh,38rem)] overflow-y-auto px-4 py-4 md:px-5">
              <div className="mx-auto flex max-w-3xl flex-col gap-3">
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'max-w-[92%] rounded-[1.35rem] border px-4 py-3 shadow-sm',
                      m.role === 'ai'
                        ? 'self-start border-cyan-200 bg-cyan-50/95 text-slate-800'
                        : m.role === 'system'
                          ? 'self-center border-amber-200 bg-amber-50/95 text-amber-900'
                          : 'self-end border-emerald-200 bg-white text-slate-900',
                    )}
                  >
                    <div className="mb-1 flex items-center justify-between gap-3 text-[0.76rem] text-slate-500">
                      <span className="font-bold">{m.author}</span>
                      <span dir="ltr">{formatTime(m.timestamp)}</span>
                    </div>
                    <p dir="rtl" className="chat-arabic-text whitespace-pre-wrap break-words text-[0.96rem] leading-8">
                      {m.content}
                    </p>
                  </motion.div>
                ))}
                {aiThinking ? (
                  <div className="self-start rounded-2xl border border-cyan-200 bg-cyan-50/95 px-4 py-3 text-[0.94rem] text-cyan-900">
                    مساعد ماب يكتب…
                  </div>
                ) : null}
              </div>
            </div>

            {!isFounder ? (
              <div className="border-t border-slate-200 bg-white/95 p-4 md:p-5">
                <div className="mx-auto flex max-w-3xl items-end gap-2">
                  <Textarea
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void send();
                      }
                    }}
                    placeholder="اكتب للمجلس… أو نادِ @مساعد_ماب"
                    className="min-h-12 flex-1 resize-none rounded-2xl border-emerald-200 bg-slate-50 text-[0.96rem] text-slate-900 placeholder:text-slate-400"
                  />
                  <Button
                    onClick={() => void send()}
                    disabled={!draft.trim() || aiThinking}
                    className="h-12 w-12 shrink-0 rounded-2xl bg-emerald-500 text-black hover:bg-emerald-400"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-t border-fuchsia-200 p-3 text-center text-[0.68rem] text-fuchsia-700/70">
                اطلاع صامت — لا تفاعل
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-[1.6rem] border border-cyan-200 bg-[linear-gradient(155deg,rgba(236,254,255,0.96),rgba(255,255,255,0.98))] p-5 shadow-[0_18px_38px_rgba(34,211,238,0.10)]">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-700">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-black text-slate-950">مساعد ماب</p>
                  <p className="text-[0.82rem] text-cyan-700/80">يرافقك في موضوع اليوم</p>
                </div>
              </div>
              <p className="text-[0.96rem] leading-8 text-slate-600">
                اكتب <span className="font-mono text-cyan-700">@مساعد_ماب</span> داخل المجلس، أو اطلب منه
                أن يفتح موضوعًا مناسبًا لصالونك هذا الأسبوع.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full border-cyan-200 bg-cyan-50/80 text-cyan-800 hover:bg-cyan-100"
                onClick={() => void send('@مساعد_ماب أعطني موضوع نقاش اليوم للحلاقين')}
                disabled={isFounder}
              >
                <Sparkles className="ml-2 h-4 w-4" />
                افتح موضوع اليوم
              </Button>
            </div>

            <div className="rounded-[1.6rem] border border-amber-200 bg-[linear-gradient(155deg,rgba(255,247,237,0.96),rgba(255,255,255,0.98))] p-5 shadow-[0_18px_38px_rgba(245,158,11,0.10)]">
              <p className="mb-2 flex items-center gap-2 text-sm font-black text-amber-800">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                نبضة اليوم
              </p>
              <p className="text-[0.96rem] leading-8 text-slate-600">{tipOfDay}</p>
            </div>

            <div className="rounded-[1.6rem] border border-emerald-200 bg-[linear-gradient(155deg,rgba(236,253,245,0.96),rgba(255,255,255,0.98))] p-5 shadow-[0_18px_38px_rgba(16,185,129,0.10)]">
              <p className="mb-2 flex items-center gap-2 text-sm font-black text-emerald-800">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                من يدخل المجلس؟
              </p>
              <p className="text-[0.96rem] leading-8 text-slate-600">{MAP_COMMUNITY_DOCTRINE_AR}</p>
            </div>
          </aside>
        </section>

        <section ref={videosSectionRef} className="mt-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[0.82rem] font-black tracking-[0.16em] text-cyan-700">لقطات يومية</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">فيديوهات الحلاقين</h2>
              <p className="mt-2 text-[0.96rem] leading-8 text-slate-600">
                لقطات قصيرة من أعمال المجتمع، أفكار تصوير، ونتائج يحب الحلاق أن يراها بسرعة.
              </p>
            </div>
          </div>
          <div className="mb-4 rounded-[1.35rem] border border-amber-200 bg-[linear-gradient(155deg,rgba(255,247,237,0.96),rgba(255,255,255,0.98))] px-4 py-4 shadow-[0_16px_34px_rgba(245,158,11,0.08)]">
            <p className="text-[0.74rem] font-black tracking-[0.14em] text-amber-800">
              مسؤولية النشر والامتثال
            </p>
            <p className="mt-2 text-[0.92rem] leading-7 text-slate-700">
              يلتزم صاحب الصالون بأن تكون المقاطع المنشورة خالية من أي مخالفات تشريعية أو لقطات تمس الذوق العام، ويُمنع نشر موسيقى صاخبة أو تصوير أي زبون أو شخص آخر دون موافقته الخطية الصريحة. المسؤولية الكاملة تقع على الناشر بصفته المتحكم بالمحتوى، مع خضوع الفيديوهات لرقابة تقنية صارمة.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video, i) => (
              <motion.article
                key={video.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white/95 shadow-[0_16px_34px_rgba(148,163,184,0.10)]"
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
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Video className="h-8 w-8 text-white/80" />
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 z-10 rounded-full bg-black/60 px-2 py-0.5 text-[0.6rem] font-bold text-white">
                    {video.duration}
                  </span>
                </div>
                <div className="space-y-1 p-3">
                  <p className="text-sm font-black text-slate-950">{video.title}</p>
                  <p className="text-[0.84rem] font-semibold text-emerald-700">{video.barberName}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section ref={toolsSectionRef} className="mt-8 pb-10">
          <div className="mb-4">
            <p className="text-[0.82rem] font-black tracking-[0.16em] text-amber-700">مساعدات يومية</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">أدوات خفيفة تخدم يومك</h2>
            <p className="mt-2 text-[0.96rem] leading-8 text-slate-600">
              كل ما تحتاجه للبقاء داخل النبض اليومي: موضوع جاهز، نصيحة، اختصار، وسؤال متكرر بين الحلاقين.
            </p>
          </div>
          {toolsPanel}
        </section>
      </div>
    </div>
  );
}
