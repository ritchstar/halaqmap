import { createRoot } from 'react-dom/client'
// مساعد الشركاء (الذكاء الاصطناعي) يُعرَض من PartnerLayout فقط — لا يُستورد مساعد قديم هنا.
import App from './App.tsx'
import './index.css'
import { RootErrorBoundary } from '@/components/RootErrorBoundary'
import { ensureDomainVerificationMeta } from '@/config/domainVerification'

ensureDomainVerificationMeta()
// build-sync التلقائي مُعطّل — كان يسبب حلقة reload (_b=…) وremoveChild أثناء تشغيل React
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

const rootEl = document.getElementById('root')
if (rootEl) {
  createRoot(rootEl).render(
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>,
  )
}
