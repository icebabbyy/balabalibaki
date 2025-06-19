
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { toast } from "sonner";

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

interface Category {
  id: number;
  name: string;
  image: string;
  display_on_homepage: boolean;
  homepage_order: number;
}

const Categories = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('homepage_order', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // ใช้ public_products เพื่อความปลอดภัย - ไม่แสดงข้อมูลต้นทุน
      const { data, error } = await supabase
        .from('public_products')
        .select('id, name, selling_price, category, description, image, sku, status TEXT DEFAULT')
        .order('id', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า');
        return;
      }

      // แปลงข้อมูลให้ตรงกับ interface และปลอดภัย
      const safeProducts: Product[] = (data || []).map(item => ({
        id: item.id,
        name: item.name || '',
        selling_price: item.selling_price || 0,
        category: item.category || '',
        description: item.description || '',
        image: item.image || '',
        sku: item.sku || '',
        status: item['status TEXT DEFAULT'] || 'พรีออเดอร์'
      }));

      setProducts(safeProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-purple-600 font-medium">กำลังโหลดสินค้า...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">สินค้าทั้งหมด</h1>
        
        {/* Search and Filter */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="ค้นหาสินค้า..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="เลือกหมวดหมู่" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">ไม่พบสินค้าที่ตรงกับเงื่อนไขการค้นหา</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card 
                key={product.id}
                className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => handleProductClick(product.id)}
              >
                <CardContent className="p-0">
                  <div className="aspect-square relative overflow-hidden rounded-t-lg">
                    <img
                      src={product.image || '/placeholder.svg'}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <Badge 
                      className={`absolute top-2 left-2 text-white ${
                        product.status === 'พรีออเดอร์' 
                          ? 'bg-orange-500' 
                          : 'bg-green-500'
                      }`}
                    >
                      {product.status}
                    </Badge>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 h-12">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>
                    <p className="text-xl font-bold" style={{ color: '#956ec3' }}>
                      ฿{product.selling_price.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{product.category}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
