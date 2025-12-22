import { useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProductGrid } from "@/components/products/ProductGrid";
import { products, categories } from "@/data/products";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const colors = [
  { name: "Brown", value: "#8B7355" },
  { name: "Black", value: "#1C1C1C" },
  { name: "White", value: "#F5E6D3" },
  { name: "Grey", value: "#4A4A4A" },
  { name: "Green", value: "#4A6741" },
  { name: "Blue", value: "#2C3E50" },
];

const CategoriesPage = () => {
  const { categoryId } = useParams();
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);

  const category = categories.find((c) => c.id === categoryId);
  const categoryProducts = categoryId
    ? products.filter((p) => p.category === categoryId)
    : products;

  const filteredProducts = categoryProducts.filter((product) => {
    const inPriceRange = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesStock = !inStockOnly || product.inStock;
    const matchesColor =
      selectedColors.length === 0 ||
      product.colors?.some((c) => selectedColors.includes(c));
    return inPriceRange && matchesStock && matchesColor;
  });

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
          onValueChange={setPriceRange}
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

      {/* Categories - when viewing all */}
      {!categoryId && (
        <div>
          <h4 className="font-semibold mb-4">Categories</h4>
          <div className="space-y-2">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/categories/${cat.id}`}
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {cat.name} ({cat.count})
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <a href="/" className="hover:text-primary">Home</a>
          <span className="mx-2">/</span>
          <span className="text-foreground">{category?.name || "All Products"}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {category?.name || "All Products"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {filteredProducts.length} products found
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
            {filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">No products found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CategoriesPage;
