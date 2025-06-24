// src/hooks/useCategoryFiltering.ts
import { useState, useMemo, useCallback } from 'react';
import { ProductPublic } from '@/types/product';

export const useCategoryFiltering = (products: ProductPublic[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleCategoryChange = useCallback((categoryName: string, checked: boolean) => {
    setSelectedCategories(prev =>
      checked
        ? [...prev, categoryName]
        : prev.filter(c => c !== categoryName)
    );
  }, []);

  const clearCategorySelection = useCallback(() => {
    setSelectedCategories([]);
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        // ป้องกัน Error: ถ้า product ไม่มีจริง หรือ ไม่มีชื่อ ให้กรองออก
        if (!product || !product.name) return false;
        return product.name.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .filter(product => {
        if (selectedCategories.length === 0) return true;
        // ป้องกัน Error: ถ้า product ไม่มีหมวดหมู่ ให้กรองออก
        if (!product || !product.category) return false;
        return selectedCategories.includes(product.category);
      });
  }, [products, searchTerm, selectedCategories]);

  return {
    filteredProducts,
    searchTerm,
    setSearchTerm,
    selectedCategories,
    handleCategoryChange,
    clearCategorySelection,
  };
};
