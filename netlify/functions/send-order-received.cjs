// netlify/functions/send-order-received.cjs
const nodemailer = require("nodemailer");

// ==== ENV ที่ต้องตั้งบน Netlify ====
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = process.env.SMTP_SECURE
  ? process.env.SMTP_SECURE === "true"
  : SMTP_PORT === 465;
const SMTP_USER = process.env.SMTP_USER;           // eg. wishyoulucky.shop@gmail.com
const SMTP_PASS = process.env.SMTP_PASS;           // App Password ของ Gmail
const FROM = process.env.MAIL_FROM
  || `Wishyoulucky's Shop <${SMTP_USER}>`;

const ORDER_STATUS_URL =
  process.env.ORDER_STATUS_URL || "https://wishyoulucky.page/order-status";

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

const cors = (origin) => ({
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
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" })
    .format(toNumber(n));

const paymentChannelText = (m) =>
  m === "truemoney" ? "TrueMoney Wallet" : "โอนผ่านธนาคาร (K SHOP QR)";

const paymentTypeText = (total, deposit) => {
  const dep = toNumber(deposit);
  return dep > 0 && dep < toNumber(total) ? "มัดจำ" : "โอนเต็ม";
};

const buildItemsHTML = (items = []) =>
  items.map((it) => {
    const price = toNumber(it.price);
    const qty = toNumber(it.quantity, 1);
    const amount = price * qty;
    const due =
      it.due_date || it.eta || it.delivery_eta || it.ship_date || it.preorder_eta || "-";
    const sku = it.sku ? String(it.sku) : null;

    return `
<tr>
  <td style="padding:14px 0;border-bottom:1px solid #f0f0f0;">
    <div style="display:flex;gap:12px;align-items:flex-start;">
      ${it.image ? `<img src="${it.image}" width="72" height="72" style="border-radius:10px;object-fit:cover;border:1px solid #eee;flex:0 0 72px;" />` : ""}
      <div style="min-width:0;flex:1;">
        <div style="display:flex;justify-content:space-between;gap:12px;">
          <div style="font-weight:700;line-height:1.35;word-break:break-word;">${it.name || "-"}</div>
          <div style="white-space:nowrap;font-weight:700;">${amount ? thb(amount) : "-"}</div>
        </div>
        <div style="font-size:12px;color:#666;margin-top:4px;">
          ${sku ? `SKU: ${sku} • ` : ""}QTY: ${qty} • กำหนดส่ง: ${due}
        </div>
      </div>
    </div>
  </td>
</tr>`;
  }).join("");

const htmlTemplate = (p) => {
  const orderNo = p.order_number || "-";
  const link = `${ORDER_STATUS_URL}?order=${encodeURIComponent(orderNo)}&email=${encodeURIComponent(p.to)}`;

  const shippingFee = toNumber(p.shipping_fee ?? p.shipping ?? p.ship_cost ?? 0);
  const tax = toNumber(p.tax ?? p.vat ?? 0);
  const paid = toNumber(p.paid_amount ?? p.paid ?? 0);

  const itemsSubtotal = p.subtotal ?? (p.items || []).reduce((sum, it) =>
    sum + toNumber(it.price) * toNumber(it.quantity, 1), 0);

  const total = p.total_price ?? p.total ?? (itemsSubtotal + shippingFee + tax);
  const balance = Math.max(total - paid, 0);

  const shippingInfo =
    p.shipping_title || p.courier || p.shipping_method || p.delivery_method || "Shipping";

  const billing = p.billing || p.customer || { name: "", address: "", phone: "" };
  const shipping = p.shipping || p.customer || { name: "", address: "", phone: "" };

  const subject = "Wishyoulucky's Shop Order Received (สรุปคำสั่งซื้อ) 🍀";

  const html = `
<div style="font-family:Inter,Arial,Helvetica,sans-serif;max-width:720px;margin:0 auto;background:#ffffff;">
  <div style="padding:24px;">
    <h2 style="margin:0 0 8px;">🩰🎨 Thank you for shopping with Wishyoulucky's! 🌷🌟</h2>
    <p style="margin:0 0 16px;color:#333;">💖 ขอบพระคุณที่ไว้วางใจสั่งสินค้ากับทางร้านนะคะ 💖</p>

    <div style="text-align:center;margin-top:16px;">
      <a href="${link}" style="display:inline-block;background:#8b5cf6;color:#fff;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:600;">
        👉 คลิกที่นี่เพื่อดูรายละเอียดออเดอร์ของคุณ
      </a>
    </div>

    <div style="border:1px solid #eee;border-radius:12px;padding:16px;margin-top:20px;">
      <h3 style="margin:0 0 10px;color:#111;">ORDER SUMMARY</h3>
      <div style="font-weight:700;margin-bottom:6px;">📋 สรุปรายการสั่งซื้อ Order #${orderNo}</div>
      <table style="width:100%;border-collapse:collapse;">${buildItemsHTML(p.items || [])}</table>
    </div>

    <div style="border:1px solid #eee;border-radius:12px;padding:16px;margin-top:16px;background:#fafafa;">
      <div style="display:flex;gap:24px;flex-wrap:wrap;">
        <div style="flex:1 1 260px;min-width:240px;">
          <div style="font-weight:700;margin-bottom:6px;">Shipping Info</div>
          <div style="color:#444;">${shippingInfo}</div>
          <div style="margin-top:10px;color:#444;">
            <div><strong>รูปแบบการชำระเงิน:</strong> ${paymentTypeText(total, p.deposit)}</div>
            <div><strong>ช่องทางชำระเงิน:</strong> ${paymentChannelText(p.payment_method)}</div>
          </div>
        </div>
        <div style="flex:1 1 260px;min-width:240px;">
          <div style="font-weight:700;margin-bottom:6px;">สรุปยอด</div>
          <div style="display:flex;justify-content:space-between;margin:4px 0;"><span>Item Subtotal:</span><span>${thb(itemsSubtotal)}</span></div>
          <div style="display:flex;justify-content:space-between;margin:4px 0;"><span>Shipping &amp; Handling:</span><span>${thb(shippingFee)}</span></div>
          <div style="display:flex;justify-content:space-between;margin:4px 0;"><span>Tax:</span><span>${thb(tax)}</span></div>
          <div style="border-top:1px solid #e6e6e6;margin-top:6px;padding-top:8px;display:flex;justify-content:space-between;font-weight:700;">
            <span>Total:</span><span>${thb(total)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:6px;"><span>ยอดชำระแล้ว:</span><span>${thb(paid)}</span></div>
          <div style="display:flex;justify-content:space-between;margin-top:2px;"><span>คงเหลือ:</span><span>${thb(balance)}</span></div>
        </div>
      </div>
    </div>

    <div style="border:1px solid #eee;border-radius:12px;padding:16px;margin-top:16px;">
      <h3 style="margin:0 0 10px;color:#111;">ORDER DETAILS</h3>
      <div style="display:flex;gap:24px;flex-wrap:wrap;">
        <div style="flex:1 1 300px;min-width:260px;">
          <div style="font-weight:700;margin-bottom:6px;">Billing Address:</div>
          <div style="color:#111;">${billing.name || "-"}</div>
          <div style="color:#444;white-space:pre-line;">${billing.address || "-"}</div>
          <div style="color:#444;">${billing.phone ? "+" + String(billing.phone) : "-"}</div>
        </div>
        <div style="flex:1 1 300px;min-width:260px;">
          <div style="font-weight:700;margin-bottom:6px;">Shipping Address:</div>
          <div style="color:#111;">${shipping.name || "-"}</div>
          <div style="color:#444;white-space:pre-line;">${shipping.address || "-"}</div>
          <div style="color:#444;">${shipping.phone ? "+" + String(shipping.phone) : "-"}</div>
        </div>
      </div>
      ${p.customer?.note ? `<div style="margin-top:12px;padding-top:8px;border-top:1px dashed #e6e6e6;"><strong>หมายเหตุจากลูกค้า:</strong> ${p.customer.note}</div>` : ""}
    </div>

    <div style="border:1px solid #eee;border-radius:12px;padding:16px;margin-top:16px;">
      <p style="margin:0 0 6px;">ทางร้านจะทำการตรวจสอบยอดและยืนยันออเดอร์ของคุณภายใน 24 ชั่วโมง ค่ะ</p>
      <ul style="margin:0 0 8px 18px;padding:0;">
        <li>✨ สินค้า Pre-Order / Pre-Sale → สถานะจะเปลี่ยนเป็น “รอโรงงานจัดส่งทันที”</li>
        <li>📦 สินค้าพร้อมส่ง → สถานะจะเปลี่ยนเป็น “จัดส่งแล้ว” พร้อมเลข Tracking</li>
      </ul>
      <p style="margin:0;">อีเมลนี้สำหรับแจ้งข้อมูลและอัปเดตเท่านั้น หากมีคำถามเพิ่มเติมสามารถติดต่อเพจ Wishyoulucky's Shop</p>
    </div>

    <p style="margin-top:16px;color:#666;">ขอบคุณที่ไว้วางใจเราเสมอค่ะ 💖</p>
    <p style="color:#666;margin:0;">Wishyoulucky's Shop</p>
  </div>
</div>`;

  const text = `ขอบพระคุณที่สั่งซื้อกับ Wishyoulucky's Shop
📋 สรุปรายการสั่งซื้อ Order #${orderNo}

ยอดรวมสินค้า: ${thb(itemsSubtotal)}
ค่าจัดส่ง: ${thb(shippingFee)}
ภาษี: ${thb(tax)}
รวมทั้งสิ้น: ${thb(total)}
ยอดชำระแล้ว: ${thb(paid)}  คงเหลือ: ${thb(balance)}
รูปแบบการชำระเงิน: ${paymentTypeText(total, p.deposit)}
ช่องทางชำระเงิน: ${paymentChannelText(p.payment_method)}

Billing Address: ${billing.name} / ${billing.phone || "-"}
${billing.address || "-"}

Shipping Address: ${shipping.name} / ${shipping.phone || "-"}
${shipping.address || "-"}

หมายเหตุ: ${p.customer?.note || "-"}

ดูรายละเอียดออเดอร์: ${link}`;

  return { subject, html, text };
};

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

    const mail = htmlTemplate(payload);

    await transporter.sendMail({
      from: FROM,
      to: payload.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });

    return { statusCode: 200, headers: cors(event.headers?.origin), body: JSON.stringify({ ok: true }) };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      headers: cors(event.headers?.origin),
      body: JSON.stringify({ error: e?.message || "Internal Error" }),
    };
  }
};
