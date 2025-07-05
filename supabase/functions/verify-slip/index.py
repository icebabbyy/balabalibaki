// โค้ดเวอร์ชันชั่วคราว: ไม่มีการเชื่อมต่อกับ KBank
// รอ KBank ตอบกลับ แล้วเราจะนำโค้ดส่วนที่สมบูรณ์กลับมาใช้

// ไม่ต้อง import อะไร เพราะ Deno.serve เป็นฟังก์ชันที่มาพร้อมกับ Deno
Deno.serve(async (req) => {

  // ตรวจสอบว่า request ต้องเป็น POST เท่านั้น
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // รับข้อมูลจาก request body
    const body = await req.json();
    const qrData = body.qr;

    // ตรวจสอบว่ามีข้อมูล qr ส่งมาหรือไม่
    if (!qrData) {
      return new Response(JSON.stringify({ error: "QR data is required in the 'qr' field." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // --- ส่วนที่เชื่อมต่อกับ KBank ถูกปิดไว้ชั่วคราว ---
    // เราจะนำโค้ดส่วนยืนยันสลิปกลับมาใส่ตรงนี้ทีหลัง

    // ตอบกลับไปทันทีว่าได้รับข้อมูลแล้ว เพื่อให้คุณตรวจสอบด้วยตาต่อไป
    return new Response(JSON.stringify({
      status: "ok_pending_manual_verification",
      message: "Successfully received QR data. Please verify manually.",
      data: { receivedQr: qrData }
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    // จัดการ Error ที่อาจเกิดขึ้น
    console.error("Critical error in function:", error.message);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});