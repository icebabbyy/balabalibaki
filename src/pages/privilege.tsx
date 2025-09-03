// src/pages/privilege.tsx
import Header from "@/components/Header";

const BANNER =
  "https://qiyywaouaqpvojqeqxnv.supabase.co/storage/v1/object/public/public-images/11.png";

export default function Privilege() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <img
          src={BANNER}
          alt="Privilege Banner"
          loading="lazy"
          className="mx-auto w-full max-w-[440px] md:max-w-[540px] lg:max-w-[600px] h-auto object-contain rounded-xl border shadow-sm mb-6"
        />

        <div className="space-y-6 text-gray-800">
          <section>
            <h2 className="font-semibold text-lg mb-1">
              🎂 แฮปปี้เบิร์ดเดย์มายเลิฟลี่คลายแอ้นน (NEW)
            </h2>
            <p>
              โชว์หลักฐานวันเกิด สั่งของในเดือนเกิด <b>ลด 5%</b> (ใช้ได้ 1 ครั้ง/1 บิล
              และลดเฉพาะบิลไม่เกิน 10,000 บาท) อยากให้วันเกิดของลูกค้าพิเศษสุด
              งั้นมาช้อปให้รางวัลตัวเองกันเถอะ! 🎁✨
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">🚚 โปรส่งฟรี! ทั่วไทย</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><b>ส่งฟรี</b> จะอยู่ในรายการที่ร้านกำหนด (เกือบทั้งร้าน xD)</li>
              <li>หรือ <b>ซื้อครบ 3 ชิ้นขึ้นไป</b> คละได้ จัดส่งฟรี!</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">💎 ลูกค้าประจำ (Level Up!)</h2>
            <p className="mb-1">
              <b>Legendary Club</b> = ราคาพิเศษ (เคยซื้อ <b>3 ครั้งขึ้นไป</b>)
              จะได้รับส่วนลดแบบลับ ๆ ในแชท 💬
            </p>
            <p>
              <b>Rookie League</b> = ราคาลูกค้าใหม่ ซื้อสินค้าในราคาปกติ
              <span className="text-gray-600"> (แค่ซื้อให้ครบ 3 ครั้งก็อัพเลเวลได้เลย!)</span>
            </p>
            <p className="text-gray-600 mt-1">🎖 ระดับของลูกค้า ทางร้านจะแจ้งให้ทราบในแชทนะคะ</p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">⭐ รีวิวให้ร้าน ลดเพิ่ม 3% (แบบสาธารณะ)</h2>
            <p>
              รีวิวที่หน้าเพจ, สตอรี่, กลุ่มที่เกี่ยวข้องกับเกมและสินค้าที่ซื้อ หรือคอมเมนต์ที่ไหนก็ได้ในเพจ
              เพื่อรับส่วนลด <b>3%</b> สำหรับบิลถัดไป <span className="text-gray-600">(ใช้ได้ 1 ครั้ง/ปี)</span>
            </p>
          </section>

          <p className="text-sm text-gray-500">
            // โปรโมชั่นเฉพาะลูกค้า Game เท่านั้น กล่องสุ่มไม่ร่วมรายการ
          </p>
        </div>
      </div>
    </div>
  );
}
