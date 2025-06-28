// src/components/ProductImageGallery.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductImageGalleryProps {
  mainImage: string;
  additionalImages: string[];
  productName?: string;
  variantImage?: string | null;
}

const ProductImageGallery = ({ 
  mainImage, 
  additionalImages, 
  productName = "สินค้า",
  variantImage 
}: ProductImageGalleryProps) => {

  // ✨ จุดที่แก้ไข: ใช้ useMemo และ new Set เพื่อสร้างลิสต์รูปภาพที่ไม่ซ้ำกัน
  const allImages = useMemo(() => {
    // 1. สร้างอาร์เรย์ดิบขึ้นมาก่อน โดยให้ความสำคัญกับ variantImage
    const rawImages = variantImage 
      ? [variantImage, mainImage, ...additionalImages]
      : [mainImage, ...additionalImages];
    
    // 2. ใช้ filter(Boolean) เพื่อกรองค่า null, undefined, "" ออกไป
    const filteredImages = rawImages.filter(Boolean) as string[];

    // 3. ใช้ new Set เพื่อเอาค่าที่ซ้ำกันออก แล้วแปลงกลับเป็น Array
    return [...new Set(filteredImages)];

  }, [mainImage, additionalImages, variantImage]);


  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const currentImage = allImages[currentImageIndex] || '/placeholder.svg';

  // Reset to first image (variant image if available) when variant changes
  useEffect(() => {
    // เมื่อ variantImage เปลี่ยน หรือ allImages เปลี่ยน (ซึ่งจะเกิดเมื่อ variantImage เปลี่ยน)
    // ให้กลับไปที่รูปแรกสุดเสมอ
    setCurrentImageIndex(0);
  }, [allImages]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <Card>
        <CardContent className="p-0 relative">
          <img
            src={currentImage}
            alt={productName}
            className="w-full max-w-[700px] h-auto max-h-[500px] object-cover rounded-lg"
            style={{ aspectRatio: '7/10', maxHeight: '500px' }}
          />
          
          {/* Navigation Arrows */}
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

          {/* Image Counter */}
          {allImages.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {currentImageIndex + 1} / {allImages.length}
            </div>
          )}
          
          {/* Variant Image Indicator */}
          {variantImage && currentImage === variantImage && (
            <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded text-sm">
              ตัวเลือกที่เลือก
            </div>
          )}
        </CardContent>
      </Card>

      {/* Thumbnail Strip */}
      {allImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => selectImage(index)}
              className={`flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden transition-all ${
                index === currentImageIndex 
                  ? 'border-purple-500 ring-2 ring-purple-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={image}
                alt={`${productName} view ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
