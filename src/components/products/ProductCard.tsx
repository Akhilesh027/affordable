import { Link } from "react-router-dom";
import { Star, Heart, ShoppingCart, Loader2 } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, loading: wishlistLoading } = useWishlist();
  const [isToggling, setIsToggling] = useState(false);
  
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isWishlisted = isInWishlist(product._id);
  const isLoading = wishlistLoading || isToggling;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return; // prevent double clicks

    setIsToggling(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product);
      }
    } catch (err) {
      // Optionally show a toast notification
      console.error("Wishlist operation failed:", err);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-strong transition-all duration-300 hover:-translate-y-1">
      {/* Image container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Link to={`/product/${product._id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {discount > 0 && (
            <Badge className="bg-destructive text-destructive-foreground text-xs">
              -{discount}%
            </Badge>
          )}
          {product.tags?.includes("bestseller") && (
            <Badge className="bg-primary text-primary-foreground text-xs">
              Bestseller
            </Badge>
          )}
          {product.tags?.includes("new") && (
            <Badge variant="secondary" className="text-xs">
              New
            </Badge>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlistToggle}
          disabled={isLoading}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-primary hover:text-primary-foreground ${
            isWishlisted ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-100"
          } ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
          )}
        </button>

        {/* Quick add to cart */}
       
      </div>

      {/* Content */}
      <div className="p-4">
        <Link to={`/product/${product._id}`}>
          <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1">
          <Star className="h-4 w-4 fill-primary text-primary" />
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-xs text-muted-foreground">({product.reviews} reviews)</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-lg font-bold text-foreground">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Colors */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            {product.colors.slice(0, 4).map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: color }}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-xs text-muted-foreground">+{product.colors.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};