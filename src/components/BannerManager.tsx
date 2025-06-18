
import { useState } from "react";
import { useBanners } from "@/hooks/useBanners";
import { Banner } from "@/types/banner";
import BannerForm from "./BannerForm";
import BannerList from "./BannerList";
import BannerEditForm from "./BannerEditForm";

const BannerManager = () => {
  const { banners, loading, addBanner, updateBanner, deleteBanner } = useBanners();
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
  };

  const handleSaveEdit = (banner: Banner) => {
    updateBanner(banner);
    setEditingBanner(null);
  };

  const handleCancelEdit = () => {
    setEditingBanner(null);
  };

  if (loading) {
    return <div className="text-center py-8">กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6">
      <BannerForm onSubmit={addBanner} />
      <BannerList 
        banners={banners} 
        onEdit={handleEditBanner}
        onDelete={deleteBanner}
      />
      {editingBanner && (
        <BannerEditForm
          banner={editingBanner}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

export default BannerManager;
