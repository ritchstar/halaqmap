/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تشغيل يوتيوب داخل إطار القاعة: يبدأ صامتاً ثم يُرفع الصوت بلمسة.
 */
import { useRef, useState } from 'react';

function postYoutubeCommand(win: Window | null | undefined, func: 'playVideo' | 'unMute' | 'mute') {
  if (!win) return;
  win.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*');
}

export function StoreHallYoutubePlayer({
  src,
  title,
  soundLabelAr,
}: {
  src: string;
  title: string;
  soundLabelAr: string;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [soundOn, setSoundOn] = useState(false);

  function enableSound() {
    const win = frameRef.current?.contentWindow;
    postYoutubeCommand(win, 'unMute');
    postYoutubeCommand(win, 'playVideo');
    setSoundOn(true);
  }

  return (
    <div className="relative h-full w-full">
      <iframe
        ref={frameRef}
        title={title}
        src={src}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
      {soundOn ? null : (
        <button
          type="button"
          onClick={enableSound}
          className="absolute inset-x-[12%] bottom-[12%] z-10 rounded-full bg-[#e8c547] px-4 py-2.5 text-sm font-extrabold text-[#061018] shadow-[0_10px_24px_-10px_rgba(232,197,71,0.9)]"
        >
          {soundLabelAr}
        </button>
      )}
    </div>
  );
}
