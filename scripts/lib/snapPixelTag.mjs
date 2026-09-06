/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * بكسل سناب شات — HTML ثابت (صفحات SEO) بتحميل idle مثل gtag.
 */
export const SNAP_PIXEL_ID = '6f9bc677-f2c2-44a4-b7ba-7a4117b8c534';

/**
 * @param {{ viewContent?: boolean }} [opts]
 */
export function snapMeasurementTagHtml({ viewContent = false } = {}) {
  const viewContentLine = viewContent ? "\n        snaptr('track', 'VIEW_CONTENT');" : '';
  return `  <!-- Snap Pixel — idle boot, no user_email -->
  <script>
    (function(){
      function bootSnap(){
        if (window.__hmSnapBooted) return;
        window.__hmSnapBooted = true;
        (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
        {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
        a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
        r.src=n;var u=t.getElementsByTagName(s)[0];
        u.parentNode.insertBefore(r,u);})(window,document,
        'https://sc-static.net/scevent.min.js');
        snaptr('init', '${SNAP_PIXEL_ID}');
        snaptr('track', 'PAGE_VIEW');${viewContentLine}
      }
      function schedule(){
        if (typeof window.requestIdleCallback === 'function') {
          window.requestIdleCallback(bootSnap, { timeout: 8000 });
        } else {
          window.setTimeout(bootSnap, 5000);
        }
      }
      if (document.readyState === 'complete') schedule();
      else window.addEventListener('load', schedule, { once: true });
    })();
  </script>`;
}
