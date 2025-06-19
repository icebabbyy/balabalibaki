import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Minus, Plus, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { useProductImages } from "@/hooks/useProductImages";
import { useImageGallery } from "@/hooks/useImageGallery";

interface Product {
  id: number;
  name: string;
  selling_price: number;
  category: string;
  description: string;
  image: string;
  status: string;
  sku: string;
  options?: any;
}

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>('');
  
  const { images } = useProductImages(product?.id);
  
  // Combine main product image with additional images
  const allImages = product ? [product.image, ...images.map(img => img.image_url)].filter(Boolean) : [];
  const { selectedIndex, selectImage, nextImage, previousImage, currentImage } = useImageGallery(allImages);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    if (user && product) {
      checkWishlistStatus();
    }
  }, [user, product]);

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
          options: data.options
        };
        
        setProduct(productData);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า');
    } finally {
      setLoading(false);
    }
  };

  const checkWishlistStatus = async () => {
    if (!user || !product) return;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('wishlist')
        .eq('id', user.id)
        .single();

      if (data?.wishlist) {
        const wishlistIds = data.wishlist.split(',').filter((id: string) => id.trim());
        setIsInWishlist(wishlistIds.includes(product.id.toString()));
      }
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    if (!product) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('wishlist')
        .eq('id', user.id)
        .single();

      const currentWishlist = profile?.wishlist ? profile.wishlist.split(',').filter((id: string) => id.trim()) : [];
      let updatedWishlist;

      if (isInWishlist) {
        // Remove from wishlist
        updatedWishlist = currentWishlist.filter((id: string) => id !== product.id.toString());
        setIsInWishlist(false);
        toast.success('ลบออกจากรายการโปรดแล้ว');
      } else {
        // Add to wishlist
        updatedWishlist = [...currentWishlist, product.id.toString()];
        setIsInWishlist(true);
        toast.success('เพิ่มในรายการโปรดแล้ว');
      }

      const { error } = await supabase
        .from('profiles')
        .update({ wishlist: updatedWishlist.join(',') })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating wishlist:', error);
        toast.error('เกิดข้อผิดพลาดในการอัปเดตรายการโปรด');
        setIsInWishlist(!isInWishlist); // Revert state
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปเดตรายการโปรด');
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
          sku: product.sku
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
        sku: product.sku
      };

      localStorage.setItem('cart', JSON.stringify([cartItem]));
      window.location.href = '/cart';
    } catch (error) {
      console.error('Error in buy now:', error);
      toast.error('เกิดข้อผิดพลาดในการสั่งซื้อ');
    }
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

  // Parse product options
  const productOptions = product.options ? (typeof product.options === 'string' ? JSON.parse(product.options) : product.options) : null;

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
          {/* Product Images Gallery */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={currentImage || product?.image || '/placeholder.svg'}
                    alt={product?.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                  
                  {/* Navigation arrows for multiple images */}
                  {allImages.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={previousImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  {/* Image counter */}
                  {allImages.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                      {selectedIndex + 1} / {allImages.length}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => selectImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden ${
                      selectedIndex === index ? 'border-purple-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image || '/placeholder.svg'}
                      alt={`${product?.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{product?.name}</h1>
              <p className="text-sm text-gray-600 mb-2">SKU: {product?.sku}</p>
              
              {/* Status Badge */}
              <Badge 
                className={`text-white mb-2 ${
                  product?.status === 'พรีออเดอร์' 
                    ? 'bg-orange-500' 
                    : 'bg-green-500'
                }`}
              >
                {product?.status}
              </Badge>
              
              <p className="text-sm text-gray-600 mb-4">หมวดหมู่: {product?.category}</p>
              
              <p className="text-4xl font-bold mb-6" style={{ color: '#956ec3' }}>
                ฿{product?.selling_price?.toLocaleString()}
              </p>
            </div>

            {/* Product Options */}
            {productOptions && Object.keys(productOptions).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">ตัวเลือกสินค้า</h3>
                {Object.entries(productOptions).map(([key, values]: [string, any]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {key}
                    </label>
                    <select
                      value={selectedOption}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">เลือก{key}</option>
                      {Array.isArray(values) ? values.map((value, index) => (
                        <option key={index} value={value}>{value}</option>
                      )) : (
                        <option value={values}>{values}</option>
                      )}
                    </select>
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
                  onClick={toggleWishlist}
                  variant="outline"
                  className={`w-full ${isInWishlist ? 'text-red-600 border-red-600 bg-red-50' : ''}`}
                  size="lg"
                >
                  <Heart className={`h-5 w-5 mr-2 ${isInWishlist ? 'fill-current' : ''}`} />
                  {isInWishlist ? 'ลบจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        {product?.description && (
          <div className="mt-12">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-4">รายละเอียดสินค้า</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
