
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, ArrowLeft, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('public_products')
        .select('*')
        .eq('id', parseInt(id))
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('ไม่พบสินค้าที่คุณต้องการ');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    toast.success('เพิ่มสินค้าลงตะกร้าแล้ว');
  };

  const handleBuyNow = () => {
    toast.success('กำลังนำไปหน้าชำระเงิน');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">ไม่พบสินค้าที่คุณต้องการ</p>
          <Link to="/">
            <Button className="bg-purple-600 hover:bg-purple-700">กลับหน้าหลัก</Button>
          </Link>
        </div>
      </div>
    );
  }

  let options = {};
  try {
    if (product.options && typeof product.options === 'string') {
      options = JSON.parse(product.options);
    } else if (product.options && typeof product.options === 'object') {
      options = product.options;
    }
  } catch (error) {
    console.error('Error parsing options:', error);
    options = {};
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-purple-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-purple-700">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">รายละเอียดสินค้า</h1>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={product.image || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-80 md:h-96 object-cover rounded-lg shadow-lg"
              />
              {product.status && (
                <Badge className="absolute top-4 left-4 bg-purple-500 text-white">
                  {product.status}
                </Badge>
              )}
            </div>
            
            {/* Placeholder for additional product images */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <img
                    src={product.image || '/placeholder.svg'}
                    alt={`${product.name} ${index}`}
                    className="w-full h-full object-cover rounded-lg opacity-50"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
              <p className="text-3xl md:text-4xl font-bold text-purple-600 mb-4">
                ฿{product.selling_price?.toLocaleString()}
              </p>
              {product.description && (
                <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
              )}
            </div>

            {/* Shipping Date */}
            {product.shipment_date && (
              <Card className="border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">กำหนดส่ง:</span>
                    <span className="text-purple-600 font-bold">
                      {new Date(product.shipment_date).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Product SKU */}
            {product.sku && (
              <div className="text-sm text-gray-500">
                รหัสสินค้า: {product.sku}
              </div>
            )}

            {/* Options */}
            {Object.keys(options).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">ตัวเลือกสินค้า</h3>
                {Object.entries(options).map(([key, values]) => (
                  <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {key}:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(values) ? values.map((value, index) => (
                        <Button
                          key={index}
                          variant={selectedOptions[key] === value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedOptions({...selectedOptions, [key]: value})}
                          className={selectedOptions[key] === value 
                            ? "bg-purple-600 hover:bg-purple-700" 
                            : "border-purple-300 text-purple-600 hover:bg-purple-50"
                          }
                        >
                          {String(value)}
                        </Button>
                      )) : (
                        <span className="text-sm text-gray-600">{String(values)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">จำนวน:</label>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleBuyNow}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold"
                size="lg"
              >
                ซื้อเดี๋ยวนี้
              </Button>
              <Button
                onClick={handleAddToCart}
                variant="outline"
                className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 py-3 text-lg font-semibold"
                size="lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                เพิ่มลงตะกร้า
              </Button>
              <Button
                variant="outline"
                className="w-full border-red-300 text-red-600 hover:bg-red-50 py-3"
                size="lg"
              >
                <Heart className="h-5 w-5 mr-2" />
                เพิ่มลงรายการโปรด
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
