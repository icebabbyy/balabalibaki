// src/pages/ProductDetailPage.tsx (เวอร์ชันสำหรับดีบัก)

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Package, Calendar, CreditCard, Clock, Heart, Tag } from "lucide-react";
import { toast } from "sonner";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductVariantSelector from "@/components/ProductVariantSelector";
import ProductBreadcrumb from "@/components/ProductBreadcrumb";
import RichTextEditor from "@/components/RichTextEditor";

const ProductDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<any>(null);
    const [images, setImages] = useState<any[]>([]);
    const [tags, setTags] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState("");
    const [variantImage, setVariantImage] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [user, setUser] = useState<any>(null);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(true);

    // --- 1. Fetch Product Data when slug changes ---
    useEffect(() => {
        if (slug) {
            fetchProductBySlug(slug);
        }
        
        // Check user session
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setIsWishlistLoading(false);
        };
        checkUser();

    }, [slug]);

    // --- 2. When product data is loaded, fetch its related data (images, tags) ---
    useEffect(() => {
        if (product?.id) {
            console.log('✨ CHECKPOINT 1: Product state updated! Product ID is:', product.id);
            fetchProductImages(product.id);
            fetchProductTags(product.id);
            if (user) {
                checkWishlistStatus(user.id, product.id);
            }
        }
    }, [product, user]);


    // --- Functions to fetch data ---

    const fetchProductBySlug = async (productSlug: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('slug', productSlug)
                .single();
            if (error) throw error;
            setProduct(data);
        } catch (error) {
            console.error('Error fetching product by slug:', error);
            toast.error('ไม่พบสินค้าที่ต้องการ');
            navigate('/404'); // Navigate to a proper not-found page
        } finally {
            setLoading(false);
        }
    };

    const fetchProductImages = async (productId: number) => {
        try {
            const { data, error } = await supabase
                .from('product_images')
                .select('*')
                .eq('product_id', productId)
                .order('order', { ascending: true });
            if (error) throw error;
            setImages(data || []);
        } catch (error) {
            console.error('Error fetching product images:', error);
        }
    };

    const fetchProductTags = async (productId: number) => {
        try {
            const { data, error } = await supabase
                .from('product_tags')
                .select('tags(id, name)') // Fetch related tag info
                .eq('product_id', productId);
            if (error) throw error;
            
            const processedTags = data?.map(item => item.tags).filter(Boolean) || [];
            console.log('✨ CHECKPOINT 2: Fetched and processed tags:', processedTags);
            setTags(processedTags);
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const checkWishlistStatus = async (userId: string, productId: number) => {
        // ... (โค้ดเดิม)
    };

    const toggleWishlist = async () => {
        // ... (โค้ดเดิม)
    };

    const handleTagClick = (tagName: string) => {
        navigate(`/products?tag=${encodeURIComponent(tagName)}`);
    };

    // (ฟังก์ชัน addToCart และ buyNow เหมือนเดิม)
    const addToCart = () => {/* ... โค้ดเดิม ... */};
    const buyNow = () => {/* ... โค้ดเดิม ... */};
    
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'พรีออเดอร์': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'พร้อมส่ง': return 'bg-green-100 text-green-800 border-green-200';
            case 'สินค้าหมด': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) {
        // ... (ส่วน Loading)
        return <div>Loading...</div>;
    }

    if (!product) {
        // ... (ส่วน Not Found)
        return <div>Product not found</div>;
    }

    const additionalImageUrls = images.map(img => img.image_url).filter(url => url !== product.image);

    // --- ส่วน JSX ที่จะแสดงผล ---
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-8">
                {console.log('✨ CHECKPOINT 3: Rendering component. Current tags state:', tags)}
                <div className="max-w-6xl mx-auto">
                    {/* ... (ProductBreadcrumb, Back Button) ... */}
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* ... (ProductImageGallery) ... */}
                        
                        <div className="space-y-6">
                            {/* ... (Product Name, Wishlist Button) ... */}
                            
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Package className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-600">หมวดหมู่:</span>
                                    <span className="font-medium text-purple-600">{product.category}</span>
                                </div>
                                
                                <div className="bg-white rounded-lg border p-4 space-y-3">
                                    {/* 1. SKU */}
                                    <div className="flex items-center space-x-2">
                                        <Package className="h-4 w-4 text-purple-500" />
                                        <span className="text-sm font-medium text-gray-700">SKU:</span>
                                        <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-mono text-sm">{product.sku}</Badge>
                                    </div>
                                    
                                    {/* 2. สถานะสินค้า */}
                                    <div className="flex items-center space-x-2 pt-3 border-t">
                                        {product.product_status === 'พรีออเดอร์' ? <Clock className="h-4 w-4 text-orange-500" /> : <Package className="h-4 w-4 text-green-500" />}
                                        <span className="text-sm font-medium text-gray-700">สถานะสินค้า:</span>
                                        <Badge className={`${getStatusColor(product.product_status)} font-medium`}>{product.product_status}</Badge>
                                    </div>

                                    {/* 3. กำหนดส่ง */}
                                    {product.shipment_date && (
                                        <div className="flex items-center space-x-2 pt-3 border-t">
                                            <Calendar className="h-4 w-4 text-blue-500" />
                                            <span className="text-sm font-medium text-gray-700">กำหนดส่ง:</span>
                                            <span className="text-sm text-blue-600 font-medium">{new Date(product.shipment_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                    )}

                                    {/* 4. Tags (ดึงข้อมูลจาก State `tags`) */}
                                    {tags && tags.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-2 pt-3 border-t">
                                            <Tag className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-700">Tags:</span>
                                            {tags.map((tag) => (
                                                <Badge
                                                    key={tag.id}
                                                    variant="outline"
                                                    className="cursor-pointer hover:bg-amber-100 border-amber-300 text-amber-800"
                                                    onClick={() => handleTagClick(tag.name)}
                                                >
                                                    #{tag.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {/* ... (Price, Options, Quantity, Buttons, Description) ... */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
