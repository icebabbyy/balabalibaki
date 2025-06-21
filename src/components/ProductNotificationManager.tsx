
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Send, Search, Mail, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Product {
  id: number;
  product_name: string;
  product_sku: string;
  category: string;
}

interface Notification {
  id: number;
  type: string;
  recipient_email: string;
  subject: string;
  message: string;
  product_sku?: string;
  sent_at: string;
}

const ProductNotificationManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchNotifications();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('public_products')
        .select('id, product_name, product_sku, category')
        .order('product_name');

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('type', 'product_specific')
        .order('sent_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const getCustomersWithProduct = async (productSku: string) => {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('username, items')
        .not('username', 'is', null);

      if (error) {
        console.error('Error fetching orders:', error);
        return [];
      }

      const customersWithProduct = new Set<string>();

      orders?.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          const hasProduct = order.items.some((item: any) => item.sku === productSku);
          if (hasProduct && order.username) {
            customersWithProduct.add(order.username);
          }
        }
      });

      // Get email addresses for these customers
      if (customersWithProduct.size > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('username, email')
          .in('username', Array.from(customersWithProduct))
          .not('email', 'is', null);

        if (profilesError) {
          console.error('Error fetching customer emails:', profilesError);
          return [];
        }

        return profiles || [];
      }

      return [];
    } catch (error) {
      console.error('Error getting customers with product:', error);
      return [];
    }
  };

  const sendNotification = async () => {
    if (!selectedProduct || !subject.trim() || !message.trim()) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setSending(true);

    try {
      // Get customers who have this product
      const customers = await getCustomersWithProduct(selectedProduct);
      
      if (customers.length === 0) {
        toast.error("ไม่พบลูกค้าที่สั่งซื้อสินค้านี้");
        setSending(false);
        return;
      }

      // Create notification records for each customer
      const notifications = customers.map(customer => ({
        type: 'product_specific',
        recipient_email: customer.email,
        subject: subject,
        message: message,
        product_sku: selectedProduct
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) {
        console.error('Error creating notifications:', error);
        toast.error('เกิดข้อผิดพลาดในการสร้างการแจ้งเตือน');
        return;
      }

      toast.success(`ส่งการแจ้งเตือนให้ลูกค้า ${customers.length} คนแล้ว`);
      
      // Reset form
      setSelectedProduct("");
      setSubject("");
      setMessage("");
      
      // Refresh notifications list
      fetchNotifications();

    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('เกิดข้อผิดพลาดในการส่งการแจ้งเตือน');
    } finally {
      setSending(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedProductInfo = products.find(p => p.product_sku === selectedProduct);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: '#956ec3' }}>
          แจ้งเตือนเฉพาะสินค้า
        </h2>
        <Badge variant="secondary" className="px-3 py-1">
          <Mail className="h-4 w-4 mr-1" />
          ส่งแล้ว {notifications.length} ครั้ง
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Notification Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              ส่งการแจ้งเตือนใหม่
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Product Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">ค้นหาสินค้า</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="ค้นหาชื่อสินค้าหรือ SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Product Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">เลือกสินค้า</label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสินค้าที่จะแจ้งเตือน" />
                </SelectTrigger>
                <SelectContent>
                  {filteredProducts.map((product) => (
                    <SelectItem key={product.product_sku} value={product.product_sku}>
                      <div className="flex flex-col">
                        <span className="font-medium">{product.product_name}</span>
                        <span className="text-sm text-gray-500">SKU: {product.product_sku}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProductInfo && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>สินค้าที่เลือก:</strong> {selectedProductInfo.product_name}
                </p>
                <p className="text-sm text-blue-600">
                  SKU: {selectedProductInfo.product_sku} | หมวดหมู่: {selectedProductInfo.category}
                </p>
              </div>
            )}

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-sm font-medium">หัวข้อ</label>
              <Input
                placeholder="เช่น: อัพเดทการจัดส่งสินค้า"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="text-sm font-medium">ข้อความ</label>
              <Textarea
                placeholder="เช่น: สินค้าที่คุณสั่งจะเลื่อนการจัดส่งเป็นวันที่..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>

            {/* Send Button */}
            <Button
              onClick={sendNotification}
              disabled={sending || !selectedProduct || !subject.trim() || !message.trim()}
              className="w-full"
              style={{ backgroundColor: '#956ec3' }}
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  กำลังส่ง...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  ส่งการแจ้งเตือน
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Notification History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              ประวัติการแจ้งเตือน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-center py-4">ยังไม่มีประวัติการแจ้งเตือน</p>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className="p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{notification.subject}</h4>
                      <span className="text-xs text-gray-500">
                        {new Date(notification.sent_at).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    {notification.product_sku && (
                      <Badge variant="outline" className="text-xs">
                        SKU: {notification.product_sku}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductNotificationManager;
