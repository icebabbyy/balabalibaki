
import EnhancedProductCard from "./EnhancedProductCard";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

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
}

interface ProductGridProps {
  products: Product[];
  onProductClick: (productId: number) => void;
}

const ProductGrid = ({ products, onProductClick }: ProductGridProps) => {
  const [productImages, setProductImages] = useState<Record<number, string[]>>({});

  useEffect(() => {
    if (products.length > 0) {
      fetchProductImages();
    }
  }, [products]);

  const fetchProductImages = async () => {
    try {
      const productIds = products.map(p => p.id);
      
      const { data: images } = await supabase
        .from('product_images')
        .select('product_id, image_url, order')
        .in('product_id', productIds)
        .order('order', { ascending: true });

      if (images) {
        const imageMap: Record<number, string[]> = {};
        images.forEach(img => {
          if (!imageMap[img.product_id]) {
            imageMap[img.product_id] = [];
          }
          imageMap[img.product_id].push(img.image_url);
        });
        
        // Add primary product image as first image if not already included
        products.forEach(product => {
          if (!imageMap[product.id]) {
            imageMap[product.id] = [product.image];
          } else if (!imageMap[product.id].includes(product.image)) {
            imageMap[product.id].unshift(product.image);
          }
        });
        
        setProductImages(imageMap);
      }
    } catch (error) {
      console.error('Error fetching product images:', error);
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-5m5 0h-5m0 0v5m0-5H9m0 0v5" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">ไม่พบสินค้า</h3>
        <p className="text-gray-500">ลองค้นหาด้วยคำอื่นหรือเลือกหมวดหมู่อื่น</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <EnhancedProductCard
          key={product.id}
          product={product}
          images={productImages[product.id] || [product.image]}
          onClick={() => onProductClick(product.id)}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
