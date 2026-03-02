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
} from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { Badge } from "@/components/ui/badge";

const API_BASE = "https://api.jsgallor.com/api/affordable";

type ApiProduct = {
  _id: string;
  name: string;
  category: string; // "living-room"
  description?: string;
  price: number;
  originalPrice?: number;
  quantity?: number;
  availability?: string;
  color?: string;
  image: string;
  galleryImages?: string[];

  // ✅ add from backend
  material?: string;
  weight?: string | number;
  size?: string;
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
  colors: string[];
  quantity: number;

  // ✅ add for UI
  material: string;
  weight: string;
  size: string;
};

const mapApiProductToUi = (p: ApiProduct): UiProduct => {
  const qty = Number(p.quantity ?? 0);

  // ✅ Stock logic (more reliable)
  const availability = String(p.availability || "").toLowerCase();
  const inStock = qty > 0 && (availability.includes("in stock") || availability === "");

  const images =
    p.galleryImages && p.galleryImages.length > 0
      ? [p.image, ...p.galleryImages]
      : [p.image];

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
    colors: p.color ? [p.color] : [],
    quantity: qty,

    // ✅ map new fields
    material: p.material || "—",
    weight: p.weight ? String(p.weight) : "—",
    size: p.size || "—",
  };
};

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const [product, setProduct] = useState<UiProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<UiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Fetch product by id
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE}/products/${productId}`);
        if (!res.ok) throw new Error("Product not found");

        const data: ApiProduct = await res.json();
        setProduct(mapApiProductToUi(data));
      } catch (e: any) {
        setError(e?.message || "Failed to load product");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // ✅ Fetch related products
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

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-lg text-muted-foreground">Loading product...</p>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">{error || "Product not found"}</h1>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
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
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Product Section */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-3">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
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

            <div className="flex-1 relative rounded-2xl overflow-hidden bg-muted group">
              <img
                src={product.images[selectedImage] || product.image}
                alt={product.name}
                className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110 cursor-zoom-in"
              />
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
                  -{discount}% OFF
                </Badge>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{product.name}</h1>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">{formatPrice(product.price)}</span>

              {product.originalPrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <Badge variant="secondary">{discount}% off</Badge>
                </>
              )}
            </div>

            <p className="text-muted-foreground">
              {product.description || "No description available."}
            </p>

            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Color</h3>
                <div className="flex gap-2">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-xl border-2 transition-all ${
                        selectedColor === color
                          ? "border-primary ring-2 ring-primary/30 scale-110"
                          : "border-border hover:border-primary/50"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-muted transition-colors rounded-l-xl"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-muted transition-colors rounded-r-xl"
                    disabled={!product.inStock}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <span className="text-sm text-muted-foreground">
                  {product.inStock ? `In Stock (${product.quantity})` : "Out of Stock"}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="hero"
                size="lg"
                className="flex-1"
                onClick={() => addToCart(product as any, quantity)}
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              {[
                { icon: Truck, label: "Free Delivery" },
                { icon: Shield, label: "2 Year Warranty" },
                { icon: RefreshCw, label: "Easy Returns" },
              ].map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ✅ Specifications (UPDATED) */}
        <section className="mt-12 md:mt-16">
          <h2 className="text-2xl font-bold mb-6">Specifications</h2>
          <div className="bg-muted/30 rounded-2xl p-6">
            <table className="w-full">
              <tbody className="divide-y divide-border">
                {[
                  ["Material", product.material || "—"],
                  ["Size", product.size || "—"],
                  ["Weight", product.weight ? `${product.weight}` : "—"],
                  ["Color Options", `${product.colors?.length || 0} color available`],
                  ["Availability", product.inStock ? "In Stock" : "Out of Stock"],
                ].map(([label, value], index) => (
                  <tr key={index}>
                    <td className="py-3 font-medium text-foreground w-1/3">{label}</td>
                    <td className="py-3 text-muted-foreground">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12 md:mt-16">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
