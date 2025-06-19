import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Package, Users, ShoppingCart, TrendingUp } from "lucide-react";
import ProductEditDialog from "@/components/ProductEditDialog";
import OrderManagement from "@/components/OrderManagement";
import BannerManager from "@/components/BannerManager";
import CategoryManager from "@/components/CategoryManager";
import HomepageCategoryManager from "@/components/HomepageCategoryManager";
import BatchImageUploadManager from "@/components/BatchImageUploadManager";

interface Product {
  id: number;
  name: string;
  category: string;
  selling_price: number;
  cost_thb: number;
  import_cost: number;
  exchange_rate: number;
  price_yuan: number;
  image: string;
  description: string;
  sku: string;
  quantity: number;
  product_status: string;
  product_type: string;
  link: string;
  shipment_date: string;
  shipping_fee: string;
  options: any;
  created_at: string;
  updated_at: string;
}

const Admin = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    category: '',
    selling_price: 0,
    cost_thb: 0,
    import_cost: 0,
    exchange_rate: 0,
    price_yuan: 0,
    image: '',
    description: '',
    sku: '',
    quantity: 0,
    product_status: 'พร้อมส่ง',
    product_type: 'ETC',
    link: '',
    shipment_date: new Date().toISOString().split('T')[0],
    shipping_fee: '',
    options: null,
  });
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProductForImages, setSelectedProductForImages] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า');
        return;
      }

      // Map the data to ensure all required fields are present
      const mappedProducts: Product[] = (data || []).map(item => ({
        id: item.id,
        name: item.name || '',
        category: item.category || '',
        selling_price: item.selling_price || 0,
        cost_thb: item.cost_thb || 0,
        import_cost: item.import_cost || 0,
        exchange_rate: item.exchange_rate || 0,
        price_yuan: item.price_yuan || 0,
        image: item.image || '',
        description: item.description || '',
        sku: item.sku || '',
        quantity: item.quantity || 0,
        product_status: item.product_status || 'พรีออเดอร์',
        product_type: item.product_type || 'ETC',
        link: item.link || '',
        shipment_date: item.shipment_date || '',
        shipping_fee: item.shipping_fee || '',
        options: item.options || null,
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString()
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async () => {
    try {
      const { error } = await supabase
        .from('products')
        .insert([newProduct]);

      if (error) {
        console.error('Error creating product:', error);
        toast.error('เกิดข้อผิดพลาดในการสร้างสินค้าใหม่');
        return;
      }

      toast.success('สร้างสินค้าใหม่สำเร็จ!');
      fetchProducts();
      setNewProduct({
        name: '',
        category: '',
        selling_price: 0,
        cost_thb: 0,
        import_cost: 0,
        exchange_rate: 0,
        price_yuan: 0,
        image: '',
        description: '',
        sku: '',
        quantity: 0,
        product_status: 'พร้อมส่ง',
        product_type: 'ETC',
        link: '',
        shipment_date: new Date().toISOString().split('T')[0],
        shipping_fee: '',
        options: null,
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้างสินค้าใหม่');
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        toast.error('เกิดข้อผิดพลาดในการลบสินค้า');
        return;
      }

      toast.success('ลบสินค้าสำเร็จ!');
      fetchProducts();
    } catch (error) {
      console.error('Error:', error);
      toast.error('เกิดข้อผิดพลาดในการลบสินค้า');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'พรีออเดอร์':
        return 'bg-yellow-100 text-yellow-800';
      case 'พร้อมส่ง':
        return 'bg-green-100 text-green-800';
      case 'สินค้าหมด':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-purple-600 font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">แผงควบคุม</h1>
          <p className="text-gray-500">จัดการสินค้า, คำสั่งซื้อ และอื่นๆ</p>
        </div>

        {/* Tabs */}
        <div className="border-b mb-6">
          <nav className="-mb-px flex space-x-4">
            <Button
              variant="ghost"
              className={`py-2 px-4 font-medium border-b-2 rounded-none ${activeTab === 'products' ? 'border-purple-600 text-purple-600' : 'border-transparent hover:text-gray-500'}`}
              onClick={() => setActiveTab('products')}
            >
              สินค้า
            </Button>
            <Button
              variant="ghost"
              className={`py-2 px-4 font-medium border-b-2 rounded-none ${activeTab === 'orders' ? 'border-purple-600 text-purple-600' : 'border-transparent hover:text-gray-500'}`}
              onClick={() => setActiveTab('orders')}
            >
              คำสั่งซื้อ
            </Button>
            <Button
              variant="ghost"
              className={`py-2 px-4 font-medium border-b-2 rounded-none ${activeTab === 'banners' ? 'border-purple-600 text-purple-600' : 'border-transparent hover:text-gray-500'}`}
              onClick={() => setActiveTab('banners')}
            >
              แบนเนอร์
            </Button>
            <Button
              variant="ghost"
              className={`py-2 px-4 font-medium border-b-2 rounded-none ${activeTab === 'categories' ? 'border-purple-600 text-purple-600' : 'border-transparent hover:text-gray-500'}`}
              onClick={() => setActiveTab('categories')}
            >
              หมวดหมู่สินค้า
            </Button>
            <Button
              variant="ghost"
              className={`py-2 px-4 font-medium border-b-2 rounded-none ${activeTab === 'homepage-categories' ? 'border-purple-600 text-purple-600' : 'border-transparent hover:text-gray-500'}`}
              onClick={() => setActiveTab('homepage-categories')}
            >
              หมวดหมู่หน้าแรก
            </Button>
          </nav>
        </div>

        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Product Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  เพิ่มสินค้าใหม่
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">ชื่อสินค้า</Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">หมวดหมู่</Label>
                    <Input
                      id="category"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="image">รูปภาพ (URL)</Label>
                    <Input
                      id="image"
                      value={newProduct.image}
                      onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="selling_price">ราคาขาย</Label>
                    <Input
                      type="number"
                      id="selling_price"
                      value={newProduct.selling_price}
                      onChange={(e) => setNewProduct({ ...newProduct, selling_price: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">จำนวน</Label>
                    <Input
                      type="number"
                      id="quantity"
                      value={newProduct.quantity}
                      onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="product_status">สถานะ</Label>
                    <Select onValueChange={(value) => setNewProduct({ ...newProduct, product_status: value })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" defaultValue={newProduct.product_status}>{newProduct.product_status}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="พร้อมส่ง">พร้อมส่ง</SelectItem>
                        <SelectItem value="พรีออเดอร์">พรีออเดอร์</SelectItem>
                        <SelectItem value="สินค้าหมด">สินค้าหมด</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="product_type">ประเภทสินค้า</Label>
                    <Input
                      id="product_type"
                      value={newProduct.product_type}
                      onChange={(e) => setNewProduct({ ...newProduct, product_type: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">รายละเอียด</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                </div>
                <Button onClick={createProduct}>สร้างสินค้า</Button>
              </CardContent>
            </Card>

            {/* Products List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  รายการสินค้า ({products.length} รายการ)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">รูปภาพ</th>
                        <th className="text-left p-2">ชื่อสินค้า</th>
                        <th className="text-left p-2">SKU</th>
                        <th className="text-left p-2">หมวดหมู่</th>
                        <th className="text-left p-2">ราคาขาย</th>
                        <th className="text-left p-2">สถานะ</th>
                        <th className="text-left p-2">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          </td>
                          <td className="p-2">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-500">จำนวน: {product.quantity}</p>
                            </div>
                          </td>
                          <td className="p-2 font-mono text-sm">{product.sku}</td>
                          <td className="p-2">{product.category}</td>
                          <td className="p-2 font-medium">฿{product.selling_price?.toLocaleString()}</td>
                          <td className="p-2">
                            <Badge className={getStatusColor(product.product_status)}>
                              {product.product_status}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingProduct(product);
                                  setShowEditDialog(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteProduct(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Button to Select Product for Image Management */}
            <Select onValueChange={(value) => {
              const selectedProduct = products.find(p => p.id === parseInt(value));
              setSelectedProductForImages(selectedProduct || null);
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกสินค้าเพื่อจัดการรูปภาพ" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Image Upload Manager */}
            {selectedProductForImages && (
              <Card>
                <CardHeader>
                  <CardTitle>จัดการรูปภาพสินค้า: {selectedProductForImages.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <BatchImageUploadManager 
                    productId={selectedProductForImages.id}
                    onImagesUploaded={(urls) => {
                      console.log('Images uploaded:', urls);
                      toast.success(`อัพโหลดรูปภาพสำเร็จ ${urls.length} รูป`);
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <OrderManagement />
        )}

        {activeTab === 'banners' && (
          <BannerManager />
        )}

        {activeTab === 'categories' && (
          <CategoryManager />
        )}

        {activeTab === 'homepage-categories' && (
          <HomepageCategoryManager />
        )}
      </div>

      {/* Edit Dialog */}
      {showEditDialog && editingProduct && (
        <ProductEditDialog
          product={editingProduct}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSave={(updatedProduct) => {
            // Ensure the updated product has all required fields
            const fullUpdatedProduct: Product = {
              ...updatedProduct,
              created_at: updatedProduct.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            setProducts(products.map(p => p.id === fullUpdatedProduct.id ? fullUpdatedProduct : p));
            setShowEditDialog(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default Admin;
