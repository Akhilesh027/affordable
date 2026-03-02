import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from "lucide-react";
import { toast } from "sonner";

const API_BASE = "https://api.jsgallor.com";

type BackendProduct = {
  _id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;

  // ✅ from your backend
  quantity?: number;
  availability?: string; // "In Stock"
  color?: string; // "red" (single)
  status?: string;
  tier?: string;

  rating?: number;
  reviews?: number;
  tags?: string[];
};

type BackendCategory = {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
  image?: string;
};

type UiCategory = {
  id: string;
  name: string;
  image: string;
  count: number;
};

// ✅ This is the format your UI grid/cards expect
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

const fallbackCategoryImage = (slug: string) => {
  const map: Record<string, string> = {
    "living-room": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop",
    bedroom: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&h=600&fit=crop",
    dining: "https://images.unsplash.com/photo-1549497538-303791108f95?w=600&h=600&fit=crop",
    office: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=600&fit=crop",
    storage: "https://images.unsplash.com/photo-1582582429416-3d6a8c02b1f0?w=600&h=600&fit=crop",
    decor: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600&h=600&fit=crop",
  };
  return map[slug] || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&h=600&fit=crop";
};

const normalizeCategoryName = (slug: string) =>
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

// ✅ map backend product -> UI product (stock fix)
const mapProduct = (p: BackendProduct): UiProduct => {
  const qty = Number(p.quantity ?? 0);
  const availability = String(p.availability || "").toLowerCase();

  const inStock = qty > 0 || availability.includes("in stock");

  return {
    _id: p._id,
    id: p._id, // ✅ so old code using id still works
    name: p.name,
    category: (p.category || "other").toLowerCase(),
    price: Number(p.price || 0),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
    image: p.image,
    inStock,
    colors: p.color ? [p.color] : [], // ✅ convert single color -> array
    rating: Number(p.rating ?? 4.5),
    reviews: Number(p.reviews ?? 0),
    tags: p.tags ?? [],
  };
};

const Index = () => {
  const [productsRaw, setProductsRaw] = useState<BackendProduct[]>([]);
  const [categories, setCategories] = useState<UiCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    const res = await fetch(`${API_BASE}/api/affordable/products`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to fetch products");
    return (data?.products || data || []) as BackendProduct[];
  };

  const fetchCategories = async () => {
    const res = await fetch(`${API_BASE}/api/affordable/categories`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to fetch categories");
    return (data?.categories || data || []) as BackendCategory[];
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const prods = await fetchProducts();
        setProductsRaw(prods);

        // Optional categories endpoint (fallback to product categories)
        let catsFromBackend: BackendCategory[] = [];
        try {
          catsFromBackend = await fetchCategories();
        } catch {
          catsFromBackend = [];
        }

        const countMap = prods.reduce<Record<string, number>>((acc, p) => {
          const key = (p.category || "other").toLowerCase();
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

        let uiCats: UiCategory[] = [];

        if (catsFromBackend.length > 0) {
          uiCats = catsFromBackend.map((c) => {
            const slug = (c.slug || c.id || c._id || c.name || "").toString().toLowerCase();
            const id = slug || (c.name || "other").toLowerCase().replace(/\s+/g, "-");
            return {
              id,
              name: c.name || normalizeCategoryName(id),
              image: c.image || fallbackCategoryImage(id),
              count: countMap[id] || 0,
            };
          });

          Object.keys(countMap).forEach((slug) => {
            if (!uiCats.find((x) => x.id === slug)) {
              uiCats.push({
                id: slug,
                name: normalizeCategoryName(slug),
                image: fallbackCategoryImage(slug),
                count: countMap[slug] || 0,
              });
            }
          });
        } else {
          uiCats = Object.keys(countMap).map((slug) => ({
            id: slug,
            name: normalizeCategoryName(slug),
            image: fallbackCategoryImage(slug),
            count: countMap[slug] || 0,
          }));
        }

        uiCats = uiCats.filter((c) => c.count > 0).sort((a, b) => b.count - a.count);
        setCategories(uiCats.slice(0, 6));
      } catch (e: any) {
        toast.error(e?.message || "Failed to load home data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // ✅ Mapped UI products with stock info
  const products = useMemo(() => productsRaw.map(mapProduct), [productsRaw]);

  const featuredProducts = useMemo(() => {
    const tagged = products.filter((p) => p.tags.includes("featured") || p.tags.includes("bestseller"));
    if (tagged.length >= 8) return tagged.slice(0, 8);

    // ✅ if no tags, show only inStock products first
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
                ✨ New Collection 2024
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Design Your Dream
                <span className="text-gradient block">Living Space</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Discover premium furniture that combines elegance with comfort. Transform your home with our curated collection.
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
              <div className="relative rounded-3xl overflow-hidden shadow-strong">
                <img
                  src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop"
                  alt="Premium Sofa"
                  className="w-full h-[400px] md:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg animate-float">
                  <p className="text-sm text-muted-foreground">Starting from</p>
                  <p className="text-2xl font-bold text-foreground">₹12,999</p>
                </div>
              </div>

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
              { icon: Truck, title: "Free Delivery", desc: "On orders above ₹5000" },
              { icon: Shield, title: "2 Year Warranty", desc: "On all products" },
              { icon: RefreshCw, title: "Easy Returns", desc: "30-day return policy" },
              { icon: Headphones, title: "24/7 Support", desc: "Dedicated support" },
            ].map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-muted/50 transition-colors">
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
          <ProductGrid products={featuredProducts as any} title="Featured Products" subtitle="Handpicked favorites for your home" />
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
          <ProductGrid products={homeProducts as any} title="Our Collection" subtitle="Discover our complete range of furniture" />
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
                <h2 className="text-2xl md:text-3xl font-bold">Get 20% Off Your First Order</h2>
                <p className="text-background/80 mt-2">Sign up for our newsletter and enjoy exclusive discounts</p>
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
    </Layout>
  );
};

export default Index;
