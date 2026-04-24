import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import './index.css'

function reloadForNewBuild() {
  window.location.reload()
}

registerSW({
  immediate: true,
  onNeedRefresh() {
    reloadForNewBuild()
  },
})

createRoot(document.getElementById("root")!).render(<App />);
