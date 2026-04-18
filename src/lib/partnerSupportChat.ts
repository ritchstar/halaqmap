/**
 * محادثة دعم فني لمسار الشركاء — جلسة 60 دقيقة، معزولة لكل رابط فريد (?t=).
 * التخزين محلي في المتصفح (مثل شات العميل–الحلاق)؛ لا يُرسل إلى خادم.
 */

const SESSION_TTL_MS = 60 * 60 * 1000;

const SESSION_STORAGE_PREFIX = 'halaqmap-partner-support-session:';
const CONVERSATIONS_STORAGE_KEY = 'halaqmap-partner-support-conversations:v1';

export type PartnerSupportSender = 'visitor' | 'support';

export interface PartnerSupportMessage {
  id: string;
  sender: PartnerSupportSender;
  text: string;
  createdAt: string;
}

interface ChatSession {
  sessionId: string;
  expiresAt: string;
}

interface StoredConversation {
  threadToken: string;
  sessionId: string;
  expiresAt: string;
  messages: PartnerSupportMessage[];
}

type ConversationMap = Record<string, StoredConversation>;

function nowMs(): number {
  return Date.now();
}

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function sessionKey(threadToken: string): string {
  return `${SESSION_STORAGE_PREFIX}${threadToken}`;
}

function conversationKey(threadToken: string, sessionId: string): string {
  return `${threadToken}:${sessionId}`;
}

function createSession(): ChatSession {
  const expiresAt = new Date(nowMs() + SESSION_TTL_MS).toISOString();
  return {
    sessionId: crypto.randomUUID(),
    expiresAt,
  };
}

function readConversations(): ConversationMap {
  if (typeof localStorage === 'undefined') return {};
  return safeJsonParse<ConversationMap>(localStorage.getItem(CONVERSATIONS_STORAGE_KEY), {});
}

function writeConversations(value: ConversationMap): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(value));
}

export function clearExpiredPartnerSupportConversations(): void {
  const conversations = readConversations();
  const t = nowMs();
  const cleaned: ConversationMap = {};
  for (const [key, conv] of Object.entries(conversations)) {
    if (new Date(conv.expiresAt).getTime() > t) cleaned[key] = conv;
  }
  writeConversations(cleaned);
}

export function getOrCreatePartnerSupportSession(threadToken: string): ChatSession {
  clearExpiredPartnerSupportConversations();
  const key = sessionKey(threadToken);
  const existing = safeJsonParse<ChatSession | null>(sessionStorage.getItem(key), null);

  if (existing) {
    const exp = new Date(existing.expiresAt).getTime();
    if (exp > nowMs()) return existing;
  }

  const next = createSession();
  sessionStorage.setItem(key, JSON.stringify(next));
  return next;
}

export function restartPartnerSupportSession(threadToken: string): ChatSession {
  const next = createSession();
  sessionStorage.setItem(sessionKey(threadToken), JSON.stringify(next));
  return next;
}

export function getPartnerSupportRemainingMs(session: ChatSession): number {
  return Math.max(0, new Date(session.expiresAt).getTime() - nowMs());
}

export function isPartnerSupportExpired(session: ChatSession): boolean {
  return getPartnerSupportRemainingMs(session) <= 0;
}

export function loadPartnerSupportConversation(
  threadToken: string,
  sessionId: string
): PartnerSupportMessage[] {
  const conversations = readConversations();
  const key = conversationKey(threadToken, sessionId);
  const conv = conversations[key];
  if (!conv) return [];
  if (new Date(conv.expiresAt).getTime() <= nowMs()) return [];
  return conv.messages;
}

export function appendPartnerSupportMessage(
  threadToken: string,
  session: ChatSession,
  sender: PartnerSupportSender,
  text: string
): PartnerSupportMessage[] {
  const conversations = readConversations();
  const key = conversationKey(threadToken, session.sessionId);
  const existing = conversations[key];
  const expiresAt =
    existing?.expiresAt && new Date(existing.expiresAt).getTime() > nowMs()
      ? existing.expiresAt
      : session.expiresAt;

  const message: PartnerSupportMessage = {
    id: crypto.randomUUID(),
    sender,
    text,
    createdAt: new Date().toISOString(),
  };

  const nextMessages = [...(existing?.messages ?? []), message];
  conversations[key] = {
    threadToken,
    sessionId: session.sessionId,
    expiresAt,
    messages: nextMessages,
  };
  writeConversations(conversations);
  return nextMessages;
}

/** رمز مسار آمن للاستخدام في ?t= */
export function generatePartnerSupportThreadToken(): string {
  return crypto.randomUUID();
}
