
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProductVariantSelectorProps {
  options: any;
  selectedVariant: string;
  onVariantChange: (variant: string) => void;
  onVariantImageChange?: (imageUrl: string | null) => void;
  productImages?: Array<{ id: number; image_url: string; variant_name?: string }>;
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
    
    // Find matching image for this variant with improved matching
    if (onVariantImageChange && productImages.length > 0) {
      const matchingImage = productImages.find(img => {
        if (img.variant_name) {
          // First try exact match with variant_name
          return img.variant_name.toLowerCase() === variant.toLowerCase();
        }
        // Fallback to checking if variant is contained in any image metadata
        return variant && img.variant_name && img.variant_name.toLowerCase().includes(variant.toLowerCase());
      });
      
      if (matchingImage) {
        console.log('Found matching variant image:', matchingImage);
        onVariantImageChange(matchingImage.image_url);
      } else {
        console.log('No matching variant image found, resetting to default');
        onVariantImageChange(null); // Reset to default images
      }
    }
  };

  // Handle different option formats
  const renderOptions = () => {
    // If options is an array of strings - use button style
    if (Array.isArray(options)) {
      return (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">ตัวเลือกสินค้า</h3>
          <div className="flex flex-wrap gap-2">
            {options.map((option: any, index: number) => {
              const optionText = typeof option === 'object' ? 
                (option.name || option.label || JSON.stringify(option)) : 
                String(option);
              
              return (
                <Button
                  key={index}
                  variant={selectedVariant === optionText ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleVariantChange(optionText)}
                  className={`transition-all duration-200 ${
                    selectedVariant === optionText 
                      ? 'shadow-md scale-105' 
                      : 'hover:scale-102'
                  }`}
                  style={selectedVariant === optionText ? { backgroundColor: '#956ec3' } : {}}
                >
                  {optionText}
                </Button>
              );
            })}
          </div>
        </div>
      );
    }

    // If options is an object with different categories
    return Object.entries(options).map(([key, values]) => (
      <div key={key} className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">ตัวเลือกสินค้า</h3>
        <div className="bg-white rounded-lg border p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3 capitalize">
            {key}:
          </label>
          
          {Array.isArray(values) ? (
            // Use different UI based on number of options
            values.length <= 3 ? (
              // Radio buttons for 3 or fewer options
              <RadioGroup
                value={selectedVariant.split(':')[1] || ''}
                onValueChange={(value) => handleVariantChange(`${key}:${value}`)}
                className="space-y-2"
              >
                {values.map((value: any, index: number) => {
                  const valueText = typeof value === 'object' ? 
                    (value.name || value.label || JSON.stringify(value)) : 
                    String(value);
                  
                  return (
                    <div key={`${key}-${index}`} className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value={valueText} 
                        id={`${key}-${valueText}`}
                        className="text-purple-600"
                      />
                      <Label 
                        htmlFor={`${key}-${valueText}`}
                        className="cursor-pointer hover:text-purple-600 transition-colors"
                      >
                        {valueText}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            ) : values.length <= 6 ? (
              // Buttons for 4-6 options
              <div className="flex flex-wrap gap-2">
                {values.map((value: any, index: number) => {
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
                      className="transition-all duration-200"
                      style={selectedVariant === variantKey ? { backgroundColor: '#956ec3' } : {}}
                    >
                      {valueText}
                    </Button>
                  );
                })}
              </div>
            ) : (
              // Dropdown for many options
              <Select
                value={selectedVariant.split(':')[1] || ''}
                onValueChange={(value) => handleVariantChange(`${key}:${value}`)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`เลือก${key}`} />
                </SelectTrigger>
                <SelectContent>
                  {values.map((value: any, index: number) => {
                    const valueText = typeof value === 'object' ? 
                      (value.name || value.label || JSON.stringify(value)) : 
                      String(value);
                    
                    return (
                      <SelectItem key={`${key}-${index}`} value={valueText}>
                        {valueText}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )
          ) : (
            <Badge variant="secondary">{String(values)}</Badge>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-4">
      {renderOptions()}
      {selectedVariant && (
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-purple-700 font-medium">เลือกแล้ว:</span>
            <Badge 
              variant="default" 
              className="bg-purple-600 hover:bg-purple-700"
            >
              {selectedVariant}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariantSelector;
