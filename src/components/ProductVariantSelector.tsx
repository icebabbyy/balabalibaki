
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductVariantSelectorProps {
  options: any;
  selectedVariant: string;
  onVariantChange: (variant: string) => void;
}

const ProductVariantSelector = ({ options, selectedVariant, onVariantChange }: ProductVariantSelectorProps) => {
  if (!options || typeof options !== 'object') {
    return null;
  }

  console.log('ProductVariantSelector options:', options);

  // Handle different option formats
  const renderOptions = () => {
    // If options is an array of strings
    if (Array.isArray(options)) {
      return options.map((option: any, index: number) => {
        // Convert option to string if it's an object
        const optionText = typeof option === 'object' ? 
          (option.name || option.label || JSON.stringify(option)) : 
          String(option);
        
        return (
          <Button
            key={index}
            variant={selectedVariant === optionText ? "default" : "outline"}
            size="sm"
            onClick={() => onVariantChange(optionText)}
            className="mr-2 mb-2"
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
            // Convert value to string if it's an object
            const valueText = typeof value === 'object' ? 
              (value.name || value.label || JSON.stringify(value)) : 
              String(value);
            
            return (
              <Button
                key={`${key}-${index}`}
                variant={selectedVariant === `${key}:${valueText}` ? "default" : "outline"}
                size="sm"
                onClick={() => onVariantChange(`${key}:${valueText}`)}
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
          <Badge variant="default">{selectedVariant}</Badge>
        </div>
      )}
    </div>
  );
};

export default ProductVariantSelector;
