
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: number;
  name: string;
  image: string;
  display_on_homepage: boolean;
  homepage_order: number;
}

interface CategoryFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categories: Category[];
  selectedCategories: string[];
  onCategoryChange: (categoryName: string, checked: boolean) => void;
  onClearSelection: () => void;
}

const CategoryFilters = ({ 
  searchTerm, 
  onSearchChange, 
  categories, 
  selectedCategories, 
  onCategoryChange, 
  onClearSelection 
}: CategoryFiltersProps) => {
  return (
    <div className="mb-8">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="ค้นหาสินค้า..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Category Checkboxes */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">เลือกหมวดหมู่</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-3">
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.name)}
                onCheckedChange={(checked) => 
                  onCategoryChange(category.name, checked as boolean)
                }
              />
              <label 
                htmlFor={`category-${category.id}`}
                className="text-sm font-medium cursor-pointer"
              >
                {category.name}
              </label>
            </div>
          ))}
        </div>
        
        {selectedCategories.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                เลือกแล้ว: {selectedCategories.length} หมวดหมู่
              </span>
              <button
                onClick={onClearSelection}
                className="text-sm text-purple-600 hover:text-purple-800"
              >
                ล้างการเลือก
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedCategories.map((category) => (
                <Badge 
                  key={category} 
                  variant="secondary"
                  className="text-xs"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryFilters;
