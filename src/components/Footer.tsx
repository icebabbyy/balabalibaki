
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-purple-900 text-white py-12 mt-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <img 
              src="/lovable-uploads/ecaac6f9-54fc-484a-b4fa-bfb1cd61c348.png" 
              alt="Lucky Shop Logo" 
              className="h-12 w-auto mb-4"
            />
            <p className="text-gray-300 text-sm leading-relaxed">
              ร้านค้าออนไลน์ที่มอบความสุขและของดีให้กับคุณทุกคน
            </p>
          </div>

          {/* เมนูหลัก */}
          <div>
            <h3 className="text-lg font-semibold mb-4">เมนูหลัก</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm">
                  หน้าแรก
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-300 hover:text-white transition-colors text-sm">
                  หมวดหมู่
                </Link>
              </li>
              <li>
                <Link to="/qa" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Q&A
                </Link>
              </li>
              <li>
                <Link to="/order-status" className="text-gray-300 hover:text-white transition-colors text-sm">
                  เช็คสถานะ
                </Link>
              </li>
            </ul>
          </div>

          {/* บริการลูกค้า */}
          <div>
            <h3 className="text-lg font-semibold mb-4">บริการลูกค้า</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/how-to-order" className="text-gray-300 hover:text-white transition-colors text-sm">
                  วิธีการสั่งซื้อ
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-300 hover:text-white transition-colors text-sm">
                  การจัดส่ง
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-300 hover:text-white transition-colors text-sm">
                  ประกันสินค้า
                </Link>
              </li>
            </ul>
          </div>

          {/* ติดต่อเรา */}
          <div>
            <h3 className="text-lg font-semibold mb-4">ติดต่อเรา</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>รับข้อมูลสาธารณะโปรโมชั่นใน Wishyoulucky's Shop พิเศษ</p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Facebook
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Instagram
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  ติดต่อเรา
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-purple-700 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Wishyoulucky's Shop. สงวนลิขสิทธิ์ทั้งหมด
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
