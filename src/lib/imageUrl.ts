// src/lib/imageUrl.ts
const HTTP_RE = /^https?:\/\//i;

export const isHttpUrl = (u?: string): boolean =>
  !!u && HTTP_RE.test(u.trim());

export const normalizeImageUrl = (raw?: string): string => {
  if (!raw) return "";
  let url = raw.trim();

  // รูปแบบ //example.com/... -> ใส่ https ให้
  if (url.startsWith("//")) url = "https:" + url;

  // ตัด space แปลก ๆ
  url = url.replace(/\s+/g, "");

  return url;
};

/**
 * คืน URL สำหรับแสดงผล
 * - ถ้าเป็น http(s) -> ผ่าน proxy wsrv.nl (กันโดนบล็อก)
 * - ถ้าไม่ใช่ http(s) (เช่น data:, /assets/...) -> คืนตามเดิม
 * - ไม่ encode ซ้ำ, ไม่ proxy ซ้ำ
 */
export const toDisplaySrc = (
  raw?: string,
  opts: { w?: number; q?: number } = {}
): string => {
  const url = normalizeImageUrl(raw);
  if (!url) return "";

  if (!isHttpUrl(url)) return url; // รูปในเครื่อง/ data: ฯลฯ

  // ถ้าถูก proxy อยู่แล้วก็คืนเลย
  if (/(\bwsrv\.nl\b|\bimages\.weserv\.nl\b)/i.test(url)) return url;

  const params = new URLSearchParams();
  params.set("url", url); // wsrv.nl รับ url= แบบ encode ให้โดย URLSearchParams
  if (opts.w) params.set("w", String(opts.w));
  if (opts.q) params.set("q", String(opts.q));

  return `https://wsrv.nl/?${params.toString()}`;
};
