import { useState, useEffect } from "react";Add commentMore actions
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { ProductPublic } from "@/types/product";
import Autoplay from "embla-carousel-autoplay";

interface FeaturedProductsCarouselProps {
  products: ProductPublic[];
  onProductClick: (productId: number) => void;
  onAddToCart: (product: ProductPublic) => void;
}

const FeaturedProductsCarousel = ({ products, onProductClick, onAddToCart }: FeaturedProductsCarouselProps) => {
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const ProductCard = ({ product }: { product: ProductPublic }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <Card 
        className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative">
          <img
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-48 object-cover rounded-t-lg transition-all duration-500 ease-in-out"
            style={{
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.3s ease-in-out'
            }}
            onClick={() => onProductClick(product.id)}
          />
          {product.product_status && (
            <Badge className="absolute top-2 left-2 bg-purple-600">
              {product.product_status}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 
            className="font-semibold mb-2 line-clamp-2 hover:text-purple-600 transition-colors" 
            onClick={() => onProductClick(product.id)}
          >
            {product.name}
          </h3>
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-purple-600">
              ฿{product.selling_price?.toLocaleString()}
            </span>
          </div>
          <div className="space-y-2">
            <Button 
              size="sm" 
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => onProductClick(product.id)}
            >
              ซื้อเดี๋ยวนี้
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => onAddToCart(product)}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              เพิ่มลงตะกร้า
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        ไม่พบสินค้าที่แนะนำ
      </div>
    );
  }

  return (
    <div className="relative">
      <Carousel 
        setApi={setApi}
        className="w-full"
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: true,
          })
        ]}
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/4">
              <div className="p-1">
                <ProductCard product={product} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
      
      {/* Dots Navigation */}
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index + 1 === current 
                ? 'bg-purple-600 w-4' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            onClick={() => api?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedProductsCarousel;
