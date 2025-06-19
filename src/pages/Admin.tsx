
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import PhotoCopyPaste from "@/components/PhotoCopyPaste";
import { Textarea } from "@/components/ui/textarea";
import OrderManagement from "@/components/OrderManagement";
import BatchImageUploadManager from "@/components/BatchImageUploadManager";

interface Product {
  id: number;
  created_at: string;
  name: string;
  selling_price: number;
  cost_thb: number;
  category: string;
  description: string;
  image: string;
  status: string;
  sku: string;
  options: any;
}

const Admin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState("พร้อมขาย");
  const [sku, setSku] = useState("");
  const [options, setOptions] = useState<any>({});
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionValues, setNewOptionValues] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า");
      } else {
        // Map the data to match our Product interface
        const mappedProducts = (data || []).map(item => ({
          id: item.id,
          created_at: item.created_at || '',
          name: item.name,
          selling_price: item.selling_price,
          cost_thb: item.cost_thb,
          category: item.category,
          description: item.description || '',
          image: item.image,
          status: item.status || 'พร้อมขาย',
          sku: item.sku,
          options: item.options || {}
        }));
        setProducts(mappedProducts);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setProductName(product.name);
    setSellingPrice(product.selling_price.toString());
    setCostPrice(product.cost_thb.toString());
    setCategory(product.category);
    setDescription(product.description);
    setImage(product.image);
    setStatus(product.status);
    setSku(product.sku);
    setOptions(product.options || {});
  };

  const handleInputChange = (
    setState: (value: string) => void
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(e.target.value);
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(e.target.value);
  };

  const handleImageChange = (imageUrl: string) => {
    setImage(imageUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) {
      toast.error("กรุณาเลือกสินค้า");
      return;
    }

    try {
      // Validate required fields
      if (!productName || !sellingPrice || !costPrice || !category || !sku) {
        toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
      }

      // Convert price inputs to numbers
      const sellingPriceNum = parseFloat(sellingPrice);
      const costPriceNum = parseFloat(costPrice);

      if (isNaN(sellingPriceNum) || isNaN(costPriceNum)) {
        toast.error("ราคาสินค้าไม่ถูกต้อง");
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .update({
          name: productName,
          selling_price: sellingPriceNum,
          cost_thb: costPriceNum,
          category: category,
          description: description,
          image: image,
          status: status,
          sku: sku,
          options: options,
        })
        .eq("id", selectedProduct.id);

      if (error) {
        console.error("Error updating product:", error);
        toast.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูลสินค้า");
      } else {
        toast.success("แก้ไขข้อมูลสินค้าสำเร็จ");
        fetchProducts();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) {
      toast.error("กรุณาเลือกสินค้า");
      return;
    }

    if (window.confirm("คุณต้องการลบสินค้านี้หรือไม่?")) {
      try {
        const { error } = await supabase
          .from("products")
          .delete()
          .eq("id", selectedProduct.id);

        if (error) {
          console.error("Error deleting product:", error);
          toast.error("เกิดข้อผิดพลาดในการลบสินค้า");
        } else {
          toast.success("ลบสินค้าสำเร็จ");
          setSelectedProduct(null);
          setProductName("");
          setSellingPrice("");
          setCostPrice("");
          setCategory("");
          setDescription("");
          setImage("");
          setStatus("พร้อมขาย");
          setSku("");
          setOptions({});
          fetchProducts();
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("เกิดข้อผิดพลาด");
      }
    }
  };

  const handleAddOption = () => {
    if (!newOptionName || !newOptionValues) {
      toast.error("กรุณากรอกข้อมูลตัวเลือกสินค้าให้ครบถ้วน");
      return;
    }

    const valuesArray = newOptionValues.split(",").map((v) => v.trim());
    setOptions((prevOptions: any) => ({
      ...prevOptions,
      [newOptionName]: valuesArray,
    }));
    setNewOptionName("");
    setNewOptionValues("");
    setIsAddingOption(false);
  };

  const handleDeleteOption = (optionName: string) => {
    const { [optionName]: deletedKey, ...restOptions } = options;
    setOptions(restOptions);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-purple-600 font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Product List */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>รายการสินค้า</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {products.length === 0 ? (
                <div className="text-center py-4">ไม่มีสินค้า</div>
              ) : (
                <div className="space-y-2">
                  {products.map((product) => (
                    <Button
                      key={product.id}
                      variant={
                        selectedProduct?.id === product.id ? "secondary" : "outline"
                      }
                      className="w-full justify-start"
                      onClick={() => handleProductSelect(product)}
                    >
                      {product.name}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Product Details Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedProduct ? "แก้ไขสินค้า" : "เลือกสินค้าเพื่อแก้ไข"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedProduct ? (
                <>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="productName">ชื่อสินค้า</Label>
                      <Input
                        type="text"
                        id="productName"
                        value={productName}
                        onChange={handleInputChange(setProductName)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sellingPrice">ราคาขาย</Label>
                        <Input
                          type="number"
                          id="sellingPrice"
                          value={sellingPrice}
                          onChange={handleInputChange(setSellingPrice)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="costPrice">ราคาต้นทุน</Label>
                        <Input
                          type="number"
                          id="costPrice"
                          value={costPrice}
                          onChange={handleInputChange(setCostPrice)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="category">หมวดหมู่</Label>
                      <Input
                        type="text"
                        id="category"
                        value={category}
                        onChange={handleInputChange(setCategory)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        type="text"
                        id="sku"
                        value={sku}
                        onChange={handleInputChange(setSku)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">สถานะ</Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="พร้อมขาย">พร้อมขาย</SelectItem>
                          <SelectItem value="สินค้าหมด">สินค้าหมด</SelectItem>
                          <SelectItem value="พรีออเดอร์">พรีออเดอร์</SelectItem>
                          <SelectItem value="ซ่อน">ซ่อน</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="image">รูปภาพ</Label>
                      <PhotoCopyPaste
                        currentImage={image}
                        onImageChange={handleImageChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">รายละเอียดสินค้า</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={handleDescriptionChange}
                        rows={4}
                      />
                    </div>

                    {/* Product Options */}
                    <div>
                      <div className="flex items-center justify-between">
                        <Label>ตัวเลือกสินค้า</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsAddingOption(true)}
                        >
                          เพิ่มตัวเลือก
                        </Button>
                      </div>

                      {isAddingOption && (
                        <div className="mt-2 space-y-2">
                          <Input
                            type="text"
                            placeholder="ชื่อตัวเลือก (เช่น สี)"
                            value={newOptionName}
                            onChange={(e) => setNewOptionName(e.target.value)}
                          />
                          <Input
                            type="text"
                            placeholder="ค่าตัวเลือก (เช่น แดง, น้ำเงิน, เขียว)"
                            value={newOptionValues}
                            onChange={(e) => setNewOptionValues(e.target.value)}
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleAddOption}
                            style={{ backgroundColor: "#956ec3" }}
                            className="text-white"
                          >
                            บันทึกตัวเลือก
                          </Button>
                        </div>
                      )}

                      {Object.keys(options).length > 0 && (
                        <div className="mt-4">
                          {Object.entries(options).map(([optionName, optionValues]) => (
                            <div
                              key={optionName}
                              className="flex items-center justify-between py-2 border-b"
                            >
                              <div>
                                <strong>{optionName}:</strong>{" "}
                                {Array.isArray(optionValues)
                                  ? optionValues.join(", ")
                                  : String(optionValues)}
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteOption(optionName)}
                              >
                                ลบ
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                      >
                        ลบสินค้า
                      </Button>
                      <Button type="submit" style={{ backgroundColor: "#956ec3" }} className="text-white">
                        บันทึกการเปลี่ยนแปลง
                      </Button>
                    </div>
                  </form>

                  {/* Product Image Manager */}
                  <div className="mt-6">
                    <BatchImageUploadManager productId={selectedProduct.id} />
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>กรุณาเลือกสินค้าจากรายการด้านซ้ายเพื่อแก้ไข</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
