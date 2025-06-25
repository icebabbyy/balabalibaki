
export interface ProductAdmin {
  id: number;
  name: string;
  selling_price: number;
  category: string;
  description: string;
  image: string;
  product_status: string;
  sku: string;
  price_yuan: number;
  exchange_rate: number;
  import_cost: number;
  cost_thb: number;
  quantity: number;
  shipment_date: string;
  options: any;
  link: string;
  product_type: string;
  shipping_fee: string;
  created_at: string;
  updated_at: string;
  slug?: string;
}

export interface ProductPublic {
  id: number;
  name: string;
  selling_price: number;
  category: string;
  description: string;
  image: string;
  main_image_url?: string;
  product_status: string;
  sku: string;
  quantity: number;
  shipment_date: string;
  options: any;
  product_type: string;
  created_at: string;
  updated_at: string;
  slug?: string;
  product_images?: Array<{
    id: number;
    image_url: string;
    order: number;
  }>;
  all_images?: any;
}
