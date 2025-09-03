// netlify/functions/send-order-received.cjs
// SMTP version (Nodemailer)

const nodemailer = require("nodemailer");

/* ---------- ENV ---------- */
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM,
  ORDER_STATUS_URL,
  SITE_URL,
} = process.env;

const FROM =
  MAIL_FROM || `Wishyoulucky's Shop <${SMTP_USER || "no-reply@wishyoulucky.page"}>`;
const BASE_STATUS_URL =
  ORDER_STATUS_URL ||
  (SITE_URL ? `${SITE_URL.replace(/\/$/, "")}/order-status` : "https://wishyoulucky.page/order-status");

/* ---------- Helpers ---------- */
const corsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Idempotency-Key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
});

const toNumber = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

const thb = (n) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(toNumber(n));

const paymentChannelText = (m) =>
  m === "truemoney" ? "TrueMoney Wallet" : "โอนผ่านธนาคาร (K SHOP QR)";

const paymentTypeText = (total, deposit) => {
  const t = toNumber(total, 0);
  const d = toNumber(deposit, 0);
  if (d > 0 && d < t) return "มัดจำ";
  return "โอนเต็ม";
};

const getSubtotal = (payload) => {
  if (typeof payload.subtotal !== "undefined") return toNumber(payload.subtotal, 0);
  // fallback: sum items
  const items = Array.isArray(payload.items) ? payload.items : [];
  return items.reduce(
    (sum, it) => sum + toNumber(it.price, 0) * toNumber(it.quantity, 0),
    0
  );
};

const getShippingFee = (payload) => toNumber(payload.shipping_fee, 0);

const buildItemsHTML = (items) =>
  (Array.isArray(items) ? items : [])
    .map((it) => {
      const qty = toNumber(it.quantity, 0);
      const price = toNumber(it.price, 0);
      const lineTotal = price * qty;
      const image = it.image || it.image_url || "";
      const sku = it.sku ? ` • SKU: ${it.sku}` : "";

      return `
<tr>
  <td style="padding:10px 0;">
    <div style="display:flex;gap:12px;align-items:center;">
      ${
        image
          ? `<img src="${image}" width="64" height="64" alt="${escapeHtml(
              it.name || "product"
            )}" style="border-radius:8px;object-fit:cover;border:1px solid #eee;background:#fff;" />`
          : ""
      }
      <div>
        <div style="font-weight:600;color:#111;">${escapeHtml(it.name || "-")}</div>
        <div style="font-size:12px;color:#666;">จำนวน: ${qty}${sku}</div>
      </div>
    </div>
  </td>
  <td style="text-align:right;font-weight:600;white-space:nowrap;">${thb(lineTotal)}</td>
</tr>`;
    })
    .join("");

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* ---------- Template ---------- */
const htmlTemplate = (p) => {
  const subtotal = getSubtotal(p);
  const shippingFee = getShippingFee(p);
  const total = toNumber(p.total_price, subtotal + shippingFee);
  const paid = toNumber(p.paid_amount, 0);
  const balance = Math.max(total - paid, 0);

  const subject = `Wishyoulucky's Shop • Order Received #${p.order_number} 🍀`;
  const statusLink = `${BASE_STATUS_URL}?order=${encodeURIComponent(
    p.order_number || ""
  )}${p.to ? `&email=${encodeURIComponent(p.to)}` : ""}`;

  const itemsHTML = buildItemsHTML(p.items);

  const html = `
<div style="font-family:Inter,Arial,Helvetica,sans-serif;max-width:680px;margin:0 auto;padding:24px;background:#ffffff;">
  <h2 style="margin:0 0 8px;">🩰🎨 Thank you for shopping with Wishyoulucky's! 🌷🌟</h2>
  <p style="margin:0 0 16px;color:#333;">💖 ขอบพระคุณที่ไว้วางใจสั่งสินค้ากับทางร้านนะคะ 💖</p>

  <div style="text-align:center;margin-top:16px;">
    <a href="${statusLink}" style="display:inline-block;background:#8b5cf6;color:#fff;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:600;">
      👉 คลิกที่นี่เพื่อดูรายละเอียดออเดอร์ของคุณ
    </a>
  </div>

  <div style="border:1px solid #eee;border-radius:12px;padding:16px;margin-top:16px;">
    <h3 style="margin:0 0 8px;">📋 สรุปรายการสั่งซื้อ · Order #${escapeHtml(p.order_number || "-")}</h3>

    <table style="width:100%;border-collapse:collapse;margin:8px 0;">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px 0;border-bottom:1px solid #eee;">สินค้า</th>
          <th style="text-align:right;padding:8px 0;border-bottom:1px solid #eee;">ยอด</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
        <tr>
          <td style="padding-top:8px;border-top:1px dashed #ddd;color:#444;">ยอดรวมค่าสินค้า</td>
          <td style="text-align:right;padding-top:8px;border-top:1px dashed #ddd;font-weight:600;">${thb(
            subtotal
          )}</td>
        </tr>
        <tr>
          <td style="padding-top:4px;color:#444;">ค่าจัดส่ง</td>
          <td style="text-align:right;padding-top:4px;font-weight:600;">${thb(shippingFee)}</td>
        </tr>
        <tr>
          <td style="padding-top:8px;border-top:1px solid #eee;font-weight:700;">รวมทั้งสิ้น</td>
          <td style="text-align:right;padding-top:8px;border-top:1px solid #eee;font-weight:700;">${thb(
            total
          )}</td>
        </tr>
      </tbody>
    </table>

    <p style="margin:12px 0 4px;"><strong>รูปแบบการชำระเงิน:</strong> ${paymentTypeText(
      total,
      p.deposit
    )}</p>
    <p style="margin:4px 0;"><strong>ยอดชำระแล้ว:</strong> ${thb(paid)}</p>
    <p style="margin:4px 0 12px;"><strong>ยอดคงเหลือ:</strong> ${thb(balance)}</p>
    <p style="margin:4px 0 12px;"><strong>ช่องทางการชำระเงิน:</strong> ${paymentChannelText(
      p.payment_method
    )}</p>

    <div style="padding:12px;background:#faf5ff;border:1px solid #eee;border-radius:10px;margin-top:8px;">
      <div style="font-weight:600;margin-bottom:6px;">ที่อยู่จัดส่ง</div>
      <div>${escapeHtml(p.customer?.name || "-")}</div>
      <div style="white-space:pre-line">${escapeHtml(p.customer?.address || "-")}</div>
      <div>โทร: ${escapeHtml(p.customer?.phone || "-")}</div>
      ${
        p.customer?.note
          ? `<div style="margin-top:6px;"><strong>หมายเหตุจากลูกค้า:</strong> ${escapeHtml(
              p.customer.note
            )}</div>`
          : ""
      }
    </div>

    <div style="margin-top:16px;color:#333;">
      <p style="margin:0 0 6px;">ทางร้านจะทำการตรวจสอบยอดและยืนยันออเดอร์ของคุณภายใน 24 ชั่วโมงค่ะ</p>
      <ul style="margin:0 0 8px 18px;padding:0;">
        <li>✨ สินค้า Pre-Order / Pre-Sale → สถานะจะเปลี่ยนเป็น “รอโรงงานจัดส่งทันที”</li>
        <li>📦 สินค้าพร้อมส่ง → สถานะจะเปลี่ยนเป็น “จัดส่งแล้ว” พร้อมเลข Tracking</li>
      </ul>
      <p style="margin:0;">อีเมลนี้สำหรับแจ้งข้อมูลและอัปเดตเท่านั้น หากมีคำถามเพิ่มเติมสามารถติดต่อเพจ Wishyoulucky's Shop</p>
    </div>
  </div>

  <p style="margin-top:16px;color:#666;">ขอบคุณที่ไว้วางใจเราเสมอค่ะ 💖</p>
  <p style="color:#666;margin:0;">Wishyoulucky's Shop</p>
</div>`;

  // Plain text (Thai labels, no tax)
  const text = [
    `ขอบพระคุณที่สั่งซื้อกับ Wishyoulucky's Shop`,
    `Order #${p.order_number}`,
    ``,
    `สรุปรายการ:`,
    ...(Array.isArray(p.items)
      ? p.items.map(
          (it) =>
            ` • ${it.name} x${toNumber(it.quantity, 0)} = ${thb(
              toNumber(it.price, 0) * toNumber(it.quantity, 0)
            )}`
        )
      : []),
    ``,
    `ยอดรวมค่าสินค้า: ${thb(subtotal)}`,
    `ค่าจัดส่ง: ${thb(shippingFee)}`,
    `รวมทั้งสิ้น: ${thb(total)}`,
    ``,
    `รูปแบบการชำระเงิน: ${paymentTypeText(total, p.deposit)}`,
    `ยอดชำระแล้ว: ${thb(paid)}   ยอดคงเหลือ: ${thb(balance)}`,
    `ช่องทางการชำระเงิน: ${paymentChannelText(p.payment_method)}`,
    ``,
    `ที่อยู่จัดส่ง: ${p.customer?.name || "-"} / ${p.customer?.phone || "-"}`,
    `${p.customer?.address || "-"}`,
    p.customer?.note ? `หมายเหตุ: ${p.customer.note}` : "",
    ``,
    `ดูรายละเอียดออเดอร์: ${statusLink}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
};

/* ---------- Transport ---------- */
function createTransport() {
  const secure =
    typeof SMTP_SECURE === "string"
      ? /^(true|1|yes)$/i.test(SMTP_SECURE)
      : Boolean(SMTP_SECURE);

  const port = toNumber(SMTP_PORT, 465);

  return nodemailer.createTransport({
    host: SMTP_HOST || "smtp.gmail.com",
    port,
    secure, // true for 465, false for 587
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

/* ---------- Handler ---------- */
exports.handler = async (event) => {
  const headers = corsHeaders(event.headers?.origin);

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const payload = JSON.parse(event.body || "{}");

    if (!payload?.to || !payload?.order_number) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing required fields: to, order_number" }),
      };
    }

    const mail = htmlTemplate({ ...payload, to: payload.to });

    const transporter = createTransport();

    const info = await transporter.sendMail({
      from: FROM,
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, id: info?.messageId }) };
  } catch (err) {
    console.error("[send-order-received] error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, error: err?.message || "Internal Error" }),
    };
  }
};
