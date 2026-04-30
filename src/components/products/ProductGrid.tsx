import { Product } from "@/types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

export const ProductGrid = ({ products, title, subtitle }: ProductGridProps) => {
  if (!products || products.length === 0) {
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

        <p className="text-center text-muted-foreground">
          No products found.
        </p>
      </section>
    );
  }

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
        {products.map((product, index) => {
          const productId = (product as any)._id || product.id || index;

          return (
            <div
              key={productId}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProductCard product={product} />
            </div>
          );
        })}
      </div>
    </section>
  );
};