import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import type { ProductPublic } from "@/types/product";

/* ===== master options ===== */
export const STATUS_OPTIONS = ["พร้อมส่ง", "พรีออเดอร์", "pre-sale"] as const;
export type StatusOption = (typeof STATUS_OPTIONS)[number];

export const PRODUCT_TYPE_OPTIONS = [
  "Big Figure/Statue",
  "Medium Figure/Statue",
  "Mini Figure/Figure",
  "Keyring/Keychain",
  "Plush",
  "Standee",
] as const;
export type ProductTypeOption = (typeof PRODUCT_TYPE_OPTIONS)[number];

export const useCategoryFiltering = (products: ProductPublic[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<StatusOption[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<ProductTypeOption[]>([]);

  const location = useLocation();

  /* init from URL */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromUrl = params.get("category");
    const statusFromUrl = params.get("status");
    const typeFromUrl = params.get("type");

    if (categoryFromUrl && selectedCategories.length === 0 && products.length > 0) {
      const exists = products.some((p) => {
        const cat = (p.category ?? (p as any).category_name ?? "").trim();
        return cat && cat === categoryFromUrl;
      });
      if (exists) setSelectedCategories([categoryFromUrl]);
    }

    if (statusFromUrl && selectedStatuses.length === 0) {
      if (STATUS_OPTIONS.includes(statusFromUrl as StatusOption)) {
        setSelectedStatuses([statusFromUrl as StatusOption]);
      }
    }

    if (typeFromUrl && selectedTypes.length === 0) {
      if (PRODUCT_TYPE_OPTIONS.includes(typeFromUrl as ProductTypeOption)) {
        setSelectedTypes([typeFromUrl as ProductTypeOption]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, products]);

  const filteredProducts = useMemo(() => {
    const q = (searchTerm ?? "").toLowerCase();

    return (products ?? []).filter((p) => {
      const name = (p.name ?? "").toLowerCase();
      const sku = (p.sku ?? "").toLowerCase();
      const cat = (p.category ?? (p as any).category_name ?? "");
      const status = (p.product_status ?? "") as string;
      const typeName = (p as any).product_type_name || (p as any).product_type || "";

      const matchesSearch = name.includes(q) || sku.includes(q);

      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(cat);

      const matchesStatus =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(status as StatusOption);

      const matchesType =
        selectedTypes.length === 0 ||
        selectedTypes.includes(typeName as ProductTypeOption);

      return matchesSearch && matchesCategory && matchesStatus && matchesType;
    });
  }, [products, searchTerm, selectedCategories, selectedStatuses, selectedTypes]);

  const handleCategoryChange = (categoryName: string, checked: boolean) => {
    setSelectedCategories((prev) =>
      checked ? Array.from(new Set([...prev, categoryName])) : prev.filter((c) => c !== categoryName)
    );
  };

  const handleStatusChange = (status: StatusOption, checked: boolean) => {
    setSelectedStatuses((prev) =>
      checked ? Array.from(new Set([...prev, status])) : prev.filter((s) => s !== status)
    );
  };

  const handleTypeChange = (typeName: ProductTypeOption, checked: boolean) => {
    setSelectedTypes((prev) =>
      checked ? Array.from(new Set([...prev, typeName])) : prev.filter((t) => t !== typeName)
    );
  };

  const clearCategorySelection = () => setSelectedCategories([]);
  const clearStatusSelection = () => setSelectedStatuses([]);
  const clearTypeSelection = () => setSelectedTypes([]);
  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setSelectedTypes([]);
    setSearchTerm("");
  };

  return {
    filteredProducts,
    searchTerm,
    selectedCategories,
    selectedStatuses,
    selectedTypes,
    setSearchTerm,
    handleCategoryChange,
    handleStatusChange,
    handleTypeChange,
    clearCategorySelection,
    clearStatusSelection,
    clearTypeSelection,
    clearAllFilters,
  };
};
