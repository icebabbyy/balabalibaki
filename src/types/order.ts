
export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sku: string;
  variant?: string | null;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  note: string;
  email?: string;
}

export interface Order {
  id: number;
  created_at: string;
  items: OrderItem[];
  customer_info: CustomerInfo;
  total_selling_price: number;
  status: string;
  tracking_number?: string | null;
  admin_notes?: string | null;
  deposit?: number;
  shipping_cost?: number;
  discount?: number;
  username?: string;
}