import { useState, useEffect, createContext, useContext, ReactNode, useMemo } from 'react';
import { toast } from 'sonner';
import { ProductPublic } from '@/types/product';

interface CartItem extends ProductPublic {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: ProductPublic, quantity?: number) => void;
  updateQty: (productId: number, newQuantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  cartCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'cart';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Failed to load cart from storage", error);
      setCartItems([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    window.dispatchEvent(new Event('cartUpdated'));
  }, [cartItems]);

  const addToCart = (product: ProductPublic, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { ...product, quantity }];
    });
    toast.success(`เพิ่ม "${product.name}" ลงตะกร้าแล้ว`);
  };

  const updateQty = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.id === productId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const removeItem = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
    toast.success("ลบสินค้าออกจากตะกร้าแล้ว");
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);
  
  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.selling_price || 0) * item.quantity, 0);
  }, [cartItems]);

  const value = {
    cartItems,
    addToCart,
    updateQty,
    removeItem,
    clearCart,
    cartCount,
    totalPrice
  };
  
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
// Exporting CartItem type for use in other components
export type { CartItem };