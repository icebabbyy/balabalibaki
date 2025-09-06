// src/pages/PrivacyCookiesPolicy.tsx
import Header from "@/components/Header";

export default function PrivacyCookiesPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900">
          นโยบายความเป็นส่วนตัวและการใช้คุกกี้
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Privacy &amp; Cookies Policy — www.wishyoulucky.page
        </p>

        <article className="mt-6 bg-white rounded-xl shadow-sm border p-6 leading-relaxed text-gray-800 space-y-4">
          <p>
            เว็บไซต์ <strong>www.wishyoulucky.page</strong> ให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลและสิทธิความเป็นส่วนตัวของผู้ใช้งานทุกท่าน
            โดยนโยบายฉบับนี้ครอบคลุมการจัดเก็บ ใช้ เปิดเผยข้อมูลส่วนบุคคล และการใช้คุกกี้บนเว็บไซต์
            เพื่อให้ท่านมั่นใจได้ว่า ข้อมูลของท่านจะถูกเก็บรักษาและใช้งานอย่างเหมาะสม
            สอดคล้องกับพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
          </p>

          <h2 className="font-semibold text-lg">1) ขอบเขตของนโยบาย</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>เจ้าของและผู้ให้บริการเว็บไซต์: ต่อไปนี้เรียกว่า wishyoulucky</li>
            <li>ผู้เยี่ยมชมเว็บไซต์: ผู้ที่เข้าชม อ่าน หรือดูข้อมูลบนเว็บไซต์</li>
            <li>ผู้ใช้บริการเว็บไซต์: ผู้ที่สมัครสมาชิก สั่งซื้อสินค้า หรือใช้บริการอื่นที่เกี่ยวข้อง</li>
          </ul>

          <h2 className="font-semibold text-lg">2) วัตถุประสงค์ของการเก็บข้อมูล</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>ยืนยันตัวตนและการติดต่อกับผู้ใช้บริการ</li>
            <li>จัดส่งสินค้าและบริการหลังการขาย</li>
            <li>ปรับปรุงเว็บไซต์และประสบการณ์การใช้งาน</li>
            <li>วิเคราะห์เชิงสถิติและการตลาดออนไลน์</li>
            <li>ตรวจสอบความปลอดภัยและป้องกันการเข้าถึงโดยไม่ได้รับอนุญาต</li>
          </ul>

          <h2 className="font-semibold text-lg">3) ข้อมูลที่เราเก็บรวบรวม</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>ชื่อ–นามสกุล, อีเมล, เบอร์โทรศัพท์, ที่อยู่จัดส่ง</li>
            <li>ข้อมูลบัญชีผู้ใช้งาน (เช่น ชื่อผู้ใช้)</li>
            <li>ข้อมูลการทำธุรกรรมและการชำระเงิน</li>
            <li>ข้อมูลจราจรทางคอมพิวเตอร์ เช่น IP Address, Log Files</li>
          </ul>

          <h2 className="font-semibold text-lg">4) การใช้คุกกี้ (Cookies)</h2>
          <p>
            เว็บไซต์ใช้คุกกี้และเทคโนโลยีที่คล้ายกันเพื่อให้ระบบทำงานได้ถูกต้อง จดจำการตั้งค่า วิเคราะห์การใช้งาน
            และนำเสนอคอนเทนต์/สิทธิประโยชน์ที่ตรงกับความสนใจ
            ท่านสามารถตั้งค่าเบราว์เซอร์เพื่อปฏิเสธคุกกี้ที่ไม่จำเป็นได้
            แต่หากปฏิเสธทั้งหมด อาจทำให้บางฟังก์ชันใช้งานได้ไม่เต็มประสิทธิภาพ
          </p>

          <h2 className="font-semibold text-lg">5) การใช้บริการจากบุคคลที่สาม</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Google Analytics — สำหรับวิเคราะห์พฤติกรรมผู้ใช้</li>
            <li>Facebook Pixel / Conversion API — สำหรับการตลาดและโฆษณา</li>
          </ul>

          <h2 className="font-semibold text-lg">6) สิทธิของเจ้าของข้อมูล</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>ขอเข้าถึงหรือรับสำเนาข้อมูลส่วนบุคคลของตน</li>
            <li>ขอแก้ไขข้อมูลให้ถูกต้องและเป็นปัจจุบัน</li>
            <li>ขอให้ลบหรือระงับการใช้ข้อมูลส่วนบุคคล</li>
            <li>ปฏิเสธการใช้งานคุกกี้ที่ไม่จำเป็น</li>
          </ul>

          <h2 className="font-semibold text-lg">7) มาตรการรักษาความปลอดภัย</h2>
          <p>
            เรามีมาตรการด้านเทคนิคและการบริหารจัดการเพื่อปกป้องข้อมูลจากการเข้าถึงโดยไม่ได้รับอนุญาต
            การสูญหาย การเปลี่ยนแปลง หรือการนำไปใช้โดยไม่เหมาะสม และจะปรับปรุงมาตรการให้ทันสมัยอยู่เสมอ
          </p>

          <h2 className="font-semibold text-lg">8) ลิงก์ไปยังเว็บไซต์อื่น</h2>
          <p>
            เว็บไซต์อาจมีลิงก์ไปยังเว็บไซต์ของบุคคลที่สาม ซึ่งอยู่นอกเหนือการควบคุมของเรา
            เราไม่สามารถรับผิดชอบต่อเนื้อหา หรือนโยบายความเป็นส่วนตัวของเว็บไซต์เหล่านั้นได้
            ผู้ใช้งานควรศึกษานโยบายของผู้ให้บริการที่เกี่ยวข้องด้วย
          </p>

          <h2 className="font-semibold text-lg">9) การติดต่อเรา</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Email: wishyoulucky.shop@gmail.com</li>
            <li>Facebook: Wishyoulucky Shop</li>
          </ul>

          <p className="text-xs text-gray-500 pt-2">ปรับปรุงล่าสุด: 2025-08-31</p>
        </article>
      </main>
    </div>
  );
}
