// netlify/functions/send-order-received.ts
// ใช้ CommonJS สำหรับ runtime (แก้ error: Cannot use import statement outside a module)
import type { Handler } from "@netlify/functions";
/* eslint-disable @typescript-eslint/no-var-requires */
const { Resend } = require("resend");

type Item = {
  name: string;
  quantity: number;
  price?: number;
  sku?: string | null;
  image?: string | null;
};
type Customer = {
  name: string;
  phone: string;
  address: string;
  note?: string | null;
};
type Payload = {
  to: string;
  order_id: number;
  order_number: string;
  total_price: number;
  deposit?: number | null;
  paid_amount: number;
  payment_method: "kshop" | "truemoney";
  customer: Customer;
  items: Item[];
};

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM || "Wishyoulucky <notify@wishyoulucky.page>";
const ORDER_STATUS_URL =
  process.env.ORDER_STATUS_URL || "https://wishyoulucky.page/order-status";

const cors = (origin?: string) => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

const thb = (n: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(
    Number.isFinite(n) ? n : 0
  );

const paymentChannelText = (m: Payload["payment_method"]) =>
  m === "truemoney" ? "TrueMoney Wallet" : "โอนผ่านธนาคาร (K SHOP QR)";

const paymentTypeText = (total: number, deposit?: number | null) => {
  const dep = Number(deposit ?? 0);
  if (dep > 0 && dep < total) return "มัดจำ";
  return "โอนเต็ม";
};

const buildItemsHTML = (items: Item[]) =>
  items
    .map(
      (it) => `
<tr>
  <td style="padding:8px 0;">
    <div style="display:flex;gap:10px;align-items:center;">
      ${
        it.image
          ? `<img src="${it.image}" width="56" height="56" style="border-radius:8px;object-fit:cover;border:1px solid #eee;" />`
          : ""
      }
      <div>
        <div style="font-weight:600;">${it.name}</div>
        <div style="font-size:12px;color:#555;">จำนวน: ${it.quantity}${
        it.sku ? ` • SKU: ${it.sku}` : ""
      }</div>
      </div>
    </div>
  </td>
  <td style="text-align:right;font-weight:600;">${
    it.price ? thb(it.price * it.quantity) : "-"
  }</td>
</tr>`
    )
    .join("");

const htmlTemplate = (p: Payload) => {
  const balance = Math.max(Number(p.total_price) - Number(p.paid_amount || 0), 0);
  const subject = "Wishyoulucky's Shop Order Received (สรุปคำสั่งซื้อ) 🍀";
  const link = `${ORDER_STATUS_URL}?order=${encodeURIComponent(
    p.order_number
  )}&email=${encodeURIComponent(p.to)}`;

  return {
    subject,
    html: `
<div style="font-family:Inter,Arial,Helvetica,sans-serif;max-width:680px;margin:0 auto;padding:24px;background:#fff;">
  <h2 style="margin:0 0 8px;">🩰🎨 Thank you for shopping with Wishyoulucky's! 🌷🌟</h2>
  <p style="margin:0 0 16px;color:#333;">💖 ขอบพระคุณที่ไว้วางใจสั่งสินค้ากับทางร้านนะคะ 💖</p>

  <div style="border:1px solid #eee;border-radius:12px;padding:16px;margin-top:12px;">
    <h3 style="margin:0 0 8px;">📋 สรุปรายการสั่งซื้อของคุณ</h3>
    <p style="margin:0 0 8px;"><strong>Order ID:</strong> #${p.order_number}</p>

    <table style="width:100%;border-collapse:collapse;margin:8px 0;">
      <thead>
        <tr>
          <th style="text-align:left;padding-bottom:8px;border-bottom:1px solid #eee;">สินค้า</th>
          <th style="text-align:right;padding-bottom:8px;border-bottom:1px solid #eee;">ยอด</th>
        </tr>
      </thead>
      <tbody>
        ${buildItemsHTML(p.items)}
        <tr><td style="padding-top:8px;border-top:1px dashed #ddd;">รวมทั้งสิ้น</td><td style="text-align:right;padding-top:8px;border-top:1px dashed #ddd;font-weight:700;">${thb(
          p.total_price
        )}</td></tr>
      </tbody>
    </table>

    <p style="margin:12px 0 4px;"><strong>รูปแบบการชำระเงิน:</strong> ${paymentTypeText(
      p.total_price,
      p.deposit
    )}</p>
    <p style="margin:4px 0;"><strong>ยอดชำระแล้ว:</strong> ${thb(
      p.paid_amount
    )}</p>
    <p style="margin:4px 0;"><strong>ยอดที่เหลือ:</strong> ${thb(balance)}</p>
    <p style="margin:4px 0 12px;"><strong>ช่องทางการชำระเงิน:</strong> ${paymentChannelText(
      p.payment_method
    )}</p>

    <div style="padding:12px;background:#faf5ff;border:1px solid #eee;border-radius:10px;margin-top:8px;">
      <div style="font-weight:600;margin-bottom:6px;">ที่อยู่จัดส่ง</div>
      <div>${p.customer.name}</div>
      <div style="white-space:pre-line">${p.customer.address}</div>
      <div>โทร: ${p.customer.phone}</div>
      ${
        p.customer.note
          ? `<div style="margin-top:6px;"><strong>หมายเหตุจากลูกค้า:</strong> ${p.customer.note}</div>`
          : ""
      }
    </div>

    <div style="text-align:center;margin-top:16px;">
      <a href="${link}"
         style="display:inline-block;background:#8b5cf6;color:#fff;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:600;">
        👉 คลิกที่นี่เพื่อดูรายละเอียดออเดอร์ของคุณ
      </a>
    </div>

    <div style="margin-top:16px;color:#333;">
      <p style="margin:0 0 6px;">ทางร้านจะทำการตรวจสอบยอดและยืนยันออเดอร์ของคุณภายใน 24 ชั่วโมง ค่ะ</p>
      <ul style="margin:0 0 8px 18px;padding:0;">
        <li>✨ สินค้า Pre-Order / Pre-Sale → สถานะจะเปลี่ยนเป็น “รอโรงงานจัดส่งทันที”</li>
        <li>📦 สินค้าพร้อมส่ง → สถานะจะเปลี่ยนเป็น “จัดส่งแล้ว” พร้อมเลข Tracking</li>
      </ul>
      <p style="margin:0;">อีเมลนี้สำหรับแจ้งข้อมูลและอัปเดตเท่านั้น หากมีคำถามเพิ่มเติมสามารถติดต่อเพจ Wishyoulucky's Shop</p>
    </div>
  </div>

  <p style="margin-top:16px;color:#666;">ขอบคุณที่ไว้วางใจเราเสมอค่ะ 💖</p>
  <p style="color:#666;margin:0;">Wishyoulucky's Shop</p>
</div>`,
    text: `ขอบพระคุณที่สั่งซื้อกับ Wishyoulucky's Shop
Order #${p.order_number}
ยอดรวม: ${thb(p.total_price)}
ยอดชำระแล้ว: ${thb(p.paid_amount)}  คงเหลือ: ${thb(
      Math.max(p.total_price - p.paid_amount, 0)
    )}
ช่องทางชำระเงิน: ${paymentChannelText(p.payment_method)}
ที่อยู่จัดส่ง: ${p.customer.name} / ${p.customer.phone}
${p.customer.address}
หมายเหตุ: ${p.customer.note || "-"}

ดูรายละเอียดออเดอร์: ${link}`,
  };
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: cors(event.headers.origin) };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cors(event.headers.origin), body: "Method Not Allowed" };
  }

  try {
    const payload = JSON.parse(event.body || "{}") as Payload;

    if (!payload?.to || !payload?.order_number) {
      return {
        statusCode: 400,
        headers: cors(event.headers.origin),
        body: "Missing required fields: to, order_number",
      };
    }

    const mail = htmlTemplate(payload);
    const sent = await resend.emails.send({
      from: FROM,
      to: [payload.to],
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });

    if ((sent as any)?.error) {
      console.error("Resend error:", (sent as any).error);
      return { statusCode: 500, headers: cors(event.headers.origin), body: "Failed to send email" };
    }

    return { statusCode: 200, headers: cors(event.headers.origin), body: JSON.stringify({ ok: true }) };
  } catch (e: any) {
    console.error(e);
    return { statusCode: 500, headers: cors(event.headers.origin), body: e?.message || "Internal Error" };
  }
};
