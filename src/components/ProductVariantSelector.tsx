
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

  // Handle different option formats
  const renderOptions = () => {
    // If options is an array of strings
    if (Array.isArray(options)) {
      return options.map((option: string, index: number) => (
        <Button
          key={index}
          variant={selectedVariant === option ? "default" : "outline"}
          size="sm"
          onClick={() => onVariantChange(option)}
          className="mr-2 mb-2"
        >
          {option}
        </Button>
      ));
    }

    // If options is an object with different categories
    return Object.entries(options).map(([key, values]) => (
      <div key={key} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
          {key}:
        </label>
        <div className="flex flex-wrap gap-2">
          {Array.isArray(values) ? values.map((value: string, index: number) => (
            <Button
              key={`${key}-${index}`}
              variant={selectedVariant === `${key}:${value}` ? "default" : "outline"}
              size="sm"
              onClick={() => onVariantChange(`${key}:${value}`)}
            >
              {value}
            </Button>
          )) : (
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
