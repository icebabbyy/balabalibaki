import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Minus, Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import ProductImageGallery from "@/components/ProductImageGallery";
import { useProductImages } from "@/hooks/useProductImages";

interface Product {
  id: number;
  name: string;
  selling_price: number;
  category: string;
  description: string;
  image: string;
  status: string;
  sku: string;
  options: any;
}

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  
  const { images } = useProductImages(product?.id);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('public_products')
        .select('id, name, selling_price, category, description, image, sku, options')
        .eq('id', parseInt(id!))
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        toast.error('ไม่พบสินค้า');
        return;
      }

      if (data) {
        const productData: Product = {
          id: data.id,
          name: data.name,
          selling_price: data.selling_price,
          category: data.category,
          description: data.description || '',
          image: data.image || '',
          sku: data.sku,
          status: 'พรีออเดอร์',
          options: data.options || {}
        };
        
        console.log('Product data loaded:', productData);
        setProduct(productData);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (!product) return;

    try {
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItemIndex = existingCart.findIndex((item: any) => item.id === product.id);

      if (existingItemIndex > -1) {
        existingCart[existingItemIndex].quantity += quantity;
      } else {
        existingCart.push({
          id: product.id,
          name: product.name,
          price: product.selling_price,
          quantity: quantity,
          image: product.image,
          sku: product.sku,
          selectedOptions
        });
      }

      localStorage.setItem('cart', JSON.stringify(existingCart));
      toast.success(`เพิ่ม ${product.name} ลงในตะกร้าแล้ว`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('เกิดข้อผิดพลาดในการเพิ่มสินค้าลงตะกร้า');
    }
  };

  const buyNow = () => {
    if (!product) return;

    try {
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.selling_price,
        quantity: quantity,
        image: product.image,
        sku: product.sku,
        selectedOptions
      };

      localStorage.setItem('cart', JSON.stringify([cartItem]));
      window.location.href = '/cart';
    } catch (error) {
      console.error('Error in buy now:', error);
      toast.error('เกิดข้อผิดพลาดในการสั่งซื้อ');
    }
  };

  const addToWishlist = () => {
    if (!product) return;
    toast.success("เพิ่มในรายการโปรดแล้ว");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
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
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">ไม่พบสินค้า</h1>
            <Link to="/categories">
              <Button style={{ backgroundColor: '#956ec3' }}>
                กลับไปเลือกสินค้า
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get additional images from product_images
  const additionalImages = images.map(img => img.image_url);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/categories" className="inline-flex items-center text-purple-600 hover:text-purple-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            กลับไปเลือกสินค้า
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <ProductImageGallery
              mainImage={product.image}
              additionalImages={additionalImages}
              productName={product.name}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-3">{product.name}</h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <Badge className="bg-orange-500 text-white">
                  {product.status}
                </Badge>
                <span className="text-sm text-gray-600">หมวดหมู่: {product.category}</span>
                <span className="text-sm text-gray-600">SKU: {product.sku}</span>
              </div>
              
              <p className="text-4xl font-bold mb-6" style={{ color: '#956ec3' }}>
                ฿{product.selling_price?.toLocaleString()}
              </p>
            </div>

            {/* Product Options */}
            {product.options && Object.keys(product.options).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">ตัวเลือกสินค้า</h3>
                {Object.entries(product.options).map(([optionName, optionValues]: [string, any]) => (
                  <div key={optionName}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {optionName}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(optionValues) ? optionValues : [optionValues]).map((value: string, index: number) => (
                        <Button
                          key={index}
                          variant={selectedOptions[optionName] === value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedOptions(prev => ({ ...prev, [optionName]: value }))}
                          style={selectedOptions[optionName] === value ? { backgroundColor: '#956ec3' } : {}}
                        >
                          {value}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  จำนวน
                </label>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={buyNow}
                  className="w-full text-white hover:opacity-90"
                  style={{ backgroundColor: '#956ec3' }}
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  ซื้อเดี๋ยวนี้
                </Button>
                
                <Button
                  onClick={addToCart}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  เพิ่มลงตะกร้า
                </Button>
                
                <Button
                  onClick={addToWishlist}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  เพิ่มในรายการโปรด
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        {product.description && (
          <div className="mt-12">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">รายละเอียดสินค้า</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
