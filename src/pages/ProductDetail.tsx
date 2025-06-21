
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductVariantSelector from "@/components/ProductVariantSelector";
import ProductBreadcrumb from "@/components/ProductBreadcrumb";
import WishlistButton from "@/components/WishlistButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package, ArrowLeft, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  selling_price: number;
  category: string;
  description: string;
  image: string;
  product_status: string;
  sku: string;
  shipment_date?: string;
  options?: any;
  product_type?: string;
}

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;

    try {
      setLoading(true);

      // Fetch product data
      const { data: productData, error: productError } = await supabase
        .from('public_products')
        .select('*')
        .eq('id', parseInt(id))
        .single();

      if (productError) {
        console.error('Error fetching product:', productError);
        return;
      }

      if (productData) {
        const mappedProduct: Product = {
          id: productData.id || 0,
          name: productData.product_name || '',
          selling_price: productData.selling_price || 0,
          category: productData.category || '',
          description: productData.description || '',
          image: productData.image || '',
          product_status: productData.product_status || 'พรีออเดอร์',
          sku: productData.product_sku || '',
          shipment_date: productData.shipment_date || '',
          options: productData.options || null,
          product_type: productData.product_type || 'ETC'
        };
        setProduct(mappedProduct);

        // Fetch product images
        const { data: imagesData } = await supabase
          .from('product_images')
          .select('image_url')
          .eq('product_id', parseInt(id))
          .order('order', { ascending: true });

        if (imagesData && imagesData.length > 0) {
          setImages(imagesData.map(img => img.image_url));
        } else {
          setImages([mappedProduct.image]);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (!product) return;

    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.selling_price,
        quantity: quantity,
        image: product.image,
        sku: product.sku,
        variant: selectedVariant?.name || null
      };

      const existingItemIndex = cart.findIndex(
        (item: any) => item.id === product.id && item.variant === cartItem.variant
      );

      if (existingItemIndex >= 0) {
        cart[existingItemIndex].quantity += quantity;
      } else {
        cart.push(cartItem);
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("storage"));
      
      toast.success(`เพิ่ม ${product.name} ลงในตะกร้าแล้ว`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('เกิดข้อผิดพลาดในการเพิ่มสินค้าลงตะกร้า');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'พร้อมส่ง':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'พรีออเดอร์':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'สินค้าหมด':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH').format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-purple-600 font-medium">กำลังโหลดข้อมูลสินค้า...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">ไม่พบสินค้า</h3>
            <p className="text-gray-500 mb-4">สินค้าที่คุณค้นหาไม่พบในระบบ</p>
            <Link to="/categories">
              <Button>กลับไปหน้าสินค้า</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <ProductBreadcrumb 
          category={product.category} 
          productName={product.name} 
        />

        {/* Back Button */}
        <div className="mb-6">
          <Link to="/categories">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับไปหน้าสินค้า
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            <ProductImageGallery 
              images={images} 
              productName={product.name} 
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex-1">
                  {product.name}
                </h1>
                <WishlistButton 
                  productId={product.id}
                  productSku={product.sku}
                  size="lg"
                  className="ml-4"
                />
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <Badge className={`${getStatusColor(product.product_status)} border font-medium`}>
                  {product.product_status}
                </Badge>
                <span className="text-sm text-gray-500">SKU: {product.sku}</span>
              </div>

              <p className="text-3xl font-bold text-purple-600 mb-4">
                ฿{formatPrice(product.selling_price)}
              </p>

              {product.shipment_date && (
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>กำหนดส่ง: {new Date(product.shipment_date).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              )}
            </div>

            {/* Variant Selector */}
            {product.options && (
              <ProductVariantSelector
                options={product.options}
                onVariantChange={setSelectedVariant}
              />
            )}

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">จำนวน</label>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="px-4 py-2 border rounded-md bg-white min-w-[60px] text-center">
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
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg"
              disabled={product.product_status === 'สินค้าหมด'}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {product.product_status === 'สินค้าหมด' ? 'สินค้าหมด' : 'เพิ่มลงตะกร้า'}
            </Button>

            {/* Product Description */}
            {product.description && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">รายละเอียดสินค้า</h3>
                <div 
                  className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
