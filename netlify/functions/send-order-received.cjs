// netlify/functions/send-order-received.cjs
/* eslint-disable */

const nodemailer = require("nodemailer");

// ====== ENV ======
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_SECURE,
  MAIL_FROM,
  ORDER_STATUS_URL,
  SITE_URL,
} = process.env;

const FROM =
  MAIL_FROM || "Wishyoulucky's Shop <wishyoulucky.shop@gmail.com>";
const ORDER_URL =
  ORDER_STATUS_URL || `${SITE_URL || "https://wishyoulucky.page"}/order-status`;

// ====== CORS helper ======
const cors = (origin) => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Idempotency-Key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
});

// ====== helpers ======
const thb = (n) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(Number.isFinite(Number(n)) ? Number(n) : 0);

const paymentChannelText = (m) =>
  m === "truemoney" ? "TrueMoney Wallet" : "โอนผ่านธนาคาร (K SHOP QR)";

const paymentTypeText = (total, deposit) => {
  const dep = Number(deposit ?? 0);
  if (dep > 0 && dep < Number(total)) return "มัดจำ";
  return "โอนเต็ม";
};

// ป้องกัน items ไม่มีภาพ → ลองใช้ image_url แทน
const safeImage = (it) => it.image || it.image_url || "";

// ตารางสินค้า + รูปภาพ
const buildItemsHTML = (items) =>
  (items || [])
    .map(
      (it) => `
<tr>
  <td style="padding:10px 0;">
    <div style="display:flex;gap:12px;align-items:center;">
      ${
        safeImage(it)
          ? `<img src="${safeImage(
              it
            )}" width="56" height="56" style="border-radius:8px;object-fit:cover;border:1px solid #eee;background:#fff;" />`
          : ""
      }
      <div>
        <div style="font-weight:600;color:#111;">${it.name || "-"}</div>
        <div style="font-size:12px;color:#555;">จำนวน: ${it.quantity || 0}${
        it.sku ? ` • SKU: ${it.sku}` : ""
      }</div>
      </div>
    </div>
  </td>
  <td style="text-align:right;font-weight:600;color:#1a1a1a;">${
    it.price ? thb(Number(it.price) * Number(it.quantity || 1)) : "-"
  }</td>
</tr>`
    )
    .join("");

// ====== Template ======
const htmlTemplate = (p) => {
  // รวมยอด
  const subtotal =
    typeof p.subtotal === "number"
      ? p.subtotal
      : (p.items || []).reduce(
          (s, it) => s + Number(it.price || 0) * Number(it.quantity || 1),
          0
        );
  const shippingFee = Number(p.shipping_fee ?? p.shippingCost ?? 0);
  const total = Number(
    p.total_price ?? subtotal + shippingFee + Number(p.tax ?? 0)
  );

  // ชำระแล้ว/คงเหลือ
  const paid = Number(p.paid_amount ?? 0);
  const balance = Math.max(total - paid, 0);

  const subject = `Wishyoulucky's Shop • Order #${p.order_number}`;
  const link = `${ORDER_URL}?order=${encodeURIComponent(
    p.order_number
  )}&email=${encodeURIComponent(p.to)}`;

  const css = `
  .card{border:1px solid #eee;border-radius:14px;padding:16px;background:#fff;}
  .secTitle{margin:0 0 8px;font-weight:700;color:#222;}
  .row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;}
  .row+.row{border-top:1px dashed #e5e5e5;}
  .lbl{color:#333;}
  .val{color:#111;font-weight:600;}
  .valStrong{color:#111;font-weight:700;}
  `;

  const html = `
<div style="font-family:Inter,Arial,Helvetica,sans-serif;max-width:680px;margin:0 auto;padding:24px;background:#fff;">
  <style>${css}</style>

  <h2 style="margin:0 0 8px;">🩰🎨 Thank you for shopping with Wishyoulucky's! 🌷🌟</h2>
  <p style="margin:0 0 16px;color:#333;">💖 ขอบพระคุณที่ไว้วางใจสั่งสินค้ากับทางร้านนะคะ 💖</p>

  <div style="text-align:center;margin:16px 0 20px;">
    <a href="${link}" style="display:inline-block;background:#8b5cf6;color:#fff;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:600;">
      👉 คลิกที่นี่เพื่อดูรายละเอียดออเดอร์ของคุณ
    </a>
  </div>

  <div class="card">
    <h3 class="secTitle">📋 สรุปรายการสั่งซื้อ • Order #${p.order_number}</h3>

    <table style="width:100%;border-collapse:collapse;margin:8px 0;">
      <thead>
        <tr>
          <th style="text-align:left;padding-bottom:8px;border-bottom:1px solid #eee;color:#666;font-weight:600">สินค้า</th>
          <th style="text-align:right;padding-bottom:8px;border-bottom:1px solid #eee;color:#666;font-weight:600">ยอด</th>
        </tr>
      </thead>
      <tbody>
        ${buildItemsHTML(p.items || [])}

        <tr>
          <td class="lbl" style="padding-top:8px;border-top:1px dashed #e9e9e9;">ยอดรวมค่าสินค้า</td>
          <td class="val" style="padding-top:8px;border-top:1px dashed #e9e9e9;">${thb(
            subtotal
          )}</td>
        </tr>
        <tr>
          <td class="lbl">ค่าจัดส่ง</td>
          <td class="val">${thb(shippingFee)}</td>
        </tr>
        <tr>
          <td class="lbl valStrong" style="padding-top:4px;">รวมทั้งสิ้น</td>
          <td class="valStrong" style="padding-top:4px;">${thb(total)}</td>
        </tr>
      </tbody>
    </table>

    <p style="margin:10px 0 0;color:#222;">
      <strong>รูปแบบการชำระเงิน:</strong> ${paymentTypeText(
        total,
        p.deposit
      )}
    </p>
    <p style="margin:6px 0 0;color:#222;">
      <strong>ยอดชำระแล้ว:</strong> ${thb(paid)}
      &nbsp;&nbsp;•&nbsp;&nbsp;
      <strong>ยอดคงเหลือ:</strong> ${thb(balance)}
    </p>
    <p style="margin:6px 0 12px;color:#222;">
      <strong>ช่องทางการชำระเงิน:</strong> ${paymentChannelText(
        p.payment_method
      )}
    </p>

    <!-- SHIPPING ADDRESS BLOCK -->
    <div style="padding:12px;background:#faf5ff;border:1px solid #eee;border-radius:10px;margin-top:8px;">
      <div style="font-weight:600;margin-bottom:6px;">ที่อยู่จัดส่ง</div>
      <div>${p.customer?.name || ""}</div>
      <div style="white-space:pre-line">${p.customer?.address || ""}</div>
      <div>โทร: ${p.customer?.phone || "-"}</div>
      ${
        p.customer?.note
          ? `<div style="margin-top:6px;"><strong>หมายเหตุจากลูกค้า:</strong> ${p.customer.note}</div>`
          : ""
      }
    </div>

    <div style="margin-top:16px;color:#333;">
      <p style="margin:10px 0 6px;">ทางร้านจะทำการตรวจสอบยอดและยืนยันออเดอร์ของคุณภายใน 24 ชั่วโมง ค่ะ</p>
      <ul style="margin:0 0 8px 18px;padding:0;">
        <li>✨ สินค้า Pre-Order / Pre-Sale → สถานะจะเปลี่ยนเป็น “รอโรงงานจัดส่งทันที”</li>
        <li>📦 สินค้าพร้อมส่ง → สถานะจะเปลี่ยนเป็น “จัดส่งแล้ว” พร้อมเลข Tracking</li>
      </ul>
      <p style="margin:0;">อีเมลนี้สำหรับแจ้งข้อมูลและอัปเดตเท่านั้น หากมีคำถามเพิ่มเติมสามารถติดต่อเพจ Wishyoulucky's Shop</p>
    </div>
  </div>

  <p style="color:#666;margin:0;">Wishyoulucky's Shop</p>
</div>
`;

  const text = [
    `ขอบพระคุณที่สั่งซื้อกับ Wishyoulucky's Shop`,
    `Order #${p.order_number}`,
    `ยอดรวมค่าสินค้า: ${thb(subtotal)}`,
    `ค่าจัดส่ง: ${thb(shippingFee)}`,
    `รวมทั้งสิ้น: ${thb(total)}`,
    `รูปแบบการชำระเงิน: ${paymentTypeText(total, p.deposit)}`,
    `ยอดชำระแล้ว: ${thb(paid)} • ยอดคงเหลือ: ${thb(balance)}`,
    `ช่องทางชำระเงิน: ${paymentChannelText(p.payment_method)}`,
    `ที่อยู่จัดส่ง: ${p.customer?.name || "-"} / ${p.customer?.phone || "-"}`,
    `${p.customer?.address || "-"}`,
    `หมายเหตุ: ${p.customer?.note || "-"}`,
    ``,
    `ดูรายละเอียดออเดอร์: ${link}`,
  ].join("\n");

  return { subject, html, text };
};

// ====== Netlify Handler ======
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: cors(event.headers?.origin) };
  }
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: cors(event.headers?.origin),
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const payload = JSON.parse(event.body || "{}");

    if (!payload?.to || !payload?.order_number) {
      return {
        statusCode: 400,
        headers: cors(event.headers?.origin),
        body: JSON.stringify({
          error: "Missing required fields: to, order_number",
        }),
      };
    }

    // สร้างเนื้อหาอีเมล
    const mail = htmlTemplate(payload);

    // SMTP transporter
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST || "smtp.gmail.com",
      port: SMTP_PORT ? Number(SMTP_PORT) : 465,
      secure: (SMTP_SECURE || "true") === "true",
      auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });

    // ส่งอีเมล
    const info = await transporter.sendMail({
      from: FROM,
      to: payload.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });

    return {
      statusCode: 200,
      headers: cors(event.headers?.origin),
      body: JSON.stringify({ ok: true, id: info?.messageId }),
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      headers: cors(event.headers?.origin),
      body: JSON.stringify({ error: e?.message || "Internal Error" }),
    };
  }
};
