import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useMemo, useState } from "react";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Product } from "@/types";

const API_PRODUCTS = "https://api.jsgallor.com/api/affordable";
const API_ADMIN = "https://api.jsgallor.com/api/admin";

type ApiProduct = {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  category: string;
  subcategory?: string;
  image?: string;
  availability?: string;
  quantity?: number;
  color?: string;
};

type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  segment?: "all" | "affordable" | "midrange" | "luxury";
  parentId: string | null;
  status?: "active" | "hidden" | "disabled";
  showOnWebsite?: boolean;
  productCount?: number;
  order?: number;
};

const norm = (s?: string) => String(s || "").trim().toLowerCase();

export default function CategoriesPage() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const subSlug = searchParams.get("sub") || "";
  const showAll = (searchParams.get("tier") || "").toLowerCase() === "all";

  // UI filters
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [inStockOnly, setInStockOnly] = useState(false);

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCatLoading(true);
        setCatError("");

        const urls = [
          `${API_ADMIN}/categories?segment=all&status=active&level=all&sort=order&limit=200`,
          `${API_ADMIN}/categories?segment=affordable&status=active&level=all&sort=order&limit=200`,
        ];

        const [r1, r2] = await Promise.all(urls.map((u) => fetch(u)));
        if (!r1.ok || !r2.ok) throw new Error("Failed to fetch categories");

        const j1 = await r1.json().catch(() => ({}));
        const j2 = await r2.json().catch(() => ({}));

        const a1: ApiCategory[] = Array.isArray(j1) ? j1 : j1?.data?.items || [];
        const a2: ApiCategory[] = Array.isArray(j2) ? j2 : j2?.data?.items || [];

        const map = new Map<string, ApiCategory>();
        [...a1, ...a2].forEach((c) => {
          if (!c?.slug) return;
          const prev = map.get(c.slug);
          if (!prev) return map.set(c.slug, c);
          if (norm(prev.segment) === "all" && norm(c.segment) === "affordable") {
            map.set(c.slug, c);
          }
        });

        let merged = Array.from(map.values());
        merged = merged.filter((c) => {
          if (c.status && c.status !== "active") return false;
          if (typeof c.showOnWebsite === "boolean" && !c.showOnWebsite) return false;
          const seg = norm(c.segment);
          return seg === "all" || seg === "affordable";
        });
        merged.sort((a, b) => {
          const ao = Number(a.order ?? 0);
          const bo = Number(b.order ?? 0);
          if (ao !== bo) return ao - bo;
          return String(a.name || "").localeCompare(String(b.name || ""));
        });

        setCategories(merged);
      } catch (e: any) {
        setCatError(e?.message || "Failed to load categories");
        setCategories([]);
      } finally {
        setCatLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const parents = useMemo(() => categories.filter((c) => !c.parentId), [categories]);
  const selectedParent = useMemo(() => {
    if (!categoryId) return null;
    return parents.find((p) => p.slug === categoryId) || null;
  }, [categoryId, parents]);

  const childrenOfParent = useMemo(() => {
    if (!selectedParent) return [];
    return categories.filter((c) => String(c.parentId) === String(selectedParent.id));
  }, [categories, selectedParent]);

  const safeSubSlug = useMemo(() => {
    if (!subSlug) return "";
    const ok = childrenOfParent.some((c) => c.slug === subSlug);
    return ok ? subSlug : "";
  }, [subSlug, childrenOfParent]);

  const selectedChild = useMemo(() => {
    if (!safeSubSlug) return null;
    return childrenOfParent.find((c) => c.slug === safeSubSlug) || null;
  }, [childrenOfParent, safeSubSlug]);

  // Fetch products with discount calculation
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const qs = new URLSearchParams();
        qs.set("tier", showAll ? "all" : "affordable");
        if (categoryId) qs.set("category", categoryId);
        if (safeSubSlug) qs.set("subcategory", safeSubSlug);

        const url = `${API_PRODUCTS}/products?${qs.toString()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch products");

        const data = await res.json().catch(() => ({}));
        const arr: ApiProduct[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
          ? data.products
          : [];

        const mapped: Product[] = arr.map((p) => {
          const qty = Number(p.quantity ?? 0);
          const avail = String(p.availability ?? "").toLowerCase();
          const price = Number(p.price) || 0;
          const discountPercent = Number(p.discount) || 0;

          // Calculate original price: price = original * (100 - discount)/100
          let originalPrice = price;
          if (discountPercent > 0) {
            originalPrice = Math.round(price * 100 / (100 - discountPercent));
          }

          return {
            _id: p._id,
            name: p.name,
            price,
            originalPrice,
            discountPercent,
            category: p.category,
            subcategory: p.subcategory,
            image: p.image,
            inStock: qty > 0 && avail !== "out of stock",
            color: p.color,
          } as Product;
        });

        setProducts(mapped);
      } catch (e: any) {
        setError(e?.message || "Something went wrong");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, safeSubSlug, showAll]);

  const minMaxPrice = useMemo(() => {
    const prices = products.map((p) => p.price);
    if (prices.length === 0) return [0, 100000];
    return [Math.min(...prices), Math.max(...prices)];
  }, [products]);

  useEffect(() => {
    if (products.length) {
      setPriceRange([minMaxPrice[0], minMaxPrice[1]]);
    }
  }, [minMaxPrice]);

  const availableColors = useMemo(() => {
    const colorSet = new Set<string>();
    products.forEach((p) => {
      if (p.color && typeof p.color === 'string') {
        const trimmed = p.color.trim();
        if (trimmed) colorSet.add(trimmed);
      }
    });
    return Array.from(colorSet).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      const matchesColor = !selectedColor || p.color === selectedColor;
      const matchesStock = !inStockOnly || p.inStock;
      return matchesSearch && matchesPrice && matchesColor && matchesStock;
    });
  }, [products, searchTerm, priceRange, selectedColor, inStockOnly]);

  const handleParentChange = (slug: string) => {
    if (!slug) {
      navigate(`/categories${showAll ? "?tier=all" : ""}`);
    } else {
      navigate(`/categories/${slug}${showAll ? "?tier=all" : ""}`);
    }
  };

  const handleSubChange = (slug: string) => {
    if (!slug) {
      navigate(`/categories/${categoryId}${showAll ? "?tier=all" : ""}`);
    } else {
      navigate(`/categories/${categoryId}?sub=${slug}${showAll ? "&tier=all" : ""}`);
    }
  };

  const pageTitle = useMemo(() => {
    if (selectedChild) return selectedChild.name;
    if (selectedParent) return selectedParent.name;
    return "All Products";
  }, [selectedParent, selectedChild]);

  const FilterContent = () => (
    <div className="space-y-6">
   

      <div>
        <h4 className="font-semibold mb-3">Category</h4>
        <select
          value={categoryId || ""}
          onChange={(e) => handleParentChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-input bg-background"
          disabled={catLoading}
        >
          <option value="">All Categories</option>
          {parents.map((p) => (
            <option key={p.id} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {selectedParent && (
        <div>
          <h4 className="font-semibold mb-3">Subcategory</h4>
          <select
            value={safeSubSlug || ""}
            onChange={(e) => handleSubChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background"
            disabled={childrenOfParent.length === 0}
          >
            <option value="">All {selectedParent.name}</option>
            {childrenOfParent.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Price Range
        </h4>
        <Slider
          value={priceRange}
          onValueChange={(val) => setPriceRange([val[0], val[1]] as [number, number])}
          min={minMaxPrice[0]}
          max={minMaxPrice[1]}
          step={100}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>₹{priceRange[0].toLocaleString()}</span>
          <span>₹{priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {availableColors.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Color</h4>
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background"
          >
            <option value="">All Colors</option>
            {availableColors.map((color) => (
              <option key={color} value={color}>
                {color.charAt(0).toUpperCase() + color.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <h4 className="font-semibold mb-3">Availability</h4>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={inStockOnly}
            onCheckedChange={(checked) => setInStockOnly(checked === true)}
          />
          <span className="text-sm">In Stock Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <nav className="text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link to={`/categories${showAll ? "?tier=all" : ""}`} className="hover:text-primary">
            Categories
          </Link>
          {selectedParent && (
            <>
              <span className="mx-2">/</span>
              <Link
                to={`/categories/${selectedParent.slug}${showAll ? "?tier=all" : ""}`}
                className="hover:text-primary"
              >
                {selectedParent.name}
              </Link>
            </>
          )}
          {selectedChild && (
            <>
              <span className="mx-2">/</span>
              <span className="text-foreground">{selectedChild.name}</span>
            </>
          )}
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{pageTitle}</h1>
            <p className="text-muted-foreground mt-1">
              {loading ? "Loading..." : `${filteredProducts.length} products found`}
            </p>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-8">
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-24 glass-card p-6">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </h3>
              <FilterContent />
            </div>
          </aside>

          <div className="flex-1">
            {error ? (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">{error}</p>
              </div>
            ) : loading ? (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">Loading products...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">No products found</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}