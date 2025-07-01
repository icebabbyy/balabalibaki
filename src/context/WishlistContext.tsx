// src/context/WishlistContext.tsx

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ProductPublic } from '@/types/product';

interface WishlistContextType {
  wishlistItems: ProductPublic[];
  loading: boolean;
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (product: ProductPublic) => Promise<void>;
  refetchWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<ProductPublic[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*, products(*)')
        .eq('user_id', user.id);
      if (error) throw error;
      const mappedProducts = (data || []).filter(item => item.products).map(item => item.products as ProductPublic);
      setWishlistItems(mappedProducts);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = (productId: number) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const toggleWishlist = async (product: ProductPublic) => {
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบเพื่อใช้งานรายการโปรด');
      return;
    }

    const isCurrentlyInWishlist = isInWishlist(product.id);
    try {
      if (isCurrentlyInWishlist) {
        await supabase.from('wishlist_items').delete().match({ user_id: user.id, product_id: product.id });
        setWishlistItems(prev => prev.filter(item => item.id !== product.id));
        toast.success(`ลบ "${product.name}" ออกจากรายการโปรด`);
      } else {
        await supabase.from('wishlist_items').insert({ user_id: user.id, product_id: product.id });
        setWishlistItems(prev => [...prev, product]);
        toast.success(`เพิ่ม "${product.name}" ในรายการโปรด`);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  return (
    <WishlistContext.Provider value={{ loading, wishlistItems, toggleWishlist, isInWishlist, refetchWishlist: fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};