// netlify/functions/send-order-received.cjs
// ===============================
// Wishyoulucky - Order Received Mailer (Nodemailer)
// ===============================

const nodemailer = require("nodemailer");

// ---------- Config & Utils ----------
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE, // "true" | "false"
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM = "Wishyoulucky <notify@wishyoulucky.page>",
  ORDER_STATUS_URL = "https://wishyoulucky.page/order-status",
  SITE_URL = "https://wishyoulucky.page",
} = process.env;

const cors = (origin) => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Idempotency-Key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
});

const num = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

const thb = (n) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 2,
  }).format(num(n));

const paymentChannelText = (m) =>
  m === "truemoney" ? "TrueMoney Wallet" : "โอนผ่านธนาคาร (K SHOP QR)";

const paymentTypeText = (total, deposit) => {
  const dep = num(deposit);
  if (dep > 0 && dep < num(total)) return "มัดจำ";
  return "โอนเต็ม";
};

const safe = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// ---------- HTML Builders ----------
const buildItemRows = (items = []) =>
  items
    .map((it) => {
      const price = num(it.price) * num(it.quantity, 1);
      const img =
        it.image
          ? `<img src="${it.image}" width="56" height="56" style="border-radius:8px;object-fit:cover;border:1px solid #eee;" alt=""/>`
          : "";
      const skuLine = it.sku ? `SKU: ${safe(it.sku)}` : "";
      return `
<tr>
  <td style="padding:10px 0;">
    <div style="display:flex;gap:12px;align-items:center;">
      ${img}
      <div>
        <div style="font-weight:600;line-height:1.35">${safe(it.name)}</div>
        <div style="font-size:12px;color:#555;line-height:1.4">QTY: ${num(
          it.quantity,
          1
        )}${skuLine ? ` • ${safe(skuLine)}` : ""}</div>
      </div>
    </div>
  </td>
  <td style="text-align:right;white-space:nowrap;font-weight:600;">${thb(
    price
  )}</td>
</tr>`;
    })
    .join("");

const makeHtml = (p) => {
  const {
    to = "",
    order_id,
    order_number = "",
    subtotal = 0,
    shipping_fee = 0,
    tax = 0,
    total_price = 0,
    deposit = 0,
    paid_amount = 0,
    payment_method = "kshop",
    shipping_title,
    customer = {},
    items = [],
  } = p;

  const link = `${ORDER_STATUS_URL}?order=${encodeURIComponent(
    order_number
  )}&email=${encodeURIComponent(to)}`;

  const balance = Math.max(num(total_price) - num(paid_amount), 0);

  const subject = `Wishyoulucky's Shop Order Received (สรุปคำสั่งซื้อ) 🍀`;

  const orderSummaryRows = buildItemRows(items);

  const html = `
<div style="background:#f7f7fb;padding:16px 0;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="width:100%;max-width:680px;background:#ffffff;margin:0 auto;border-radius:12px;overflow:hidden;">
    <tr>
      <td style="padding:24px 24px 8px 24px;">
        <h2 style="margin:0 0 8px;font-family:Inter,Arial,Helvetica,sans-serif;">🩰🎨 Thank you for shopping with Wishyoulucky's! 🌷🌟</h2>
        <p style="margin:0 0 16px;color:#333;font-family:Inter,Arial,Helvetica,sans-serif;">
          💖 ขอบพระคุณที่ไว้วางใจสั่งสินค้ากับทางร้านนะคะ 💖
        </p>
        <div style="text-align:center;margin:14px 0 18px;">
          <a href="${link}" style="display:inline-block;background:#8b5cf6;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;font-family:Inter,Arial,Helvetica,sans-serif;">
            👉 คลิกที่นี่เพื่อดูรายละเอียดออเดอร์ของคุณ
          </a>
        </div>
      </td>
    </tr>

    <!-- ORDER SUMMARY -->
    <tr>
      <td style="padding:0 24px 20px;">
        <div style="border:1px solid #eee;border-radius:12px;padding:16px;">
          <div style="font-family:Inter,Arial,Helvetica,sans-serif;font-weight:700;margin-bottom:6px;">
            📋 สรุปรายการสั่งซื้อ • Order #${safe(order_number)}
          </div>

          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;margin:8px 0 6px;">
            <tbody>
              ${orderSummaryRows || ""}
            </tbody>
          </table>

          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;margin-top:6px;">
            <tbody>
              <tr>
                <td style="color:#444;">Item Subtotal</td>
                <td style="text-align:right;">${thb(subtotal)}</td>
              </tr>
              <tr>
                <td style="color:#444;">Shipping &amp; Handling</td>
                <td style="text-align:right;">${thb(shipping_fee)}</td>
              </tr>
              <tr>
                <td style="color:#444;">Tax</td>
                <td style="text-align:right;">${thb(tax)}</td>
              </tr>
              <tr>
                <td colspan="2" style="border-top:1px dashed #ddd;height:8px"></td>
              </tr>
              <tr>
                <td style="font-weight:700;">Total</td>
                <td style="text-align:right;font-weight:700;">${thb(
                  total_price
                )}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top:12px;font-family:Inter,Arial,Helvetica,sans-serif;">
            <div><strong>รูปแบบการชำระเงิน:</strong> ${safe(
              paymentTypeText(total_price, deposit)
            )}</div>
            <div><strong>ยอดชำระแล้ว:</strong> ${thb(paid_amount)}</div>
            <div><strong>ยอดที่เหลือ:</strong> ${thb(balance)}</div>
            <div><strong>ช่องทางการชำระเงิน:</strong> ${safe(
              shipping_title || paymentChannelText(payment_method)
            )}</div>
          </div>
        </div>
      </td>
    </tr>

    <!-- ORDER DETAILS / ADDRESSES -->
    <tr>
      <td style="padding:0 24px 22px;">
        <div style="border:1px solid #eee;border-radius:12px;padding:16px;">
          <div style="font-weight:700;font-family:Inter,Arial,Helvetica,sans-serif;margin-bottom:8px;">ORDER DETAILS</div>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="vertical-align:top;padding-right:16px;">
                <div style="font-weight:600;margin-bottom:6px;">Billing Address</div>
                <div style="font-size:14px;line-height:1.5;">
                  ${safe(customer.name)}<br/>
                  ${safe(customer.address).replace(/\n/g, "<br/>")}<br/>
                  โทร: ${safe(customer.phone)}
                </div>
              </td>
              <td style="vertical-align:top;">
                <div style="font-weight:600;margin-bottom:6px;">Shipping Address</div>
                <div style="font-size:14px;line-height:1.5;">
                  ${safe(customer.name)}<br/>
                  ${safe(customer.address).replace(/\n/g, "<br/>")}<br/>
                  โทร: ${safe(customer.phone)}
                </div>
              </td>
            </tr>
          </table>
          ${
            customer.note
              ? `<div style="margin-top:10px;"><strong>หมายเหตุจากลูกค้า:</strong> ${safe(
                  customer.note
                )}</div>`
              : ""
          }
        </div>
      </td>
    </tr>

    <!-- INFO -->
    <tr>
      <td style="padding:0 24px 24px;">
        <div style="border:1px solid #eee;border-radius:12px;padding:16px;font-family:Inter,Arial,Helvetica,sans-serif;">
          <p style="margin:0 0 8px;color:#333;">ทางร้านจะทำการตรวจสอบยอดและยืนยันออเดอร์ของคุณภายใน 24 ชั่วโมง ค่ะ</p>
          <ul style="margin:0 0 8px 18px;padding:0;color:#333;">
            <li>✨ สินค้า Pre-Order / Pre-Sale → สถานะจะเปลี่ยนเป็น “รอโรงงานจัดส่งทันที”</li>
            <li>📦 สินค้าพร้อมส่ง → สถานะจะเปลี่ยนเป็น “จัดส่งแล้ว” พร้อมเลข Tracking</li>
          </ul>
          <p style="margin:0;color:#333;">อีเมลนี้สำหรับแจ้งข้อมูลและอัปเดตเท่านั้น หากมีคำถามเพิ่มเติมสามารถติดต่อเพจ Wishyoulucky's Shop</p>
        </div>
        <p style="margin:12px 0 4px;color:#666;font-family:Inter,Arial,Helvetica,sans-serif;">ขอบคุณที่ไว้วางใจเราเสมอค่ะ 💖</p>
        <p style="color:#666;margin:0;font-family:Inter,Arial,Helvetica,sans-serif;">Wishyoulucky's Shop • <a href="${SITE_URL}" style="color:#8b5cf6;text-decoration:none;">${SITE_URL.replace(
    /^https?:\/\//,
    ""
  )}</a></p>
      </td>
    </tr>
  </table>
</div>`;

  const text = `Thank you for shopping with Wishyoulucky's!

ดูรายละเอียดออเดอร์ของคุณ: ${link}

สรุปรายการสั่งซื้อ • Order #${order_number}
${(items || [])
  .map(
    (it) =>
      `- ${it.name} | QTY: ${num(it.quantity, 1)}${it.sku ? ` | SKU: ${it.sku}` : ""} | ${thb(
        num(it.price) * num(it.quantity, 1)
      )}`
  )
  .join("\n")}

Item Subtotal: ${thb(subtotal)}
Shipping & Handling: ${thb(shipping_fee)}
Tax: ${thb(tax)}
Total: ${thb(total_price)}

รูปแบบการชำระเงิน: ${paymentTypeText(total_price, deposit)}
ยอดชำระแล้ว: ${thb(paid_amount)}
ยอดที่เหลือ: ${thb(balance)}
ช่องทางการชำระเงิน: ${shipping_title || paymentChannelText(payment_method)}

ที่อยู่จัดส่ง:
${customer.name}
${customer.address}
โทร: ${customer.phone}
หมายเหตุ: ${customer.note || "-"}

ทางร้านจะตรวจสอบยอดและยืนยันออเดอร์ภายใน 24 ชั่วโมง
• สินค้า Pre-Order / Pre-Sale → “รอโรงงานจัดส่งทันที”
• สินค้าพร้อมส่ง → “จัดส่งแล้ว” พร้อมเลข Tracking

Wishyoulucky's Shop
${SITE_URL}`;

  return { subject, html, text };
};

// ---------- Netlify Handler ----------
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: cors(event.headers?.origin) };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cors(event.headers?.origin), body: "Method Not Allowed" };
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    if (!payload?.to || !payload?.order_number) {
      return {
        statusCode: 400,
        headers: cors(event.headers?.origin),
        body: JSON.stringify({ error: "Missing required fields: to, order_number" }),
      };
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: String(SMTP_SECURE || "").toLowerCase() === "true",
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    // Verify SMTP first (better error message)
    await transporter.verify();

    // Build email content
    const mail = makeHtml(payload);

    const info = await transporter.sendMail({
      from: MAIL_FROM,
      to: Array.isArray(payload.to) ? payload.to.join(",") : payload.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });

    return {
      statusCode: 200,
      headers: cors(event.headers?.origin),
      body: JSON.stringify({ ok: true, id: info.messageId }),
    };
  } catch (e) {
    console.error("send-order-received error:", e);
    return {
      statusCode: 500,
      headers: cors(event.headers?.origin),
      body: JSON.stringify({ ok: false, error: e?.message || "Internal Error" }),
    };
  }
};
