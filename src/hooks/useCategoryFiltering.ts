import { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { ProductPublic } from '@/types/product';

export const useCategoryFiltering = (products: ProductPublic[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const location = useLocation();

  // รับค่าหมวดหมู่จาก URL (เช่น ?category=Zenless%20Zone%20Zero)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromUrl = params.get('category');

    // ทำเฉพาะเมื่อ product โหลดเสร็จ และยังไม่มีหมวดหมู่ใดถูกเลือก
    if (categoryFromUrl && selectedCategories.length === 0 && products.length > 0) {
      const isValid = products.some((p) => p.category === categoryFromUrl);
      if (isValid) {
        setSelectedCategories([categoryFromUrl]);
      }
    }
  }, [location.search, products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategories.length === 0 ||
                              selectedCategories.includes(product.category);
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategories]);

  const handleCategoryChange = (categoryName: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...new Set([...prev, categoryName])]); // ป้องกันซ้ำ
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
    handleCategoryChange,
    clearCategorySelection
  };
};
