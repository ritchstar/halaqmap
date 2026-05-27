/**
 * MapCommunity — مجتمع ماب للشركاء.
 *
 * صفحة واجهة داخل مسار الشركاء:
 * - معرض فيديوهات دقيقة واحدة.
 * - شات عام Map Chat.
 * - مساعد ماب يتدخل عند @مساعد_ماب أو الأسئلة المهنية.
 *
 * ملاحظة تقنية:
 * تم تصميم طبقة الشات لتكون Socket.io-ready عبر VITE_MAP_COMMUNITY_SOCKET_URL،
 * مع fallback محلي/API كي تعمل فوراً على Vercel بدون خادم WebSocket دائم.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Eye,
  Film,
  MessageCircle,
  Send,
  Sparkles,
  UploadCloud,
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
import { Link, useSearchParams } from 'react-router-dom';

type CommunityMessage = {
  id: string;
  author: string;
  role: 'barber' | 'ai' | 'system';
  content: string;
  timestamp: string;
};

type CommunityVideo = {
  id: string;
  barberName: string;
  title: string;
  duration: string;
  gradient: string;
  views: string;
};

type CommunityAccess =
  | { status: 'checking' }
  | { status: 'nologin' }
  | { status: 'denied'; email: string | null }
  | { status: 'allowed'; role: 'admin' | 'barber' | 'founder'; name: string; isVerified: boolean; email: string | null };

const badWords = ['سب', 'قذف', 'عنصري', 'إهانة', 'فضيحة'];

const videos: CommunityVideo[] = [
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

const starterMessages: CommunityMessage[] = [
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

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
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
  const founderView = searchParams.get('view') === 'founder';
  const [access, setAccess] = useState<CommunityAccess>({ status: 'checking' });
  const [messages, setMessages] = useState<CommunityMessage[]>(starterMessages);
  const [draft, setDraft] = useState('');
  const [aiThinking, setAiThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const seq = useRef(0);

  const socketMode = Boolean(import.meta.env.VITE_MAP_COMMUNITY_SOCKET_URL);

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
      if (!user || !email) {
        if (!cancelled) setAccess({ status: 'nologin' });
        return;
      }

      const admin = await resolveAdminAccess(email);
      if (admin.allowed) {
        if (!cancelled) {
          setAccess({
            status: 'allowed',
            role: founderView && admin.bootstrap ? 'founder' : 'admin',
            name: founderView && admin.bootstrap ? '' : (admin.displayName || 'مشرف حلاق ماب'),
            isVerified: true,
            email,
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
          });
        }
        return;
      }

      if (!cancelled) setAccess({ status: 'denied', email });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, aiThinking]);

  const stats = useMemo(
    () => [
      { label: 'حلاق نشط', value: '128', tone: 'text-emerald-300' },
      { label: 'فيديو هذا الأسبوع', value: '36', tone: 'text-cyan-300' },
      { label: 'سؤال مهني', value: '214', tone: 'text-amber-300' },
    ],
    [],
  );

  const pushMessage = useCallback((msg: Omit<CommunityMessage, 'id' | 'timestamp'>) => {
    setMessages((prev) => [
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
    if (!content || aiThinking) return;

    if (containsBadWords(content)) {
      pushMessage({
        author: 'نظام المجتمع',
        role: 'system',
        content: 'تم إيقاف الرسالة قبل النشر. خلّونا نحافظ على مجتمع مهني ومحترم.',
      });
      setDraft('');
      return;
    }

    const userMessage: Omit<CommunityMessage, 'id' | 'timestamp'> = {
      author: access.status === 'allowed' ? access.name : 'زائر',
      role: 'barber',
      content,
    };
    pushMessage(userMessage);
    if (!overrideText) setDraft('');

    setAiThinking(true);
    const ai = await askMapAssistant(content, [...messages, { ...userMessage, id: 'draft', timestamp: new Date().toISOString() }]);
    setAiThinking(false);

    if (ai.moderated && ai.reply) {
      pushMessage({ author: 'نظام المجتمع', role: 'system', content: ai.reply });
      return;
    }
    if (ai.shouldReply && ai.reply) {
      pushMessage({ author: 'مساعد ماب', role: 'ai', content: ai.reply });
    }
  }, [access, aiThinking, draft, messages, pushMessage]);

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
              <Link to={ROUTE_PATHS.BARBER_LOGIN}>دخول الحلاق</Link>
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

  return (
    <div
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-[#0a0f0d] px-4 py-10 text-slate-100"
    >
      {/* شريط المؤسس — اطلاع صامت */}
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

      {/* Glow Background */}
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
        {/* Header */}
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
                شارك أعمالك القصيرة، ناقش زملاءك، واسأل مساعد ماب عن تطوير الصالون، صيحات القصات،
                وإدارة العمل اليومي باحتراف.
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

        {/* Videos */}
        <section className="rounded-3xl border border-white/10 bg-slate-950/65 p-5 shadow-[0_0_45px_rgba(34,211,238,0.08)] backdrop-blur-xl md:p-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-black text-white">
                <Film className="h-5 w-5 text-cyan-300" />
                معرض فيديوهات الحلاقين
              </h2>
              <p className="mt-1 text-xs text-slate-500">فيديوهات قصيرة لا تتجاوز دقيقة واحدة</p>
            </div>
            {access.isVerified ? (
              <Button className="gap-2 border border-emerald-400/30 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25">
                <UploadCloud className="h-4 w-4" />
                رفع فيديو
              </Button>
            ) : null}
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
                <div className={`relative aspect-[9/14] bg-gradient-to-br ${video.gradient}`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.14),transparent_48%)]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-black/40 backdrop-blur-md transition-transform group-hover:scale-110">
                      <Video className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-[0.65rem] font-bold text-white">
                    {video.duration}
                  </span>
                  <span className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[0.62rem] text-slate-200">
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

        {/* Chat */}
        <section className="grid gap-5 lg:grid-cols-[1fr_22rem]">
          <div className="overflow-hidden rounded-3xl border border-emerald-400/18 bg-slate-950/70 shadow-[0_0_50px_rgba(16,185,129,0.10)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-black text-white">
                  <MessageCircle className="h-5 w-5 text-emerald-300" />
                  Map Chat
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {socketMode ? 'متصل بطبقة Socket.io' : 'وضع تشغيل محلي سريع · Socket-ready'}
                </p>
              </div>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-200">
                مباشر الآن
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

          {/* AI Agent Card */}
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
