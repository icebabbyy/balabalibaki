
import { useState, useEffect } from "react";

interface Product {
  id: number;
  name: string;
  selling_price: number;
  category: string;
  description: string;
  image: string;
  status: string;
  sku: string;
}

export const useCategoryFiltering = (products: Product[]) => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategories]);

  const filterProducts = () => {
    let filtered = products;

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => selectedCategories.includes(product.category));
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

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
    handleCategoryChange,
    clearCategorySelection
  };
};
