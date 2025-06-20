import { useState, useMemo } from 'react';
import { ProductPublic } from '@/types/product';

export const useCategoryFiltering = (products: ProductPublic[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(product.category);

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategories]);

  const handleCategoryChange = (categoryName: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryName]);
    } else {
      setSelectedCategories(prev => prev.filter(cat => cat !== categoryName));
    }
  };

  const clearCategorySelection = () => {
    setSelectedCategories([]);
  };

  return {
    filteredProducts,
    searchTerm,
    setSearchTerm,
    selectedCategories,
    setSelectedCategories, // ✅ เพิ่มตรงนี้
    handleCategoryChange,
    clearCategorySelection,
  };
};
