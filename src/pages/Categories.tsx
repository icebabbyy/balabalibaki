
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, ArrowLeft, Search } from "lucide-react";
import { toast } from "sonner";

const Categories = () => {
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category');
  const filter = searchParams.get('filter');
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(new Set(selectedCategory ? [selectedCategory] : []));
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*');

      // Fetch products
      let query = supabase.from('public_products').select('*');

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      if (filter === 'new') {
        query = query.order('id', { ascending: false }).limit(20);
      } else if (filter === 'bestseller') {
        query = query.limit(20);
      }

      const { data: productsData } = await query;

      setCategories(categoriesData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (categoryName, checked) => {
    const newSelected = new Set(selectedCategories);
    if (checked) {
      newSelected.add(categoryName);
    } else {
      newSelected.delete(categoryName);
    }
    setSelectedCategories(newSelected);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = showAll || selectedCategories.size === 0 || selectedCategories.has(product.category);
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-purple-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-purple-700">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">หมวดหมู่สินค้า</h1>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">ค้นหาและกรอง</h3>
              
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="ค้นหาสินค้า..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Show All Option */}
              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-all"
                    checked={showAll}
                    onCheckedChange={setShowAll}
                  />
                  <label
                    htmlFor="show-all"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-purple-600"
                  >
                    ดูทั้งหมด
                  </label>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="font-medium mb-3">หมวดหมู่</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedCategories.has(category.name)}
                        onCheckedChange={(checked) => handleCategoryToggle(category.name, checked)}
                        disabled={showAll}
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${showAll ? 'text-gray-400' : ''}`}
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedCategory ? selectedCategory : filter === 'new' ? 'สินค้ามาใหม่' : filter === 'bestseller' ? 'สินค้าขายดี' : 'สินค้าทั้งหมด'}
              </h2>
              <p className="text-gray-600">พบสินค้า {filteredProducts.length} รายการ</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-purple-300">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Link to={`/product/${product.id}`}>
                      <img
                        src={product.image || '/placeholder.svg'}
                        alt={product.name}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    {product.status && (
                      <span className="absolute top-2 left-2 bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium">
                        {product.status}
                      </span>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <Link to={`/product/${product.id}`}>
                      <h4 className="font-medium text-gray-800 mb-2 text-sm line-clamp-2 group-hover:text-purple-600 transition-colors">
                        {product.name}
                      </h4>
                    </Link>
                    <p className="text-lg font-bold text-purple-600 mb-3">
                      ฿{product.selling_price?.toLocaleString()}
                    </p>
                    
                    <div className="space-y-2">
                      <Link to={`/product/${product.id}`}>
                        <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                          ซื้อเดี๋ยวนี้
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="w-full border-purple-300 text-purple-600 hover:bg-purple-50">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        เพิ่มลงตะกร้า
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">ไม่พบสินค้าที่คุณต้องการ</p>
                <p className="text-gray-400">ลองเปลี่ยนคำค้นหาหรือหมวดหมู่</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
