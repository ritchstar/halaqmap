import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
// مساعد الشركاء (الذكاء الاصطناعي + v2) يُعرَض من PartnerLayout فقط — لا يُستورد مساعد قديم هنا.
import App from './App.tsx'
import './index.css'
import { PARTNER_ASSISTANT_UI_VERSION } from './lib/partnerAssistantUiVersion'
import { PARTNER_ASSISTANT_CHAT_API_PATH } from './lib/partnerAssistantRemote'

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

function reloadForNewBuild() {
  window.location.reload()
}

const updateServiceWorker = registerSW({
  immediate: true,
  onNeedRefresh() {
    reloadForNewBuild()
  },
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return
    // Force regular SW update checks so stale app shells are replaced quickly.
    window.setInterval(() => {
      void registration.update()
    }, 30_000)
  },
})

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  let refreshed = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshed) return
    refreshed = true
    reloadForNewBuild()
  })

  // If a waiting worker already exists, activate it immediately.
  void navigator.serviceWorker.getRegistration().then((registration) => {
    if (registration?.waiting) {
      void updateServiceWorker(true)
    }
  })
}

createRoot(document.getElementById("root")!).render(<App />);
