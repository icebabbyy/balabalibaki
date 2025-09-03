import { useEffect, useRef } from "react";

/**
 * TrustindexWidget
 * - โหลดสคริปต์ Trustindex *ภายใน* container นี้ เพื่อบังคับตำแหน่งแสดงผล
 * - มี fallback ย้ายวิดเจ็ตกลับเข้ามา หาก loader เรนเดอร์ผิดที่
 */
export default function TrustindexWidget({
  scriptSrc = "https://cdn.trustindex.io/loader.js?51195bc530613511f06606479fd",
  className = "",
}: {
  scriptSrc?: string;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    host.innerHTML = "";

    // โหลดสคริปต์ภายใน host (กันไปโผล่ท้ายหน้า)
    const s = document.createElement("script");
    s.src = scriptSrc;
    s.defer = true;
    s.async = true;
    s.setAttribute("data-ti-src", scriptSrc);
    host.appendChild(s);

    // Fallback: ถ้าไปแทรกไว้ที่อื่น ให้ย้ายกลับมา
    const looksLikeTI = (el: Element) => {
      const cls = (el as HTMLElement).className?.toString?.() ?? "";
      return el.hasAttribute("data-ti-widget") || cls.includes("ti-widget") || cls.includes("trustindex");
    };
    const moveIn = () => {
      const cand =
        document.querySelector("[data-ti-widget]") ||
        document.querySelector(".ti-widget") ||
        document.querySelector('[class*="trustindex"]');
      if (cand && !host.contains(cand)) host.appendChild(cand);
    };

    s.addEventListener("load", () => setTimeout(moveIn, 600));

    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes.forEach((n) => {
          if (n instanceof Element && looksLikeTI(n)) moveIn();
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      host.innerHTML = "";
    };
  }, [scriptSrc]);

  return <div ref={hostRef} className={className} />;
}
