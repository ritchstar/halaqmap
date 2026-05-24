/**
 * StaffHubPage — مركز الوكلاء
 *
 * صفحة مستقلة تضم كل الوكلاء غير الأساسيين (خارج لوحة التحكم الرئيسية):
 * المستشار المالي · ZATCA · مستشار الأزمات · الجناح الهندسي
 * منسق الشركاء · المناوب الميداني · B2C/B2B · المتحدث · الناظر القانوني
 *
 * تصميم: داكن تكتيكي · شبكة وكلاء · محادثة حديثة بفقاعات
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, Send, Users, Bot } from 'lucide-react';
import { getAdminDashboardPathFor } from '@/config/adminAuth';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';
import { resolveAdminAccess } from '@/lib/adminAccessRemote';
import { AiStaffControlRoom } from '@/modules/ai-staff/components/AiStaffControlRoom';

type AuthPhase = 'loading' | 'ok' | 'denied' | 'nologin';

// ─── Modern chat bubble for any hub agent ─────────────────────────────────────
type Turn = { role: 'user' | 'assistant'; content: string; id: string };

function HubAgentChat({
  agentName,
  apiRoute,
  sessionToken,
  onClose,
}: {
  agentName: string;
  apiRoute: string;
  sessionToken: string | null;
  onClose: () => void;
}) {
  const [turns, setTurns] = useState<Turn[]>([
    { role: 'assistant', content: `مرحباً — أنا ${agentName}. كيف أخدمك؟`, id: 'welcome' },
  ]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const seq = useRef(0);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns, loading]);

  useEffect(() => {
    setTimeout(() => textRef.current?.focus(), 100);
  }, []);

  const handleSend = useCallback(async () => {
    const msg = draft.trim();
    if (!msg || loading) return;
    setDraft('');
    if (textRef.current) textRef.current.style.height = 'auto';

    const next: Turn[] = [...turns, { role: 'user', content: msg, id: `u-${++seq.current}` }];
    setTurns(next);
    setLoading(true);

    try {
      const res = await fetch(apiRoute, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        },
        body: JSON.stringify({
          messages: next.slice(-12).map((t) => ({ role: t.role, content: t.content })),
        }),
      });
      const data = (await res.json()) as { reply?: string; response?: string; error?: string };
      const reply = data.reply ?? data.response ?? 'لم يصل الرد — حاول مجدداً.';
      setTurns((p) => [...p, { role: 'assistant', content: reply, id: `a-${++seq.current}` }]);
    } catch {
      setTurns((p) => [...p, { role: 'assistant', content: 'خلل في الاتصال — عاود المحاولة.', id: `a-${++seq.current}` }]);
    }
    setLoading(false);
  }, [draft, loading, turns, apiRoute, sessionToken]);

  return (
    <div dir="rtl" className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-teal-400/30 bg-teal-500/10">
            <Bot className="h-4 w-4 text-teal-300" />
          </div>
          <span className="text-sm font-bold text-white">{agentName}</span>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <div className="flex flex-col gap-2.5">
          {turns.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={t.role === 'assistant'
                ? 'self-start max-w-[88%] rounded-2xl rounded-tr-sm border border-teal-400/18 bg-teal-500/8 px-3.5 py-2.5 text-[0.85rem] leading-6 text-teal-50'
                : 'self-end max-w-[88%] rounded-2xl rounded-tl-sm border border-white/12 bg-white/8 px-3.5 py-2.5 text-[0.85rem] leading-6 text-slate-100'}
            >
              <p className="mb-0.5 text-[0.55rem] font-bold opacity-40">
                {t.role === 'assistant' ? agentName : 'أنت'}
              </p>
              <p className="whitespace-pre-wrap break-words" style={{ unicodeBidi: 'plaintext' }}>{t.content}</p>
            </motion.div>
          ))}
          {loading && (
            <div className="self-start flex items-center gap-1.5 rounded-2xl rounded-tr-sm border border-teal-400/18 bg-teal-500/8 px-4 py-3">
              {[0,1,2].map(i => (
                <motion.div key={i} className="h-1.5 w-1.5 rounded-full bg-teal-400"
                  animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 1, delay: i*0.16, repeat: Infinity }} />
              ))}
            </div>
          )}
          <div ref={endRef} className="h-1" />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-white/10 bg-[#020912]/90 px-3 py-3">
        <div className="flex items-end gap-2">
          <textarea ref={textRef} value={draft}
            onChange={(e) => { setDraft(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
            disabled={loading}
            placeholder="اكتب سؤالك… (Enter للإرسال)"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '120px', resize: 'none', overflowY: 'auto' }}
            className="flex-1 rounded-xl border border-white/15 bg-[#0a1628] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/25 transition-all"
            dir="rtl"
          />
          <motion.button type="button" onClick={() => void handleSend()} disabled={!draft.trim() || loading}
            whileTap={draft.trim() && !loading ? { scale: 0.9 } : undefined}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-l from-teal-500 to-teal-700 text-white shadow shadow-teal-500/25 transition-all hover:from-teal-400 disabled:cursor-not-allowed disabled:opacity-40">
            <Send className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function StaffHubPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [phase, setPhase] = useState<AuthPhase>('loading');
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [can, setCan] = useState<(p: string) => boolean>(() => () => false);
  const [isBootstrap, setIsBootstrap] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!isSupabaseConfigured()) { if (!cancelled) setPhase('nologin'); return; }
      const client = getSupabaseClient();
      if (!client) { if (!cancelled) setPhase('nologin'); return; }
      const { data } = await client.auth.getSession();
      const email = data.session?.user?.email;
      if (!email) { if (!cancelled) setPhase('nologin'); return; }
      const access = await resolveAdminAccess(email);
      if (!access.allowed) { if (!cancelled) setPhase('nologin'); return; }
      if (!cancelled) {
        setPhase('ok');
        setIsBootstrap(Boolean(access.bootstrap));
        setSessionToken(data.session?.access_token ?? null);
        const perms = access.permissions;
        setCan(() => (p: string) => Boolean(access.bootstrap || (perms as Record<string, boolean>)[p]));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (phase === 'loading') return (
    <div className="flex h-screen items-center justify-center bg-[#020912] text-white">
      <p className="text-slate-400">جاري التحقق من الصلاحيات…</p>
    </div>
  );

  if (phase !== 'ok') return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#020912] text-white" dir="rtl">
      <p className="text-amber-200">يلزم تسجيل الدخول للوصول لمركز الوكلاء</p>
      <button onClick={() => navigate(getAdminDashboardPathFor(location.pathname))}
        className="rounded-xl border border-white/15 px-6 py-2.5 text-sm text-slate-200 hover:bg-white/5">
        العودة
      </button>
    </div>
  );

  return (
    <div dir="rtl" className="min-h-screen bg-[#020912]" style={{ fontFamily: 'Tajawal, system-ui' }}>
      {/* Grid texture */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.022]"
        style={{ backgroundImage: 'linear-gradient(rgba(20,184,166,1) 1px,transparent 1px),linear-gradient(90deg,rgba(20,184,166,1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      <div className="pointer-events-none fixed -right-60 top-20 h-96 w-96 rounded-full bg-teal-500/5 blur-[130px]" />
      <div className="pointer-events-none fixed -left-40 bottom-10 h-80 w-80 rounded-full bg-amber-500/4 blur-[110px]" />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/8 bg-[#020912]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-400/30 bg-teal-500/10">
              <Users className="h-5 w-5 text-teal-300" />
            </div>
            <div>
              <h1 className="text-base font-black text-white">مركز الوكلاء</h1>
              <p className="text-[0.58rem] text-teal-400/55">Staff Intelligence Hub</p>
            </div>
          </div>
          <button
            onClick={() => navigate(getAdminDashboardPathFor(location.pathname))}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition-colors"
          >
            <ArrowRight className="h-3.5 w-3.5" /> لوحة التحكم
          </button>
        </div>
      </header>

      {/* Staff Control Room — Hub mode */}
      <main className="relative z-10 mx-auto max-w-7xl px-5 py-8">
        <div className="mb-6">
          <p className="text-sm text-slate-500">
            جميع الوكلاء المتخصصين — التمويل · الامتثال · الهندسة · التسويق · الإعلام · القانون
          </p>
        </div>

        <AiStaffControlRoom
          can={can as (p: import('@/lib/adminPermissions').AdminPermissionKey) => boolean}
          canViewZatcaFinancialOffice={isBootstrap || can('view_billing')}
          isBootstrapAdmin={isBootstrap}
          dashboardMode={false}
        />
      </main>
    </div>
  );
}
