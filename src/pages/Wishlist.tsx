import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/context/WishlistContext";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/data/products";
import { useState } from "react";

const Wishlist = () => {
  const { wishlist, loading, error, removeFromWishlist } = useWishlist();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error("Failed to remove from wishlist", error);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Loading your wishlist...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </Layout>
    );
  }

  if (!wishlist.length) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="flex justify-center mb-6">
            <Heart className="h-24 w-24 text-muted-foreground/30" strokeWidth={1} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Your wishlist is empty</h1>
          <p className="text-muted-foreground mb-6">
            Save your favorite items here for easy access later.
          </p>
          <Button asChild>
            <Link to="/">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">My Wishlist</h1>
          <p className="text-sm text-muted-foreground">
            {wishlist.length} item{wishlist.length !== 1 && "s"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product) => {
            const isRemoving = removingId === product._id;
            const finalPrice = product.discount
              ? product.price * (1 - product.discount / 100)
              : product.price;

            return (
              <div
                key={product._id}
                className="group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-strong transition-all duration-300"
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Link to={`/product/${product._id}`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                </div>

                <div className="p-4">
                  <Link to={`/product/${product._id}`}>
                    <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-lg font-bold text-foreground">
                      {formatPrice(finalPrice)}
                    </span>
                    {product.discount > 0 && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(product._id)}
                      disabled={isRemoving}
                      className="w-full"
                      title="Remove from wishlist"
                    >
                      {isRemoving ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Wishlist;