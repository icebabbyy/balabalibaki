
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductVariantSelectorProps {
  options: any;
  selectedVariant: string;
  onVariantChange: (variant: string) => void;
  onVariantImageChange?: (imageUrl: string | null) => void;
  productImages?: Array<{ id: number; image_url: string; variant?: string }>;
}

const ProductVariantSelector = ({ 
  options, 
  selectedVariant, 
  onVariantChange,
  onVariantImageChange,
  productImages = []
}: ProductVariantSelectorProps) => {
  if (!options || typeof options !== 'object') {
    return null;
  }

  console.log('ProductVariantSelector options:', options);
  console.log('ProductVariantSelector productImages:', productImages);

  const handleVariantChange = (variant: string) => {
    onVariantChange(variant);
    
    // Find matching image for this variant
    if (onVariantImageChange && productImages.length > 0) {
      const matchingImage = productImages.find(img => 
        img.variant && img.variant.toLowerCase().includes(variant.toLowerCase())
      );
      
      if (matchingImage) {
        onVariantImageChange(matchingImage.image_url);
      } else {
        onVariantImageChange(null); // Reset to default images
      }
    }
  };

  // Handle different option formats
  const renderOptions = () => {
    // If options is an array of strings
    if (Array.isArray(options)) {
      return options.map((option: any, index: number) => {
        const optionText = typeof option === 'object' ? 
          (option.name || option.label || JSON.stringify(option)) : 
          String(option);
        
        return (
          <Button
            key={index}
            variant={selectedVariant === optionText ? "default" : "outline"}
            size="sm"
            onClick={() => handleVariantChange(optionText)}
            className="mr-2 mb-2"
            style={selectedVariant === optionText ? { backgroundColor: '#956ec3' } : {}}
          >
            {optionText}
          </Button>
        );
      });
    }

    // If options is an object with different categories
    return Object.entries(options).map(([key, values]) => (
      <div key={key} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
          {key}:
        </label>
        <div className="flex flex-wrap gap-2">
          {Array.isArray(values) ? values.map((value: any, index: number) => {
            const valueText = typeof value === 'object' ? 
              (value.name || value.label || JSON.stringify(value)) : 
              String(value);
            
            const variantKey = `${key}:${valueText}`;
            
            return (
              <Button
                key={`${key}-${index}`}
                variant={selectedVariant === variantKey ? "default" : "outline"}
                size="sm"
                onClick={() => handleVariantChange(variantKey)}
                style={selectedVariant === variantKey ? { backgroundColor: '#956ec3' } : {}}
              >
                {valueText}
              </Button>
            );
          }) : (
            <Badge variant="secondary">{String(values)}</Badge>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">ตัวเลือกสินค้า</h3>
      {renderOptions()}
      {selectedVariant && (
        <div className="mt-2">
          <span className="text-sm text-gray-600">เลือก: </span>
          <Badge variant="default" style={{ backgroundColor: '#956ec3' }}>
            {selectedVariant}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default ProductVariantSelector;
