import { createRoot } from 'react-dom/client'
// مساعد الشركاء (الذكاء الاصطناعي) يُعرَض من PartnerLayout فقط — لا يُستورد مساعد قديم هنا.
import App from './App.tsx'
import './index.css'
import { ensureDomainVerificationMeta } from '@/config/domainVerification'
import { initPlatformBuildSync } from '@/lib/platformBuildSync'

ensureDomainVerificationMeta()
// build-sync التلقائي مُعطّل — كان يسبب حلقة reload (_b=…) وremoveChild أثناء تشغيل React
import { PARTNER_ASSISTANT_UI_VERSION } from './lib/partnerAssistantUiVersion'
import { PARTNER_ASSISTANT_CHAT_API_PATH } from './lib/partnerAssistantRemote'

const CHUNK_RELOAD_ONCE_PREFIX = 'hm-chunk-reload-once:'
const DOM_GUARD_PATCH_FLAG = '__halaqmapDomGuardPatched'
const DOM_GUARD_LOG_KEY = 'hm-dom-guard-events-v1'

/**
 * Emergency DOM guard for production stability:
 * Some sessions still hit a transient DOM detach race where removeChild
 * is called with a node that is no longer attached to the expected parent.
 * This guard short-circuits that mismatch to prevent full app collapse.
 */
function installDomMismatchGuard(): void {
  if (typeof window === 'undefined' || typeof Node === 'undefined') return

  const marker = window as Window & { [DOM_GUARD_PATCH_FLAG]?: boolean }
  if (marker[DOM_GUARD_PATCH_FLAG] === true) return
  marker[DOM_GUARD_PATCH_FLAG] = true

  const originalRemoveChild = Node.prototype.removeChild
  const isDomMismatchError = (error: unknown): boolean => {
    if (error instanceof DOMException && error.name === 'NotFoundError') return true
    if (error instanceof Error) {
      return /removeChild/i.test(error.message) || /not a child of this node/i.test(error.message)
    }
    return false
  }
  const recordGuardEvent = (phase: 'precheck' | 'catch', parent: Node, child: Node | null | undefined): void => {
    try {
      const payload = {
        phase,
        parentNode: parent.nodeName,
        childNode: child?.nodeName ?? 'unknown',
        path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
        ts: Date.now(),
      }
      const current = JSON.parse(sessionStorage.getItem(DOM_GUARD_LOG_KEY) ?? '[]') as Array<Record<string, unknown>>
      current.push(payload)
      const trimmed = current.slice(-25)
      sessionStorage.setItem(DOM_GUARD_LOG_KEY, JSON.stringify(trimmed))
      window.dispatchEvent(new CustomEvent('halaqmap:dom-guard', { detail: payload }))
    } catch {
      // ignore diagnostics failures
    }
  }

  Node.prototype.removeChild = function patchedRemoveChild<T extends Node>(child: T): T {
    if (child && child.parentNode !== this) {
      if (import.meta.env.DEV) {
        console.warn('[halaqmap] DOM guard bypassed removeChild mismatch')
      }
      recordGuardEvent('precheck', this, child)
      return child
    }
    try {
      return originalRemoveChild.call(this, child) as T
    } catch (error) {
      if (!isDomMismatchError(error)) throw error
      if (import.meta.env.DEV) {
        console.warn('[halaqmap] DOM guard caught runtime removeChild race', error)
      }
      recordGuardEvent('catch', this, child)
      return child
    }
  }
}

installDomMismatchGuard()
initPlatformBuildSync()

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
