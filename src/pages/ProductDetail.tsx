
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Minus, Plus, ArrowLeft, Calendar, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ProductDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});

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
      
      // Initialize selected options with first option of each category
      if (data?.options && typeof data.options === 'object') {
        const initialOptions: { [key: string]: string } = {};
        Object.keys(data.options).forEach(key => {
          const optionValues = data.options[key];
          if (Array.isArray(optionValues) && optionValues.length > 0) {
            initialOptions[key] = optionValues[0];
          }
        });
        setSelectedOptions(initialOptions);
      }
      
      // Fetch related products from same category
      if (data?.category) {
        const { data: relatedData } = await supabase
          .from('public_products')
          .select('*')
          .eq('category', data.category)
          .neq('id', parseInt(id))
          .limit(4);
        
        if (relatedData && relatedData.length > 0) {
          setRelatedProducts(relatedData);
        } else {
          // If no products in same category, get random products
          const { data: randomData } = await supabase
            .from('public_products')
            .select('*')
            .neq('id', parseInt(id))
            .limit(4);
          setRelatedProducts(randomData || []);
        }
      }
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
    window.location.href = `/payment?product=${product.id}&quantity=${quantity}`;
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "ลบออกจากรายการโปรด" : "เพิ่มลงรายการโปรด",
      description: product?.name,
    });
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
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-center text-gray-500">ไม่พบสินค้าที่คุณต้องการ</p>
        </div>
      </div>
    );
  }

  // Create multiple images array (for now using the same image)
  const productImages = [
    product.image || '/placeholder.svg',
    product.image || '/placeholder.svg'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-purple-600">หน้าแรก</Link>
          <span>/</span>
          <Link to="/categories" className="hover:text-purple-600">หมวดหมู่</Link>
          <span>/</span>
          <span className="hover:text-purple-600">{product.category}</span>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images - Made smaller */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm max-w-md mx-auto">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex space-x-2 justify-center">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
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
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleFavorite}
                  className={`${isFavorite ? 'text-red-500 border-red-500' : 'text-gray-400'}`}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
              </div>
              <div className="flex items-center space-x-4 mb-4">
                <Badge variant="secondary">{product.category}</Badge>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-primary">
                  ฿{product.selling_price?.toLocaleString()}
                </span>
              </div>
              <p className="text-gray-600">รหัสสินค้า: {product.sku}</p>
              <div className="flex items-center space-x-2">
                <p className="text-gray-600">สถานะ: {product.status || 'พร้อมส่ง'}</p>
                {product.shipment_date && (
                  <div className="flex items-center space-x-1 text-orange-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">กำหนดส่ง: {new Date(product.shipment_date).toLocaleDateString('th-TH')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Options */}
            {product.options && typeof product.options === 'object' && Object.keys(product.options).length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">ตัวเลือกสินค้า</h3>
                  <div className="space-y-4">
                    {Object.entries(product.options).map(([optionName, optionValues]) => (
                      <div key={optionName}>
                        <label className="block text-sm font-medium mb-2">{optionName}:</label>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(optionValues) && optionValues.map((value: string) => (
                            <button
                              key={value}
                              onClick={() => setSelectedOptions(prev => ({ ...prev, [optionName]: value }))}
                              className={`px-3 py-1 rounded-md border text-sm ${
                                selectedOptions[optionName] === value
                                  ? 'bg-purple-600 text-white border-purple-600'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-purple-600'
                              }`}
                            >
                              {value}
                            </button>
                          ))}
                        </div>
                        {selectedOptions[optionName] && (
                          <p className="text-sm text-gray-600 mt-1">เลือก: {selectedOptions[optionName]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      เพิ่มลงตะกร้า
                    </Button>
                    <Button
                      onClick={handleBuyNow}
                      className="flex-1"
                    >
                      ซื้อเดี๋ยวนี้
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {product.description && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-3">รายละเอียดสินค้า</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">สินค้าที่เกี่ยวข้อง</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} to={`/product/${relatedProduct.id}`}>
                  <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-0">
                      <div className="relative">
                        <div className="w-full h-40 bg-gray-200 rounded-t-lg overflow-hidden">
                          <img 
                            src={relatedProduct.image || '/placeholder.svg'} 
                            alt={relatedProduct.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {relatedProduct.status && (
                          <Badge 
                            className="absolute top-2 left-2 text-xs"
                          >
                            {relatedProduct.status}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="p-3">
                        <h3 className="font-medium text-sm mb-2 line-clamp-2">{relatedProduct.name}</h3>
                        <span className="text-lg font-bold text-primary">
                          ฿{relatedProduct.selling_price?.toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

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
