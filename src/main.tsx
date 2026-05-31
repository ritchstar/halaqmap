import { createRoot } from 'react-dom/client'
// مساعد الشركاء (الذكاء الاصطناعي) يُعرَض من PartnerLayout فقط — لا يُستورد مساعد قديم هنا.
import App from './App.tsx'
import './index.css'
import { ensureDomainVerificationMeta } from '@/config/domainVerification'

ensureDomainVerificationMeta()
// build-sync التلقائي مُعطّل — كان يسبب حلقة reload (_b=…) وremoveChild أثناء تشغيل React
import { PARTNER_ASSISTANT_UI_VERSION } from './lib/partnerAssistantUiVersion'
import { PARTNER_ASSISTANT_CHAT_API_PATH } from './lib/partnerAssistantRemote'

const CHUNK_RELOAD_ONCE_PREFIX = 'hm-chunk-reload-once:'
const DOM_GUARD_PATCH_FLAG = '__halaqmapDomGuardPatched'

/**
 * Emergency DOM guard:
 * Some production sessions hit a transient DOM mismatch race
 * (`removeChild` called with a non-child node), which crashes React tree render.
 * We short-circuit that specific mismatch so the app stays alive while
 * we continue root-cause hardening in feature code.
 */
function installDomMismatchGuard(): void {
  if (typeof window === 'undefined' || typeof Node === 'undefined') return
  const marker = window as Window & { [DOM_GUARD_PATCH_FLAG]?: boolean }
  if (marker[DOM_GUARD_PATCH_FLAG] === true) return
  marker[DOM_GUARD_PATCH_FLAG] = true

  const originalRemoveChild = Node.prototype.removeChild
  Node.prototype.removeChild = function patchedRemoveChild<T extends Node>(child: T): T {
    if (child && child.parentNode !== this) {
      if (import.meta.env.DEV) {
        console.warn('[halaqmap] DOM guard bypassed removeChild mismatch')
      }
      return child
    }
    return originalRemoveChild.call(this, child) as T
  }
}

installDomMismatchGuard()

function currentRouteReloadKey(): string {
  return `${CHUNK_RELOAD_ONCE_PREFIX}${window.location.pathname}${window.location.search}${window.location.hash}`
}

function toErrorMessage(reason: unknown): string {
  if (typeof reason === 'string') return reason
  if (reason instanceof Error) return reason.message
  if (typeof reason === 'object' && reason !== null) {
    const msg = (reason as { message?: unknown }).message
    if (typeof msg === 'string') return msg
  }
  return ''
}

function isDynamicImportChunkError(reason: unknown): boolean {
  const msg = toErrorMessage(reason)
  return (
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    /Unable to preload CSS/i.test(msg) ||
    /ChunkLoadError/i.test(msg) ||
    /Loading chunk [\w-]+ failed/i.test(msg)
  )
}

function reloadOnceForChunkError(): void {
  try {
    const key = currentRouteReloadKey()
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
  } catch {
    // ignore storage errors and still attempt reload
  }
  window.location.reload()
}

if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    ;(event as Event).preventDefault()
    reloadOnceForChunkError()
  })

  window.addEventListener('unhandledrejection', (event) => {
    if (!isDynamicImportChunkError(event.reason)) return
    event.preventDefault()
    reloadOnceForChunkError()
  })

  window.addEventListener('error', (event) => {
    const scriptErrorLike =
      isDynamicImportChunkError(event.error ?? event.message) ||
      (typeof event.filename === 'string' && /\/assets\/.+\.(js|css)(\?|$)/i.test(event.filename))
    if (!scriptErrorLike) return
    event.preventDefault()
    reloadOnceForChunkError()
  }, true)
}

if (import.meta.env.DEV) {
  console.info(`[halaqmap] Partner assistant UI v${PARTNER_ASSISTANT_UI_VERSION}`)
  void fetch(PARTNER_ASSISTANT_CHAT_API_PATH, { method: 'GET' })
    .then(async (r) => {
      const j = (await r.json().catch(() => ({}))) as Record<string, unknown>
      console.info('[halaqmap] partner-assistant-chat GET', { status: r.status, body: j })
    })
    .catch((err) => {
      console.warn('[halaqmap] partner-assistant-chat GET failed (تأكد من proxy /api في التطوير)', err)
    })
}

const rootEl = document.getElementById('root')
if (rootEl) {
  createRoot(rootEl).render(<App />)
}
