import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative bg-[#512B81] text-white mt-24 border-t border-white/10">
      {/* โลโก้ลอยเหนือฟุตเตอร์ */}
      <div className="max-w-6xl mx-auto px-4 relative">
        <img
          src="https://qiyywaouaqpvojqeqxnv.supabase.co/storage/v1/object/public/public-images/logo%20wish%20you%20lucky%20090667-02.png"
          alt="Wishyoulucky's Shop"
          className="absolute -top-[72px] left-0 w-[clamp(160px,26vw,240px)] h-auto pointer-events-none select-none"
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* 4 บล็อกหลัก */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* คำอธิบายร้าน — ดันลงมาให้อยู่ใต้โลโก้ */}
          <div className="pt-20 md:pt-24 text-left">
            <p className="pt-[20px] text-WHITE-300 text-sm leading-relaxed">
              ✨Unleash the joy, Collect with Wishyoulucky! รวมสินค้าลิขสิทธิ์จากเกมและอนิเมะ
              ฟิกเกอร์, โมเดล, ของเล่นสะสม, กล่องสุ่ม Art Toys ได้ของชัวร์ ราคาเป็นมิตร
            </p>
          </div>

          {/* เมนูหลัก */}
          <div className="text-left">
            <h3 className="text-lg font-semibold mb-4">เมนูหลัก</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="no-underline text-WHITE-300 hover:text-gray-300 transition-colors text-sm"
                >
                  หน้าแรก
                </Link>
              </li>
              <li>
                <Link
                  to="/categories"
                  className="no-underline text-WHITE-300 hover:text-gray-300 transition-colors text-sm"
                >
                  หมวดหมู่
                </Link>
              </li>
              <li>
                <Link
                  to="/qa"
                  className="no-underline text-WHITE-300 hover:text-gray-300 transition-colors text-sm"
                >
                  Q&amp;A
                </Link>
              </li>
              <li>
                <Link
                  to="/order-status"
                  className="no-underline text-WHITE-300 hover:text-gray-300 transition-colors text-sm"
                >
                  เช็คสถานะ
                </Link>
              </li>
            </ul>
          </div>

          {/* บริการลูกค้า */}
          <div className="text-left">
            <h3 className="text-lg font-semibold mb-4">บริการลูกค้า</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/how-to-order"
                  className="no-underline text-WHITE-300 hover:text-gray-300 transition-colors text-sm"
                >
                  วิธีการสั่งซื้อและการชำระเงิน
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="no-underline text-WHITE-300 hover:text-gray-300 transition-colors text-sm"
                >
                  ระยะเวลาและการจัดส่ง
                </Link>
              </li>
              <li>
                <Link
                  to="/warranty"
                  className="no-underline text-WHITE-300 hover:text-gray-300 transition-colors text-sm"
                >
                  ประกันสินค้า
                </Link>
              </li>
              <li>
                <Link
                  to="/privilege"
                  className="no-underline text-WHITE-300 hover:text-gray-300 transition-colors text-sm"
                >
                  สิทธิประโยชน์
                </Link>
              </li>
            </ul>
          </div>

          {/* ติดต่อเรา */}
          <div className="text-left">
            <h3 className="text-lg font-semibold mb-4">ติดต่อเรา</h3>
            <div className="space-y-2 text-sm text-WHITE-300">
              <p>เดะหาเวลามาใส่ รอแป๊บๆ</p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
                <a
                  href="https://www.facebook.com/wishyoulucky.shop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline text-WHITE-300 hover:text-gray-300 transition-colors"
                >
                  Facebook
                </a>

                <a
                  href="https://www.instagram.com/wishyoulucky_shop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline text-WHITE-300 hover:text-gray-300 transition-colors"
                >
                  Instagram
                </a>

                <Link
                  to="/contact"
                  className="no-underline text-WHITE-300 hover:text-gray-300 transition-colors"
                >
                  ติดต่อเรา
                </Link>
              </div>

              {/* ลิงก์นโยบาย (ขึ้นบรรทัดใหม่, ชิดซ้าย, ไม่ขีดเส้นใต้) */}
              <div className="mt-5">
                <Link
                  to="/privacy-cookies-policy"
                  className="block text-WHITE-300 hover:text-gray-400 no-underline leading-6"
                >
                  <span className="block">Privacy & Cookies Policy</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* เส้นคั่น + ลิขสิทธิ์ */}
        <div className="border-t border-purple-400 mt-10 pt-6 text-center">
          <p className="text-gray-200 text-sm">
            © 2025 Wishyoulucky • Pack with Care, Ship with Love
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
