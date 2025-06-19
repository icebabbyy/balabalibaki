
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Package, Calendar, Truck } from "lucide-react";
import { toast } from "sonner";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductVariantSelector from "@/components/ProductVariantSelector";
import ProductBreadcrumb from "@/components/ProductBreadcrumb";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      const productId = parseInt(id, 10);
      if (!isNaN(productId)) {
        fetchProduct(productId);
        fetchProductImages(productId);
      }
    }
  }, [id]);

  const fetchProduct = async (productId: number) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        toast.error('ไม่พบสินค้าที่ต้องการ');
        navigate('/');
        return;
      }

      setProduct(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductImages = async (productId: number) => {
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('order', { ascending: true });

      if (error) {
        console.error('Error fetching product images:', error);
        return;
      }

      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const addToCart = () => {
    if (!product) return;

    // Validate variant selection if options exist
    if (product.options && !selectedVariant) {
      toast.error('กรุณาเลือกตัวเลือกสินค้า');
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.selling_price,
      image: product.image,
      quantity: quantity,
      sku: product.sku,
      variant: selectedVariant || null,
      product_type: product.product_type || 'ETC'
    };

    // Get existing cart
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if item with same variant already exists
    const existingItemIndex = existingCart.findIndex((item: any) => 
      item.id === cartItem.id && item.variant === cartItem.variant
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      existingCart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    toast.success(`เพิ่ม "${product.name}" ลงในตะกร้าแล้ว`);
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
            <p className="text-purple-600 font-medium">กำลังโหลดข้อมูลสินค้า...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">ไม่พบสินค้า</h2>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับหน้าแรก
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Convert images array to proper format for ProductImageGallery
  const additionalImageUrls = images.map(img => img.image_url);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <ProductBreadcrumb 
            category={product.category} 
            productName={product.name} 
          />

          {/* Back Button */}
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            ย้อนกลับ
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div>
              <ProductImageGallery 
                mainImage={product.image}
                additionalImages={additionalImageUrls}
                productName={product.name}
              />
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center space-x-3 mb-4">
                  <Badge className={getStatusColor(product.product_status)}>
                    {product.product_status}
                  </Badge>
                  <span className="text-gray-500">SKU: {product.sku}</span>
                </div>
              </div>

              {/* Price */}
              <div className="text-3xl font-bold text-purple-600">
                ฿{product.selling_price?.toLocaleString()}
              </div>

              {/* Product Options */}
              {product.options && (
                <ProductVariantSelector
                  options={product.options}
                  selectedVariant={selectedVariant}
                  onVariantChange={setSelectedVariant}
                />
              )}

              {/* Quantity */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  จำนวน
                </label>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="px-4 py-2 border rounded text-center min-w-[60px]">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button 
                onClick={addToCart}
                className="w-full py-3 text-lg"
                style={{ backgroundColor: '#956ec3' }}
                disabled={product.product_status === 'สินค้าหมด'}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.product_status === 'สินค้าหมด' ? 'สินค้าหมด' : 'เพิ่มลงตะกร้า'}
              </Button>

              {/* Product Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Package className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium">หมวดหมู่</p>
                        <p className="text-sm text-gray-600">{product.category}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {product.shipment_date && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium">วันที่ส่ง</p>
                          <p className="text-sm text-gray-600">
                            {new Date(product.shipment_date).toLocaleDateString('th-TH')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {product.shipping_fee && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium">ค่าจัดส่ง</p>
                          <p className="text-sm text-gray-600">{product.shipping_fee}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>รายละเอียดสินค้า</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-line">
                      {product.description}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
