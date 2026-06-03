import { createRoot } from 'react-dom/client'
import './index.css'
import { ensureDomainVerificationMeta } from '@/config/domainVerification'
import { RootErrorBoundary } from '@/components/RootErrorBoundary'
import { initPlatformBuildSync } from '@/lib/platformBuildSync'
import { assertRuntimeEnvSafety } from '@/config/runtimeEnvGuard'

// build-sync التلقائي مُعطّل — كان يسبب حلقة reload (_b=…) وremoveChild أثناء تشغيل React
import { PARTNER_ASSISTANT_UI_VERSION } from './lib/partnerAssistantUiVersion'
import { PARTNER_ASSISTANT_CHAT_API_PATH } from './lib/partnerAssistantRemote'

const CHUNK_RELOAD_ONCE_PREFIX = 'hm-chunk-reload-once:'
const DOM_GUARD_PATCH_FLAG = '__halaqmapDomGuardPatched'
const DOM_GUARD_LOG_KEY = 'hm-dom-guard-events-v1'
const APP_BOOTSTRAP_FLAG = '__halaqmapAppBootstrapped'
const APP_MOUNTED_FLAG = '__halaqmapAppMountedV1'
const ENABLE_DOM_GUARD = import.meta.env.VITE_ENABLE_DOM_GUARD === 'true'

function installDomMismatchGuard(): void {
  if (!ENABLE_DOM_GUARD || typeof window === 'undefined' || typeof Node === 'undefined') return

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
  const recordGuardEvent = (
    phase: 'reroute' | 'catch',
    parent: Node,
    child: Node | null | undefined,
  ): void => {
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
        console.warn('[halaqmap] DOM guard rerouted removeChild mismatch')
      }
      const actualParent = child.parentNode
      if (actualParent) {
        try {
          return originalRemoveChild.call(actualParent, child) as T
        } catch (error) {
          if (!isDomMismatchError(error)) throw error
          recordGuardEvent('reroute', this, child)
          return child
        }
      }
      recordGuardEvent('reroute', this, child)
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

function renderBootstrapFailure(rootEl: HTMLElement, reason: unknown): void {
  const message = toErrorMessage(reason) || 'حدث خطأ غير متوقع أثناء تشغيل المنصة.'
  const stack =
    reason instanceof Error && typeof reason.stack === 'string'
      ? reason.stack.split('\n').slice(0, 7).join('\n')
      : null
  const debugInfo = (() => {
    if (reason instanceof Error) {
      return `name: ${reason.name}\nmessage: ${reason.message}`
    }
    if (typeof reason === 'object' && reason !== null) {
      try {
        const withKnown = reason as { name?: unknown; message?: unknown; stack?: unknown }
        return [
          `type: object`,
          withKnown.name ? `name: ${String(withKnown.name)}` : null,
          withKnown.message ? `message: ${String(withKnown.message)}` : null,
          withKnown.stack ? `stack: ${String(withKnown.stack).split('\n').slice(0, 4).join('\n')}` : null,
        ]
          .filter(Boolean)
          .join('\n')
      } catch {
        return 'type: object'
      }
    }
    return `type: ${typeof reason}\nvalue: ${String(reason)}`
  })()
  createRoot(rootEl).render(
    <div
      dir="rtl"
      className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#061223] px-6 text-center text-slate-100"
    >
      <p className="text-lg font-bold text-rose-300">تعذّر تشغيل المنصة</p>
      <p className="max-w-md text-sm text-slate-400">{message}</p>
      <pre
        dir="ltr"
        className="max-w-3xl overflow-auto rounded-xl border border-white/10 bg-black/20 p-3 text-left text-[11px] leading-5 text-slate-400"
      >
        {debugInfo}
      </pre>
      {stack ? (
        <pre
          dir="ltr"
          className="max-w-3xl overflow-auto rounded-xl border border-white/10 bg-black/30 p-4 text-left text-[11px] leading-5 text-slate-300"
        >
          {stack}
        </pre>
      ) : null}
      <button
        type="button"
        className="rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-5 py-2 text-sm font-semibold text-cyan-200"
        onClick={() => window.location.reload()}
      >
        إعادة التحميل
      </button>
    </div>,
  )
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

function markAppMounted(): void {
  const bootMarker = window as Window & { [APP_MOUNTED_FLAG]?: boolean }
  if (bootMarker[APP_MOUNTED_FLAG] === true) return
  bootMarker[APP_MOUNTED_FLAG] = true
  window.dispatchEvent(new CustomEvent('halaqmap:mounted'))
}

async function bootstrapApp(rootEl: HTMLElement): Promise<void> {
  const bootMarker = window as Window & {
    [APP_BOOTSTRAP_FLAG]?: boolean
    [APP_MOUNTED_FLAG]?: boolean
  }
  if (!bootMarker[APP_BOOTSTRAP_FLAG]) {
    bootMarker[APP_BOOTSTRAP_FLAG] = true
    try {
      ensureDomainVerificationMeta()
      assertRuntimeEnvSafety()
      installDomMismatchGuard()
      initPlatformBuildSync()

      const { default: App } = await import('./App.tsx')
      createRoot(rootEl).render(
        <RootErrorBoundary>
          <App />
        </RootErrorBoundary>,
      )

      const markIfMounted = () => {
        if (rootEl.childElementCount > 0 || rootEl.textContent?.trim()) {
          markAppMounted()
        }
      }

      // Fast path: mark on first paint if React rendered any content.
      requestAnimationFrame(() => {
        requestAnimationFrame(markIfMounted)
      })

      // Robust path: detect first real DOM mount under #root.
      const observer = new MutationObserver(() => {
        if (bootMarker[APP_MOUNTED_FLAG] === true) return
        markIfMounted()
        if (bootMarker[APP_MOUNTED_FLAG] === true) {
          observer.disconnect()
        }
      })
      observer.observe(rootEl, { childList: true, subtree: true, characterData: true })

      // Safety stop to avoid leaving observer alive forever on broken boots.
      window.setTimeout(() => observer.disconnect(), 12_000)
    } catch (error) {
      if (isDynamicImportChunkError(error)) {
        reloadOnceForChunkError()
        return
      }
      console.error('[halaqmap] App bootstrap failed', error)
      renderBootstrapFailure(rootEl, error)
    }
  } else if (import.meta.env.DEV) {
    console.warn('[halaqmap] Duplicate bootstrap prevented')
  }
}

const rootEl = document.getElementById('root')
if (rootEl) {
  void bootstrapApp(rootEl)
}
