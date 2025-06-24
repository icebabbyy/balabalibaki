
import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ProductPublic } from "@/types/product";
import Autoplay from "embla-carousel-autoplay";
import EnhancedProductCard from "@/components/categories/EnhancedProductCard";

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
                <EnhancedProductCard 
                  product={product}
                  onProductClick={onProductClick}
                  onAddToCart={onAddToCart}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
      
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
