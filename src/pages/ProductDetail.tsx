
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, ShoppingCart, Minus, Plus, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const ProductDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<{[key: string]: string}>({});
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    if (!id) {
      console.error('No product ID provided');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('public_products')
        .select('*')
        .eq('id', parseInt(id))
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลสินค้าได้",
          variant: "destructive"
        });
        return;
      }

      setProduct(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    toast({
      title: "เพิ่มลงตะกร้าแล้ว",
      description: `${product.name} จำนวน ${quantity} ชิ้น`,
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    // Navigate to payment page with product info
    window.location.href = `/payment?product=${product.id}&quantity=${quantity}`;
  };

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: value
    }));
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
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onSignOut={signOut} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-center text-gray-500">ไม่พบสินค้าที่คุณต้องการ</p>
        </div>
      </div>
    );
  }

  // Parse options if it exists
  const productOptions = product.options ? (typeof product.options === 'string' ? JSON.parse(product.options) : product.options) : {};

  // Create multiple images array (for now using the same image)
  const productImages = [
    product.image || '/placeholder.svg',
    product.image || '/placeholder.svg'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onSignOut={signOut} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-purple-600">หน้าแรก</Link>
          <span>/</span>
          <Link to="/categories" className="hover:text-purple-600">หมวดหมู่</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex space-x-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-purple-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-gray-600 ml-2">(124 รีวิว)</span>
                </div>
                <Badge variant="secondary">{product.category}</Badge>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold" style={{ color: '#956ec3' }}>
                  ฿{product.selling_price?.toLocaleString()}
                </span>
              </div>
              <p className="text-gray-600">รหัสสินค้า: {product.sku}</p>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">รายละเอียดสินค้า</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Product Options */}
            {Object.keys(productOptions).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">ตัวเลือกสินค้า</h3>
                <div className="space-y-4">
                  {Object.entries(productOptions).map(([optionName, optionValues]) => (
                    <div key={optionName}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {optionName}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(optionValues) ? 
                          optionValues.map((value: any, index: number) => (
                            <button
                              key={index}
                              onClick={() => handleOptionChange(optionName, typeof value === 'object' ? value.name : value)}
                              className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                                selectedOptions[optionName] === (typeof value === 'object' ? value.name : value)
                                  ? 'border-purple-500 bg-purple-50 text-purple-600'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              {typeof value === 'object' ? value.name : value}
                            </button>
                          )) :
                          typeof optionValues === 'object' ?
                            Object.entries(optionValues).map(([key, val]) => (
                              <button
                                key={key}
                                onClick={() => handleOptionChange(optionName, key)}
                                className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                                  selectedOptions[optionName] === key
                                    ? 'border-purple-500 bg-purple-50 text-purple-600'
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                              >
                                {key}
                              </button>
                            )) : (
                              <span className="text-gray-500">ไม่มีตัวเลือก</span>
                            )
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">จำนวน:</span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={handleAddToCart}
                      variant="outline"
                      className="flex-1"
                      style={{ borderColor: '#956ec3', color: '#956ec3' }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      เพิ่มลงตะกร้า
                    </Button>
                    <Button
                      onClick={handleBuyNow}
                      className="flex-1"
                      style={{ backgroundColor: '#956ec3' }}
                    >
                      ซื้อเลย
                    </Button>
                  </div>

                  <Button variant="ghost" className="w-full text-gray-600">
                    <Heart className="h-4 w-4 mr-2" />
                    เพิ่มลงรายการโปรด
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <Link to="/categories">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับไปหมวดหมู่
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
