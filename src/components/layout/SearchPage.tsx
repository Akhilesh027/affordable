import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProductGrid } from "@/components/products/ProductGrid";

const API_AFFORDABLE = "https://api.jsgallor.com/api/affordable/products";
const API_MIDRANGE = "https://api.jsgallor.com/api/midrange/products";

type Product = {
  _id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  subcategory?: string;
  height?: number;
  width?: number;
  depth?: number;
};

// Helper for client-side filtering
const matchesSearch = (product: Product, query: string): boolean => {
  const q = query.toLowerCase().trim();
  return (
    product.name.toLowerCase().includes(q) ||
    product.category.toLowerCase().includes(q) ||
    (product.subcategory && product.subcategory.toLowerCase().includes(q))
  );
};

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all products (used for client-side fallback)
  const fetchAllProducts = async (): Promise<Product[]> => {
    try {
      const [affRes, midRes] = await Promise.all([
        fetch(API_AFFORDABLE),
        fetch(API_MIDRANGE),
      ]);
      const affData = await affRes.json().catch(() => ({}));
      const midData = await midRes.json().catch(() => ({}));
      const affProducts: Product[] = Array.isArray(affData) ? affData : affData?.products || [];
      const midProducts: Product[] = Array.isArray(midData) ? midData : midData?.products || [];
      return [...affProducts, ...midProducts];
    } catch (err) {
      console.error("Failed to fetch products", err);
      return [];
    }
  };

  // Perform search
  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setFilteredProducts([]);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      setError("");

      try {
        // Try backend search with ?search= parameter
        const [affRes, midRes] = await Promise.all([
          fetch(`${API_AFFORDABLE}?search=${encodeURIComponent(query)}`),
          fetch(`${API_MIDRANGE}?search=${encodeURIComponent(query)}`),
        ]);

        const affData = await affRes.json().catch(() => ({}));
        const midData = await midRes.json().catch(() => ({}));
        let affProducts: Product[] = Array.isArray(affData) ? affData : affData?.products || [];
        let midProducts: Product[] = Array.isArray(midData) ? midData : midData?.products || [];

        // Heuristic: if the API returned a very large number of items, assume it ignored the search param
        if (affProducts.length > 50 || midProducts.length > 50) {
          const allProducts = await fetchAllProducts();
          const filtered = allProducts.filter(p => matchesSearch(p, query));
          setProducts(filtered);
          setFilteredProducts(filtered);
        } else {
          const combined = [...affProducts, ...midProducts];
          setProducts(combined);
          setFilteredProducts(combined);
        }
      } catch (err: any) {
        console.warn("Backend search failed, falling back to client-side", err);
        const allProducts = await fetchAllProducts();
        const filtered = allProducts.filter(p => matchesSearch(p, query));
        setProducts(filtered);
        setFilteredProducts(filtered);
        if (filtered.length === 0 && allProducts.length > 0) {
          setError("Backend search unavailable – showing client‑side results");
        } else if (allProducts.length === 0) {
          setError("Could not load products. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Result count header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Search Results</h1>
          <p className="text-muted-foreground">
            {loading
              ? "Searching..."
              : query
              ? `Found ${filteredProducts.length} result${filteredProducts.length !== 1 ? "s" : ""} for "${query}"`
              : "Enter a search term in the navbar"}
          </p>
        </div>

        {error && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-xl" />
            ))}
          </div>
        )}

        {!loading && query && filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">No products found for "{query}"</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try a different search term or browse our categories
            </p>
          </div>
        )}

        {!loading && filteredProducts.length > 0 && (
          <ProductGrid products={filteredProducts} />
        )}
      </div>
    </Layout>
  );
}