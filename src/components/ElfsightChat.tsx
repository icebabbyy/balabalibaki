// src/components/ElfsightChat.tsx
import { useEffect, useRef } from "react";

const APP_ID = "0cbabca4-c8c0-4bdb-aff9-8e2c03b3f020"; // <- ของคุณ

export default function ElfsightChat() {
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) {
      // ถ้าสคริปต์อยู่แล้ว ให้สั่งรีโหลดวิดเจ็ต (รองรับ SPA)
      (window as any).elfsight?.reload?.();
      return;
    }
    mounted.current = true;

    const SCRIPT_ID = "elfsight-platform";
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    const onLoad = () => (window as any).elfsight?.reload?.();

    if (existing) {
      existing.addEventListener("load", onLoad);
      if ((existing as any).dataset.loaded === "true") {
        (window as any).elfsight?.reload?.();
      }
    } else {
      const s = document.createElement("script");
      s.id = SCRIPT_ID;
      s.src = "https://apps.elfsight.com/p/platform.js"; // endpoint ที่เสถียร
      s.async = true;
      s.defer = true;
      s.onload = () => {
        (s as any).dataset.loaded = "true";
        onLoad();
      };
      document.body.appendChild(s);
    }
  }, []);

  // fixed ขวาล่าง เหนือทุกชั้น
  return (
    <div style={{ position: "fixed", right: "22px", bottom: "22px", zIndex: 60 }}>
      <div className={`elfsight-app-${APP_ID}`} />
    </div>
  );
}
