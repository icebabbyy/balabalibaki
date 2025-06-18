
export interface Banner {
  id: string;
  image_url: string;
  position: number;
  active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface NewBannerForm {
  image_url: string;
  position: number;
  active: boolean;
}
