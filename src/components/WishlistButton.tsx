
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface WishlistButtonProps {
  productId: number;
  productSku: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const WishlistButton = ({ productId, productSku, className = "", size = "md" }: WishlistButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkWishlistStatus();
    }
  }, [user, productSku]);

  const checkWishlistStatus = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("wishlist")
        .eq("id", user.id)
        .single();

      if (profile?.wishlist) {
        const wishlistItems = profile.wishlist.split(",").filter(Boolean);
        setIsInWishlist(wishlistItems.includes(productSku));
      }
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบเพื่อใช้งานรายการโปรด");
      navigate("/auth");
      return;
    }

    setLoading(true);

    try {
      // Get current wishlist
      const { data: profile } = await supabase
        .from("profiles")
        .select("wishlist")
        .eq("id", user.id)
        .single();

      let currentWishlist = profile?.wishlist ? profile.wishlist.split(",").filter(Boolean) : [];

      if (isInWishlist) {
        // Remove from wishlist
        currentWishlist = currentWishlist.filter(sku => sku !== productSku);
        toast.success("ลบออกจากรายการโปรดแล้ว");
      } else {
        // Add to wishlist
        currentWishlist.push(productSku);
        toast.success("เพิ่มในรายการโปรดแล้ว");
      }

      // Update database
      await supabase
        .from("profiles")
        .update({ wishlist: currentWishlist.join(",") })
        .eq("id", user.id);

      setIsInWishlist(!isInWishlist);
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("เกิดข้อผิดพลาดในการอัพเดตรายการโปรด");
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className={`${sizeClasses[size]} ${className} ${
        isInWishlist 
          ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" 
          : "bg-white/80 backdrop-blur-sm hover:bg-white"
      } transition-all duration-200`}
      onClick={toggleWishlist}
      disabled={loading}
    >
      <Heart 
        className={`${isInWishlist ? "fill-current" : ""} transition-all duration-200`}
        size={iconSizes[size]}
      />
    </Button>
  );
};

export default WishlistButton;
