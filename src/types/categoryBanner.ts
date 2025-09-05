export interface CategoryBanner {
  id: string;
  category_id?: number | null;
  category_name?: string | null;
  image_url: string;
  link_url?: string | null;
  active: boolean;
  updated_by?: string | null;
  updated_at?: string | null;
}

export interface NewCategoryBannerForm {
  category_id?: number | null;
  category_name?: string | null;
  image_url: string;
  link_url?: string | null;
  active: boolean;
}
