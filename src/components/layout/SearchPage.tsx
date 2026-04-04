// src/pages/SearchPage.tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Search } from "lucide-react";

const API_AFFORDABLE = "https://api.jsgallor.com/api/affordable/products";
const API_MIDRANGE = "https://api.jsgallor.com/api/midrange/products";

type Product = {
  _id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  subcategory?: string;
  // optional dimensions if your API provides them
  height?: number;
  width?: number;
  depth?: number;
};

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }

    const fetchSearchResults = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch from both tiers (or use a unified search endpoint if available)
        const [affRes, midRes] = await Promise.all([
          fetch(`${API_AFFORDABLE}?search=${encodeURIComponent(query)}`),
          fetch(`${API_MIDRANGE}?search=${encodeURIComponent(query)}`),
        ]);

        const affData = await affRes.json().catch(() => ({}));
        const midData = await midRes.json().catch(() => ({}));

        const affProducts: Product[] = Array.isArray(affData) ? affData : affData?.products || [];
        const midProducts: Product[] = Array.isArray(midData) ? midData : midData?.products || [];

        const all = [...affProducts, ...midProducts];
        setProducts(all);
      } catch (err: any) {
        setError(err.message || "Failed to search products");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Search className="h-6 w-6" />
            Search Results
          </h1>
          <p className="text-muted-foreground mt-1">
            {loading ? "Searching..." : `Found ${products.length} products for "${query}"`}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">No products found for "{query}"</p>
            <p className="text-sm text-muted-foreground mt-2">Try a different search term</p>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </Layout>
  );
}