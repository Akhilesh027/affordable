import { Link } from "react-router-dom";
import { Product } from "@/types";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

export const ProductGrid = ({ products, title, subtitle }: ProductGridProps) => {
  return (
    <section className="py-12">
      {(title || subtitle) && (
        <div className="text-center mb-8">
          {title && (
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-muted-foreground mt-2">{subtitle}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product: any, index) => {
          const productId = product._id || product.id || index;

          const originalPrice = Number(product.price || 0);
          const discount = Number(product.discount || product.discountPercent || 0);
          const gst = Number(product.gst || 0);
          const priceIncludesGst = product.priceIncludesGst ?? true;

          const finalPrice =
            discount > 0
              ? Math.round(originalPrice * (1 - discount / 100))
              : originalPrice;

          return (
            <div
              key={productId}
              className="group overflow-hidden rounded-2xl bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-strong animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Link to={`/product/${productId}`}>
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={product.image || "/placeholder-image.jpg"}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {discount > 0 && (
                    <span className="absolute left-3 top-3 rounded-md bg-destructive px-2 py-1 text-xs font-bold text-destructive-foreground">
                      -{discount}%
                    </span>
                  )}
                </div>

                <div className="p-4">
                  {product.category && (
                    <p className="mb-1 text-xs capitalize text-muted-foreground">
                      {String(product.category).replace(/-/g, " ")}
                    </p>
                  )}

                  <h3 className="line-clamp-1 font-semibold text-foreground transition-colors group-hover:text-primary">
                    {product.name}
                  </h3>

                  <div className="mt-2 flex items-baseline gap-2">
                    {discount > 0 && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(originalPrice)}
                      </span>
                    )}

                    <span className="text-lg font-bold text-primary">
                      {formatPrice(finalPrice)}
                    </span>
                  </div>

                  {gst > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {priceIncludesGst
                        ? `Inclusive of ${gst}% GST`
                        : `+ ${gst}% GST`}
                    </p>
                  )}
                </div>
              </Link>

              
            </div>
          );
        })}
      </div>
    </section>
  );
};