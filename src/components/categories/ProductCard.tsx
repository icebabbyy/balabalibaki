// วางโค้ด ProductCard ที่แก้ไขแล้วนี้เข้าไปแทนที่ของเดิมทั้งหมด
const ProductCard = ({ product }: { product: ProductPublic }) => {

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation(); // หยุดไม่ให้ event click ลามไปถึง div ครอบ
    addToCart(product);   // เรียกใช้ฟังก์ชัน addToCart ที่มีอยู่แล้ว
    navigate('/cart');      // แล้วพาไปหน้าตะกร้า
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // หยุดไม่ให้ event click ลามไปถึง div ครอบ
    addToCart(product);   // เรียกใช้ฟังก์ชัน addToCart ที่มีอยู่แล้ว
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
      onClick={() => handleProductClick(product.id)}
    >
      <div className="relative">
        <img
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        {product.product_status && (
          <Badge className="absolute top-2 left-2">
            {product.product_status}
          </Badge>
        )}
      </div>
      <CardContent className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold mb-2 line-clamp-2 h-12">{product.name}</h3>
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-purple-600">
            ฿{product.selling_price?.toLocaleString()}
          </span>
        </div>
        
        {/* === ส่วนของปุ่มที่แก้ไขใหม่ทั้งหมด === */}
        <div className="space-y-2 mt-auto">
          <Button
            size="sm"
            className="w-full" // ใช้สไตล์ default (btn-gradient) จากโรงงานปุ่ม
            onClick={handleBuyNow}
          >
            <CreditCard className="h-4 w-4" />
            ซื้อเดี๋ยวนี้
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            เพิ่มลงตะกร้า
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
