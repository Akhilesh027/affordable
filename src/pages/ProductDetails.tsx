import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useEffect, useMemo, useState } from "react";
import {
  Heart,
  Share2,
  Truck,
  Shield,
  RefreshCw,
  Minus,
  Plus,
  ShoppingCart,
  Check,
} from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { Badge } from "@/components/ui/badge";

const API_BASE = "https://api.jsgallor.com/api/affordable";

type ApiProduct = {
  _id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  originalPrice?: number;
  quantity?: number;
  availability?: string;
  color?: string | string[];        // can be array now
  image: string;
  galleryImages?: string[];
  material?: string;
  weight?: string | number;
  size?: string | string[];          // can be array now
  tier?: string;
};

type UiProduct = {
  id: string;
  _id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  inStock: boolean;
  colors: string[];                  // array of hex strings
  sizes: string[];                    // array of size strings
  quantity: number;
  material: string;
  weight: string;
};

const mapApiProductToUi = (p: ApiProduct): UiProduct => {
  const qty = Number(p.quantity ?? 0);
  const availability = String(p.availability || "").toLowerCase();
  const inStock = qty > 0 && (availability.includes("in stock") || availability === "");

  const images =
    p.galleryImages && p.galleryImages.length > 0
      ? [p.image, ...p.galleryImages]
      : [p.image];

  // Normalize color to array
  let colors: string[] = [];
  if (Array.isArray(p.color)) {
    colors = p.color.filter(Boolean);
  } else if (typeof p.color === "string" && p.color) {
    colors = [p.color];
  }

  // Normalize size to array
  let sizes: string[] = [];
  if (Array.isArray(p.size)) {
    sizes = p.size.filter(Boolean);
  } else if (typeof p.size === "string" && p.size) {
    sizes = [p.size];
  }

  return {
    id: p._id,
    _id: p._id,
    name: p.name,
    category: p.category,
    description: p.description || "",
    price: Number(p.price) || 0,
    originalPrice: p.originalPrice,
    image: p.image,
    images,
    inStock,
    colors,
    sizes,
    quantity: qty,
    material: p.material || "—",
    weight: p.weight ? String(p.weight) : "—",
  };
};

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const [product, setProduct] = useState<UiProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<UiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE}/products/${productId}`);
        if (!res.ok) throw new Error("Product not found");

        const data: ApiProduct = await res.json();
        const uiProduct = mapApiProductToUi(data);
        setProduct(uiProduct);

        // Auto-select first available color and size
        if (uiProduct.colors.length > 0) setSelectedColor(uiProduct.colors[0]);
        if (uiProduct.sizes.length > 0) setSelectedSize(uiProduct.sizes[0]);
      } catch (e: any) {
        setError(e?.message || "Failed to load product");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    const fetchRelated = async () => {
      if (!product?._id || !product.category) return;

      try {
        const url = new URL(`${API_BASE}/products`);
        url.searchParams.set("tier", "affordable");
        url.searchParams.set("category", product.category);
        url.searchParams.set("limit", "4");
        url.searchParams.set("excludeId", product._id);

        const res = await fetch(url.toString());
        if (!res.ok) return;

        const data: ApiProduct[] = await res.json();
        setRelatedProducts(Array.isArray(data) ? data.map(mapApiProductToUi) : []);
      } catch {
        setRelatedProducts([]);
      }
    };

    fetchRelated();
  }, [product]);

  const discount = useMemo(() => {
    if (!product?.originalPrice) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }, [product]);

  const increaseQty = () => {
    if (!product?.inStock) return;
    setQuantity((prev) => {
      const maxQty = product.quantity > 0 ? product.quantity : prev + 1;
      return prev < maxQty ? prev + 1 : prev;
    });
  };

  const decreaseQty = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleAddToCart = () => {
    if (!product) return;
    // Pass selected options along with product
    addToCart({
      ...product,
      selectedColor,
      selectedSize,
    } as any, quantity);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 sm:py-16 text-center">
          <p className="text-base sm:text-lg text-muted-foreground">Loading product...</p>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 sm:py-16 text-center">
          <h1 className="text-xl sm:text-2xl font-bold mb-4">{error || "Product not found"}</h1>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="mb-5 sm:mb-6 flex flex-wrap items-center gap-y-1 text-xs sm:text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link
            to={`/categories/${product.category.toLowerCase().replace(/\s+/g, "-")}`}
            className="hover:text-primary capitalize"
          >
            {product.category}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground break-words">{product.name}</span>
        </nav>

        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? "border-primary shadow-glow"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 relative rounded-2xl overflow-hidden bg-muted group">
              <img
                src={product.images[selectedImage] || product.image}
                alt={product.name}
                className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105 cursor-zoom-in"
              />
              {discount > 0 && (
                <Badge className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-destructive text-destructive-foreground">
                  -{discount}% OFF
                </Badge>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-5 sm:space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                {product.name}
              </h1>
            </div>

            <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl font-bold text-foreground">
                {formatPrice(product.price)}
              </span>

              {product.originalPrice && (
                <>
                  <span className="text-base sm:text-xl text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <Badge variant="secondary">{discount}% off</Badge>
                </>
              )}
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-6 sm:leading-7">
              {product.description || "No description available."}
            </p>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-sm sm:text-base">
                  Color <span className="font-normal text-muted-foreground ml-2">(select one)</span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color)}
                      className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 transition-all ${
                        selectedColor === color
                          ? "border-primary ring-2 ring-primary/30 scale-110"
                          : "border-border hover:border-primary/50"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    >
                      {selectedColor === color && (
                        <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-md" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-sm sm:text-base">
                  Size <span className="font-normal text-muted-foreground ml-2">(select one)</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                        selectedSize === size
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50 text-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-semibold mb-3 text-sm sm:text-base">Quantity</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center border border-border rounded-xl w-fit">
                  <button
                    onClick={decreaseQty}
                    className="p-3 hover:bg-muted transition-colors rounded-l-xl"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <span className="w-12 text-center font-medium">{quantity}</span>

                  <button
                    onClick={increaseQty}
                    className="p-3 hover:bg-muted transition-colors rounded-r-xl disabled:opacity-50"
                    disabled={!product.inStock || quantity >= product.quantity}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <span className="text-sm text-muted-foreground">
                  {product.inStock ? `In Stock (${product.quantity})` : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* Add to Cart & Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="hero"
                size="lg"
                className="flex-1 w-full"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>

              <div className="grid grid-cols-2 sm:flex gap-3">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-4 pt-6 border-t border-border">
              {[
                { icon: Truck, label: "Free Delivery" },
                { icon: Shield, label: "2 Year Warranty" },
                { icon: RefreshCw, label: "Easy Returns" },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="text-center rounded-xl bg-muted/30 p-3 sm:p-0 sm:bg-transparent"
                >
                  <div className="w-10 h-10 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Specifications */}
        <section className="mt-12 md:mt-16">
          <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">Specifications</h2>

          <div className="bg-muted/30 rounded-2xl p-4 sm:p-6 overflow-x-auto">
            <table className="w-full min-w-[520px] sm:min-w-full">
              <tbody className="divide-y divide-border">
                {[
                  ["Material", product.material || "—"],
                  ["Available Sizes", product.sizes?.join(", ") || "—"],
                  ["Weight", product.weight || "—"],
                  ["Available Colors", product.colors?.length ? `${product.colors.length} color(s)` : "—"],
                  ["Availability", product.inStock ? "In Stock" : "Out of Stock"],
                ].map(([label, value], index) => (
                  <tr key={index}>
                    <td className="py-3 pr-4 font-medium text-foreground w-[40%] sm:w-1/3">
                      {label}
                    </td>
                    <td className="py-3 text-muted-foreground break-words">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12 md:mt-16">
            <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p as any} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetails;