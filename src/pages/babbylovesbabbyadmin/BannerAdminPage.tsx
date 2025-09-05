import AdminOnly from "./AdminOnly";
import BannerManager from "@/components/BannerManager";
import CategoryBannerManager from "./category-banners/CategoryBannerManager";

export default function BannerAdminPage() {
  return (
    <AdminOnly>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <h1 className="text-2xl font-bold">Banner Admin Panel</h1>

        {/* แบนเนอร์หลักของหน้าแรก */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Main Banners</h2>
          <p className="text-sm text-gray-500">
            สไลด์ด้านบน + แบนเนอร์ตำแหน่งอื่น ๆ
          </p>
          <BannerManager />
        </section>

        {/* แบนเนอร์หมวดหมู่ (ใช้กับ SubcategoryShowcase) */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Category Banners</h2>
          <p className="text-sm text-gray-500">
            ตั้งค่ารูปสำหรับแต่ละหมวดที่จะใช้ใน SubcategoryShowcase
          </p>
          <CategoryBannerManager />
        </section>
      </div>
    </AdminOnly>
  );
}
