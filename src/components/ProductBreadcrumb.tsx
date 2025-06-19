
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProductBreadcrumbProps {
  category: string;
  productName: string;
}

const ProductBreadcrumb = ({ category, productName }: ProductBreadcrumbProps) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      <Link 
        to="/" 
        className="flex items-center hover:text-purple-600 transition-colors"
      >
        <Home className="h-4 w-4 mr-1" />
        หน้าแรก
      </Link>
      
      <ChevronRight className="h-4 w-4" />
      
      <Link 
        to={`/categories?category=${encodeURIComponent(category)}`}
        className="hover:text-purple-600 transition-colors"
      >
        {category}
      </Link>
      
      <ChevronRight className="h-4 w-4" />
      
      <span className="text-gray-900 font-medium">
        {productName.length > 30 ? `${productName.substring(0, 30)}...` : productName}
      </span>
    </nav>
  );
};

export default ProductBreadcrumb;
