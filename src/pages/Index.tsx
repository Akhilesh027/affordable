import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { PhoneNumberModal } from "@/components/layout/PhoneNumberModal";

const API_BASE = "https://api.jsgallor.com";

type BackendProduct = {
  _id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity?: number;
  availability?: string;
  color?: string;
  status?: string;
  tier?: string;
  rating?: number;
  reviews?: number;
  tags?: string[];
  createdAt?: string;
};

type BackendCategory = {
  id: string;
  name: string;
  slug: string;
  segment?: string;           // "all", "affordable", etc.
  imageUrl?: string;
  productCount?: number;
  parentId?: string | null;
  status?: string;
  // ... other fields
};

type UiCategory = {
  id: string;
  name: string;
  image: string;
  count: number;
};

type UiProduct = {
  _id: string;
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  inStock: boolean;
  colors: string[];
  rating: number;
  reviews: number;
  tags: string[];
};

const normalizeCategoryName = (slug: string) =>
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const mapProduct = (p: BackendProduct): UiProduct => {
  const qty = Number(p.quantity ?? 0);
  const availability = String(p.availability || "").toLowerCase();
  const inStock = qty > 0 || availability.includes("in stock");

  return {
    _id: p._id,
    id: p._id,
    name: p.name,
    category: (p.category || "other").toLowerCase(),
    price: Number(p.price || 0),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
    image: p.image,
    inStock,
    colors: p.color ? [p.color] : [],
    rating: Number(p.rating ?? 4.5),
    reviews: Number(p.reviews ?? 0),
    tags: p.tags ?? [],
  };
};

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [productsRaw, setProductsRaw] = useState<BackendProduct[]>([]);
  const [categories, setCategories] = useState<UiCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user && !user.phone && !sessionStorage.getItem("skipPhoneModal")) {
      setShowPhoneModal(true);
    }
  }, [isAuthenticated, user]);

  const fetchProducts = async () => {
    const res = await fetch(`${API_BASE}/api/affordable/products`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to fetch products");
    return (data?.products || data || []) as BackendProduct[];
  };

  const fetchCategories = async () => {
    const res = await fetch(`${API_BASE}/api/admin/categories`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to fetch categories");

    // Extract items array from the new response structure
    const categoriesData = data?.data?.items || data?.categories || data || [];
    return categoriesData as BackendCategory[];
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const prods = await fetchProducts();
        setProductsRaw(prods);

        let catsFromBackend: BackendCategory[] = [];
        try {
          catsFromBackend = await fetchCategories();
          console.log("Categories from backend:", catsFromBackend);
        } catch (error) {
          console.error("Failed to fetch categories:", error);
          catsFromBackend = [];
        }

        // Filter categories: only those with segment 'all' or 'affordable' and non-empty imageUrl
        const filteredCategories = catsFromBackend.filter(
          (cat) =>
            (cat.segment === "all" || cat.segment === "affordable") &&
            cat.imageUrl &&
            cat.imageUrl.trim() !== ""
        );

        // Build a map of product counts per category slug (from products)
        const countMap = prods.reduce<Record<string, number>>((acc, p) => {
          const key = (p.category || "other").toLowerCase();
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

        let uiCats: UiCategory[] = [];

        if (filteredCategories.length > 0) {
          uiCats = filteredCategories.map((c) => {
            const id = c.slug || c.id; // use slug as id
            return {
              id,
              name: c.name || normalizeCategoryName(id),
              image: c.imageUrl!,
              count: c.productCount || countMap[id] || 0,
            };
          });
        } else {
          // No suitable categories from backend – fallback to building from product categories
          // but note: we don't have images, so we might choose to show nothing.
          // For now, we'll show nothing (empty array).
          uiCats = [];
        }

        // Sort by product count (descending) and take top 6
        uiCats = uiCats.sort((a, b) => b.count - a.count).slice(0, 6);
        setCategories(uiCats);
      } catch (e: any) {
        console.error("Load error:", e);
        toast.error(e?.message || "Failed to load home data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const latestProduct = useMemo(() => {
    if (productsRaw.length === 0) return null;
    const sorted = [...productsRaw].sort((a, b) => {
      const getTime = (p: BackendProduct) => {
        if (p.createdAt) return new Date(p.createdAt).getTime();
        const hexTimestamp = p._id.substring(0, 8);
        const timestamp = parseInt(hexTimestamp, 16) * 1000;
        return isNaN(timestamp) ? 0 : timestamp;
      };
      return getTime(b) - getTime(a);
    });
    return sorted[0];
  }, [productsRaw]);

  const latestProductUi = latestProduct ? mapProduct(latestProduct) : null;

  const products = useMemo(() => productsRaw.map(mapProduct), [productsRaw]);

  const featuredProducts = useMemo(() => {
    const tagged = products.filter((p) => p.tags.includes("featured") || p.tags.includes("bestseller"));
    if (tagged.length >= 8) return tagged.slice(0, 8);
    const sorted = [...products].sort((a, b) => {
      const stockScore = Number(b.inStock) - Number(a.inStock);
      if (stockScore !== 0) return stockScore;
      return Number(b.rating || 0) - Number(a.rating || 0);
    });
    return sorted.slice(0, 8);
  }, [products]);

  const homeProducts = useMemo(() => products.slice(0, 8), [products]);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-light to-background">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 animate-fade-up">
              <span className="inline-block px-4 py-1.5 bg-primary/20 text-primary-foreground rounded-full text-sm font-medium">
                ✨ New Collection 2026
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Design Your Dream
                <span className="text-gradient block">Living Space</span>
              </h1>
              <div className="inline-block px-5 py-2 bg-primary/10 text-primary rounded-lg font-semibold">
                🎉 Get 10% off on your first order
              </div>
              <p className="text-lg text-muted-foreground max-w-md">
                Discover premium furniture that combines elegance with comfort. Transform your home with our curated
                collection.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/categories">
                  <Button variant="hero" size="lg">
                    Shop Now
                    <ArrowRight className="h-5 w-5 ml-1" />
                  </Button>
                </Link>
                <Link to="/categories">
                  <Button variant="outline" size="lg">
                    Explore Collection
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <Link to={`/product/${latestProduct?._id}`}>
              <div className="relative rounded-3xl overflow-hidden shadow-strong">
                <img
                  src={
                    latestProductUi?.image ||
                    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop"
                  }
                  alt={latestProductUi?.name || "Premium Furniture"}
                  className="w-full h-[400px] md:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg animate-float">
                  {latestProductUi ? (
                    <>
                      <p className="text-sm text-muted-foreground">Now only</p>
                      <p className="text-2xl font-bold text-foreground">₹{latestProductUi.price.toLocaleString()}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">Starting from</p>
                      <p className="text-2xl font-bold text-foreground">₹12,999</p>
                    </>
                  )}
                </div>
              </div>
</Link>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: "Free Delivery", desc: "On all orders" },
              { icon: Shield, title: "5 Year Warranty", desc: "On all products" },
              { icon: RefreshCw, title: "Only Replacement", desc: "Replacement available for damaged items" },
              { icon: Headphones, title: "24/7 Support", desc: "Dedicated support" },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-muted/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Shop by Category</h2>
            <p className="text-muted-foreground mt-2">Browse our curated collections</p>
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground py-10">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              No categories available
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  to={`/categories/${category.id}`}
                  className="group relative rounded-2xl overflow-hidden aspect-square animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-semibold text-white">{category.name}</h3>
                    <p className="text-white/70 text-sm">{category.count} items</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <ProductGrid
            products={featuredProducts as any}
            title="Featured Products"
            subtitle="Handpicked favorites for your home"
          />
          <div className="text-center mt-8">
            <Link to="/categories">
              <Button variant="outline" size="lg">
                View All Products
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* All Products */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <ProductGrid
            products={homeProducts as any}
            title="Our Collection"
            subtitle="Discover our complete range of furniture"
          />
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-foreground to-foreground/90 text-background">
            <div className="absolute inset-0 opacity-20">
              <img
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&h=400&fit=crop"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Get 10% Off Your First Order</h2>
                <p className="text-background/80 mt-2">
                  Sign up for our newsletter and enjoy exclusive discounts
                </p>
              </div>
              <Link to="/signup">
                <Button variant="amber" size="lg">
                  Sign Up Now
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Phone Number Modal */}
      <PhoneNumberModal open={showPhoneModal} onOpenChange={setShowPhoneModal} />
    </Layout>
  );
};

export default Index;