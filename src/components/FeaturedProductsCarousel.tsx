
import { useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import EnhancedProductCard from "@/components/categories/EnhancedProductCard";
import { useNavigate } from "react-router-dom";

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

interface FeaturedProductsCarouselProps {
  products: Product[];
  productImages?: Record<number, string[]>;
}

const FeaturedProductsCarousel = ({ products, productImages = {} }: FeaturedProductsCarouselProps) => {
  const navigate = useNavigate();
  const autoplayRef = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: "start",
      slidesToScroll: 1,
      breakpoints: {
        '(min-width: 768px)': { slidesToScroll: 2 },
        '(min-width: 1024px)': { slidesToScroll: 3 }
      }
    },
    [autoplayRef.current]
  );

  const scrollPrev = () => {
    if (emblaApi) emblaApi.scrollPrev();
  };

  const scrollNext = () => {
    if (emblaApi) emblaApi.scrollNext();
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  if (products.length === 0) return null;

  return (
    <div className="relative">
      {/* Navigation Arrows */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
        onClick={scrollPrev}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
        onClick={scrollNext}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="flex-[0_0_100%] min-w-0 pr-4 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
            >
              <EnhancedProductCard
                product={product}
                images={productImages[product.id]}
                onClick={() => handleProductClick(product.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: Math.ceil(products.length / 3) }).map((_, index) => (
          <button
            key={index}
            className="w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors duration-200"
            onClick={() => emblaApi?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedProductsCarousel;
