// src/pages/CategoriesPage.tsx
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useMemo, useState } from "react";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const API_PRODUCTS = "https://api.jsgallor.com/api/affordable"; // products api (uses tier filter)
const API_ADMIN = "https://api.jsgallor.com/api/admin"; // categories api

const colors = [
  { name: "Brown", value: "#8B7355" },
  { name: "Black", value: "#1C1C1C" },
  { name: "White", value: "#F5E6D3" },
  { name: "Grey", value: "#4A4A4A" },
  { name: "Green", value: "#4A6741" },
  { name: "Blue", value: "#2C3E50" },
];

type ApiProduct = {
  _id: string;
  name: string;
  price: number;
  category: string; // slug
  subcategory?: string; // slug
  image?: string;
  availability?: string;
  quantity?: number;
  color?: string; // hex
};

type Product = {
  _id: string;
  name: string;
  price: number;
  category: string;
  subcategory?: string;
  inStock: boolean;
  colors?: string[];
  image?: string;
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
  const { categoryId } = useParams(); // /categories/:categoryId (category slug)
  const [searchParams] = useSearchParams();
  const subSlug = searchParams.get("sub") || ""; // /categories/:categoryId?sub=child-slug
  const showAll = (searchParams.get("tier") || "").toLowerCase() === "all"; // ✅ ?tier=all to show all tiers

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * ✅ Fetch categories:
   * - include segment=all and segment=affordable (only)
   * - filter: status=active + showOnWebsite (if present)
   */
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

        // merge unique by slug (keep affordable if duplicates)
        const map = new Map<string, ApiCategory>();
        [...a1, ...a2].forEach((c) => {
          if (!c?.slug) return;
          const prev = map.get(c.slug);
          // prefer affordable over all
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
          return seg === "all" || seg === "affordable"; // ✅ only allow these
        });

        // sort by order then name
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

  // ✅ if subSlug is invalid for this parent, ignore it
  const safeSubSlug = useMemo(() => {
    if (!subSlug) return "";
    const ok = childrenOfParent.some((c) => c.slug === subSlug);
    return ok ? subSlug : "";
  }, [subSlug, childrenOfParent]);

  const selectedChild = useMemo(() => {
    if (!safeSubSlug) return null;
    return childrenOfParent.find((c) => c.slug === safeSubSlug) || null;
  }, [childrenOfParent, safeSubSlug]);

  /**
   * ✅ Fetch products:
   * - uses your updated backend:
   *   /products?tier=all|affordable&category=...&subcategory=...
   */
useEffect(() => {
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const qs = new URLSearchParams();

      // ✅ tier logic
      qs.set("tier", showAll ? "all" : "affordable");

      // ✅ category: send whatever you have (id preferred)
      // categoryId can be ObjectId string, OR you can pass a slug string
      if (categoryId) qs.set("category", categoryId);

      // ✅ subcategory should not depend on categoryId
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
        return {
          _id: p._id,
          name: p.name,
          price: Number(p.price) || 0,
          category: p.category,
          subcategory: p.subcategory,
          image: p.image,
          inStock: avail === "in stock" && qty > 0,
          colors: p.color ? [p.color] : [],
        };
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

  // ✅ Apply UI filters
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const inPriceRange =
        product.price >= priceRange[0] && product.price <= priceRange[1];

      const matchesStock = !inStockOnly || product.inStock;

      const matchesColor =
        selectedColors.length === 0 ||
        product.colors?.some((c) => selectedColors.includes(c));

      return inPriceRange && matchesStock && matchesColor;
    });
  }, [products, priceRange, inStockOnly, selectedColors]);

  const pageTitle = useMemo(() => {
    if (selectedChild) return selectedChild.name;
    if (selectedParent) return selectedParent.name;
    return "All Products";
  }, [selectedParent, selectedChild]);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Price Range
        </h4>
        <Slider
          value={priceRange}
          onValueChange={(val) => setPriceRange([val[0], val[1]] as [number, number])}
          max={100000}
          step={1000}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>₹{priceRange[0].toLocaleString()}</span>
          <span>₹{priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Colors */}
      <div>
        <h4 className="font-semibold mb-4">Colors</h4>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() =>
                setSelectedColors((prev) =>
                  prev.includes(color.value)
                    ? prev.filter((c) => c !== color.value)
                    : [...prev, color.value]
                )
              }
              className={`w-8 h-8 rounded-lg border-2 transition-all ${
                selectedColors.includes(color.value)
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border hover:border-primary/50"
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h4 className="font-semibold mb-4">Availability</h4>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={inStockOnly}
            onCheckedChange={(checked) => setInStockOnly(checked === true)}
          />
          <span className="text-sm">In Stock Only</span>
        </label>
      </div>

      {/* ✅ Category Navigation */}
      <div>
        <h4 className="font-semibold mb-4">Categories</h4>

        {catLoading ? (
          <p className="text-sm text-muted-foreground">Loading categories...</p>
        ) : catError ? (
          <p className="text-sm text-red-500">{catError}</p>
        ) : (
          <div className="space-y-3">
            {/* Parents */}
            <div className="space-y-1">
              <Link
                to={`/categories${showAll ? "?tier=all" : ""}`}
                className={`block text-sm transition-colors ${
                  !categoryId ? "text-primary font-medium" : "text-muted-foreground hover:text-primary"
                }`}
              >
                All Products
              </Link>

              {parents.map((p) => {
                const active = p.slug === categoryId;
                return (
                  <Link
                    key={p.id}
                    to={`/categories/${p.slug}${showAll ? "?tier=all" : ""}`}
                    className={`block text-sm transition-colors ${
                      active ? "text-primary font-medium" : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {p.name}
                    {typeof p.productCount === "number" ? (
                      <span className="text-xs text-muted-foreground"> ({p.productCount})</span>
                    ) : null}
                  </Link>
                );
              })}
            </div>

            {/* Children */}
            {selectedParent ? (
              <div className="pt-2 border-t border-border/60">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                  {selectedParent.name} — Subcategories
                </div>

                {childrenOfParent.length ? (
                  <div className="space-y-1">
                    <Link
                      to={`/categories/${selectedParent.slug}${showAll ? "?tier=all" : ""}`}
                      className={`block text-sm transition-colors ${
                        !safeSubSlug
                          ? "text-primary font-medium"
                          : "text-muted-foreground hover:text-primary"
                      }`}
                    >
                      All in {selectedParent.name}
                    </Link>

                    {childrenOfParent.map((c) => {
                      const active = c.slug === safeSubSlug;

                      // keep tier param when switching subcategory
                      const subParams = new URLSearchParams();
                      subParams.set("sub", c.slug);
                      if (showAll) subParams.set("tier", "all");

                      return (
                        <Link
                          key={c.id}
                          to={`/categories/${selectedParent.slug}?${subParams.toString()}`}
                          className={`block text-sm transition-colors ${
                            active
                              ? "text-primary font-medium"
                              : "text-muted-foreground hover:text-primary"
                          }`}
                        >
                          {c.name}
                          {typeof c.productCount === "number" ? (
                            <span className="text-xs text-muted-foreground"> ({c.productCount})</span>
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No subcategories found.</p>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <span className="mx-2">/</span>

          <Link to={`/categories${showAll ? "?tier=all" : ""}`} className="hover:text-primary">
            Categories
          </Link>

          {selectedParent ? (
            <>
              <span className="mx-2">/</span>
              <Link
                to={`/categories/${selectedParent.slug}${showAll ? "?tier=all" : ""}`}
                className="hover:text-primary"
              >
                {selectedParent.name}
              </Link>
            </>
          ) : null}

          {selectedChild ? (
            <>
              <span className="mx-2">/</span>
              <span className="text-foreground">{selectedChild.name}</span>
            </>
          ) : null}
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{pageTitle}</h1>
            <p className="text-muted-foreground mt-1">
              {loading ? "Loading..." : `${filteredProducts.length} products found`}
            </p>
          </div>

          {/* Mobile filter button */}
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
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-24 glass-card p-6">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </h3>
              <FilterContent />
            </div>
          </aside>

          {/* Products */}
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
              <ProductGrid products={filteredProducts as any} />
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
