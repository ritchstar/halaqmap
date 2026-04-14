const SESSION_TTL_MS = 60 * 60 * 1000;

const SESSION_STORAGE_PREFIX = 'halaqmap-private-chat-session:';
const CONVERSATIONS_STORAGE_KEY = 'halaqmap-private-chat-conversations:v1';

export type PrivateChatSender = 'customer' | 'barber';

export interface PrivateChatMessage {
  id: string;
  sender: PrivateChatSender;
  text: string;
  createdAt: string;
}

interface ChatSession {
  sessionId: string;
  expiresAt: string;
}

interface StoredConversation {
  barberId: string;
  sessionId: string;
  expiresAt: string;
  messages: PrivateChatMessage[];
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

function sessionKey(barberId: string): string {
  return `${SESSION_STORAGE_PREFIX}${barberId}`;
}

function conversationKey(barberId: string, sessionId: string): string {
  return `${barberId}:${sessionId}`;
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

export function clearExpiredPrivateConversations(): void {
  const conversations = readConversations();
  const t = nowMs();
  const cleaned: ConversationMap = {};
  for (const [key, conv] of Object.entries(conversations)) {
    if (new Date(conv.expiresAt).getTime() > t) cleaned[key] = conv;
  }
  writeConversations(cleaned);
}

export function getOrCreatePrivateChatSession(barberId: string): ChatSession {
  clearExpiredPrivateConversations();
  const key = sessionKey(barberId);
  const existing = safeJsonParse<ChatSession | null>(sessionStorage.getItem(key), null);

  if (existing) {
    const exp = new Date(existing.expiresAt).getTime();
    if (exp > nowMs()) return existing;
  }

  const next = createSession();
  sessionStorage.setItem(key, JSON.stringify(next));
  return next;
}

export function restartPrivateChatSession(barberId: string): ChatSession {
  const next = createSession();
  sessionStorage.setItem(sessionKey(barberId), JSON.stringify(next));
  return next;
}

export function getPrivateChatRemainingMs(session: ChatSession): number {
  return Math.max(0, new Date(session.expiresAt).getTime() - nowMs());
}

export function isPrivateChatExpired(session: ChatSession): boolean {
  return getPrivateChatRemainingMs(session) <= 0;
}

export function loadPrivateConversation(
  barberId: string,
  sessionId: string
): PrivateChatMessage[] {
  const conversations = readConversations();
  const key = conversationKey(barberId, sessionId);
  const conv = conversations[key];
  if (!conv) return [];
  if (new Date(conv.expiresAt).getTime() <= nowMs()) return [];
  return conv.messages;
}

export function appendPrivateMessage(
  barberId: string,
  session: ChatSession,
  sender: PrivateChatSender,
  text: string
): PrivateChatMessage[] {
  const conversations = readConversations();
  const key = conversationKey(barberId, session.sessionId);
  const existing = conversations[key];
  const expiresAt =
    existing?.expiresAt && new Date(existing.expiresAt).getTime() > nowMs()
      ? existing.expiresAt
      : session.expiresAt;

  const message: PrivateChatMessage = {
    id: crypto.randomUUID(),
    sender,
    text,
    createdAt: new Date().toISOString(),
  };

  const nextMessages = [...(existing?.messages ?? []), message];
  conversations[key] = {
    barberId,
    sessionId: session.sessionId,
    expiresAt,
    messages: nextMessages,
  };
  writeConversations(conversations);
  return nextMessages;
}

