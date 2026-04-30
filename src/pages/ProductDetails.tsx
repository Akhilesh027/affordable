import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useEffect, useMemo, useState } from "react";
import {
  Heart,
  Share2,
  Minus,
  Plus,
  ShoppingCart,
  Check,
  Loader2,
} from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const API_BASE = "https://api.jsgallor.com/api/affordable";

type ApiVariant = {
  _id?: string;
  attributes: {
    size?: string;
    color?: string;
    fabric?: string;
  };
  sku: string;
  price: number;
  quantity: number;
  lowStockThreshold: number;
  image?: string;
};

type ApiProduct = {
  _id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  discount?: number;
  gst?: number;
  priceIncludesGst?: boolean;
  isCustomized?: boolean;
  originalPrice?: number;
  quantity?: number;
  availability?: string;
  color?: string | string[];
  image: string;
  galleryImages?: string[];
  material?: string;
  weight?: string | number;
  size?: string | string[];
  tier?: string;
  fabricTypes?: string[];
  extraPillows?: number;
  hasVariants?: boolean;
  variants?: ApiVariant[];
};

type UiProduct = {
  id: string;
  _id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  discount: number;
  gst: number;
  priceIncludesGst: boolean;
  isCustomized: boolean;
  finalPrice: number;
  originalPrice: number;
  image: string;
  images: string[];
  inStock: boolean;
  colors: string[];
  sizes: string[];
  fabrics: string[];
  quantity: number;
  material: string;
  weight: string;
  extraPillows?: number;
  hasVariants: boolean;
  variants?: ApiVariant[];
};

const mapApiProductToUi = (p: ApiProduct): UiProduct => {
  const images =
    p.galleryImages && p.galleryImages.length > 0
      ? [p.image, ...p.galleryImages]
      : [p.image];

  let colors: string[] = [];
  if (Array.isArray(p.color)) colors = p.color.filter(Boolean);
  else if (typeof p.color === "string" && p.color) colors = [p.color];

  let sizes: string[] = [];
  if (Array.isArray(p.size)) sizes = p.size.filter(Boolean);
  else if (typeof p.size === "string" && p.size) sizes = [p.size];

  let fabrics: string[] = [];
  if (Array.isArray(p.fabricTypes)) fabrics = p.fabricTypes.filter(Boolean);

  const hasVariants =
    Boolean(p.hasVariants) && Array.isArray(p.variants) && p.variants.length > 0;

  const totalQty = hasVariants
    ? p.variants!.reduce((sum, v) => sum + Number(v.quantity || 0), 0)
    : Number(p.quantity ?? 0);

  const availability = String(p.availability || "").toLowerCase();
  const inStock = totalQty > 0 && (availability.includes("in stock") || availability === "");

  const originalPrice = Number(p.price || 0);
  const discount = Number(p.discount || 0);
  const finalPrice =
    discount > 0 ? Math.round(originalPrice * (1 - discount / 100)) : originalPrice;

  return {
    id: p._id,
    _id: p._id,
    name: p.name,
    category: p.category,
    description: p.description || "",
    price: originalPrice,
    discount,
    gst: Number(p.gst || 0),
    priceIncludesGst: p.priceIncludesGst ?? true,
    isCustomized: p.isCustomized ?? false,
    finalPrice,
    originalPrice,
    image: p.image,
    images,
    inStock,
    colors,
    sizes,
    fabrics,
    quantity: totalQty,
    material: p.material || "—",
    weight: p.weight ? String(p.weight) : "—",
    extraPillows: p.extraPillows,
    hasVariants,
    variants: p.variants,
  };
};

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    loading: wishlistLoading,
  } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<string | null>(null);

  const [product, setProduct] = useState<UiProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<UiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

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

        if (uiProduct.hasVariants && uiProduct.variants) {
          const firstVariant = uiProduct.variants[0];
          if (firstVariant) {
            setSelectedColor(firstVariant.attributes.color || null);
            setSelectedSize(firstVariant.attributes.size || null);
            setSelectedFabric(firstVariant.attributes.fabric || null);
          }
        } else {
          if (uiProduct.colors.length > 0) setSelectedColor(uiProduct.colors[0]);
          if (uiProduct.sizes.length > 0) setSelectedSize(uiProduct.sizes[0]);
          if (uiProduct.fabrics.length > 0) setSelectedFabric(uiProduct.fabrics[0]);
        }
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

  const selectedVariant = useMemo(() => {
    if (!product?.hasVariants || !product.variants) return null;

    return (
      product.variants.find((v) => {
        const colorMatch = !selectedColor || v.attributes.color === selectedColor;
        const sizeMatch = !selectedSize || v.attributes.size === selectedSize;
        const fabricMatch = !selectedFabric || v.attributes.fabric === selectedFabric;
        return colorMatch && sizeMatch && fabricMatch;
      }) || null
    );
  }, [product, selectedColor, selectedSize, selectedFabric]);

  const originalPrice = useMemo(() => {
    if (selectedVariant) return Number(selectedVariant.price || 0);
    return product?.price || 0;
  }, [product, selectedVariant]);

  const discount = product?.discount ?? 0;
  const displayPrice =
    discount > 0 ? Math.round(originalPrice * (1 - discount / 100)) : originalPrice;

  const gstAmount = useMemo(() => {
    const gst = Number(product?.gst || 0);
    if (!gst || !displayPrice) return 0;

    if (product?.priceIncludesGst ?? true) {
      return displayPrice - displayPrice / (1 + gst / 100);
    }

    return displayPrice * (gst / 100);
  }, [displayPrice, product]);

  const taxableValue = useMemo(() => {
    if (!product?.gst) return displayPrice;

    if (product.priceIncludesGst ?? true) {
      return displayPrice - gstAmount;
    }

    return displayPrice;
  }, [displayPrice, gstAmount, product]);

  const displayStock = useMemo(() => {
    if (selectedVariant) return selectedVariant.quantity;
    return product?.quantity || 0;
  }, [product, selectedVariant]);

  const inStock = displayStock > 0;

  const displayImage = useMemo(() => {
    if (selectedVariant?.image) return selectedVariant.image;
    if (product?.images && product.images.length > 0) {
      return product.images[selectedImage] || product.image;
    }
    return product?.image || "";
  }, [product, selectedVariant, selectedImage]);

  const discountPercent = Math.round(discount);

  const availableColors = useMemo(() => {
    if (!product?.hasVariants || !product.variants) return product?.colors || [];
    const colors = new Set<string>();
    product.variants.forEach((v) => {
      if (v.attributes.color) colors.add(v.attributes.color);
    });
    return Array.from(colors);
  }, [product]);

  const availableSizes = useMemo(() => {
    if (!product?.hasVariants || !product.variants) return product?.sizes || [];
    const sizes = new Set<string>();
    product.variants.forEach((v) => {
      if (v.attributes.size) sizes.add(v.attributes.size);
    });
    return Array.from(sizes);
  }, [product]);

  const availableFabrics = useMemo(() => {
    if (!product?.hasVariants || !product.variants) return product?.fabrics || [];
    const fabrics = new Set<string>();
    product.variants.forEach((v) => {
      if (v.attributes.fabric) fabrics.add(v.attributes.fabric);
    });
    return Array.from(fabrics);
  }, [product]);

  const increaseQty = () => {
    if (!inStock) return;
    setQuantity((prev) => (prev < displayStock ? prev + 1 : prev));
  };

  const decreaseQty = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleAddToCart = () => {
    if (!product) return;

    const attributes: { size?: string; color?: string; fabric?: string } = {};
    if (selectedSize) attributes.size = selectedSize;
    if (selectedColor) attributes.color = selectedColor;
    if (selectedFabric) attributes.fabric = selectedFabric;

    const cartProduct = {
      ...product,
      price: displayPrice,
      originalPrice,
      discountPercent: discount,
      gst: product.gst,
      priceIncludesGst: product.priceIncludesGst,
      isCustomized: product.isCustomized,
    };

    addToCart(cartProduct, quantity, selectedVariant || undefined, attributes);
  };

  const isWishlisted = product ? isInWishlist(product._id) : false;
  const isWishlistLoading = wishlistLoading || isTogglingWishlist;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product || isWishlistLoading) return;

    setIsTogglingWishlist(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product as any);
      }
    } catch (err) {
      console.error("Wishlist toggle failed:", err);
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = product?.name || "Check out this product";
    const text = product?.description || "Amazing product from JSGALLOR";

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          toast.error("Sharing failed", { description: err.message });
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      } catch {
        toast.error("Failed to copy link");
      }
    }
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
          <h1 className="text-xl sm:text-2xl font-bold mb-4">
            {error || "Product not found"}
          </h1>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </Layout>
    );
  }

  const isMeaningful = (value: string | number | undefined | null): boolean => {
    if (value === undefined || value === null) return false;
    if (typeof value === "string") {
      const trimmed = value.trim();
      return !(trimmed === "" || trimmed === "—" || trimmed === "-");
    }
    if (typeof value === "number") return value !== 0 && !isNaN(value);
    return true;
  };

  const allSpecs = [
    { label: "Material", value: product.material },
    { label: "Available Sizes", value: product.sizes?.length ? product.sizes.join(", ") : null },
    { label: "Available Colors", value: product.colors?.length ? `${product.colors.length} color(s)` : null },
    { label: "Available Fabrics", value: product.fabrics?.length ? product.fabrics.join(", ") : null },
    { label: "Weight", value: product.weight },
    { label: "Availability", value: product.inStock ? "In Stock" : "Out of Stock" },
    { label: "GST", value: product.gst ? `${product.gst}% ${product.priceIncludesGst ? "Included" : "Excluded"}` : null },
    { label: "Customizable", value: product.isCustomized ? "Yes" : null },
  ];

  const visibleSpecs = allSpecs.filter((spec) => isMeaningful(spec.value));

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <nav className="mb-5 sm:mb-6 flex flex-wrap items-center gap-y-1 text-xs sm:text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="flex flex-col-reverse sm:flex-row gap-4">
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === index ? "border-primary" : "border-border hover:border-primary/50"
                  }`}
                >
                  <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <div className="flex-1 relative rounded-2xl overflow-hidden group">
              <img
                src={displayImage}
                alt={product.name}
                className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105 cursor-zoom-in"
              />
              {discount > 0 && (
                <Badge className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-destructive text-destructive-foreground">
                  -{discountPercent}% OFF
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-5 sm:space-y-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              {product.name}
            </h1>

            <div>
              <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
                {discount > 0 && (
                  <span className="text-base sm:text-xl text-muted-foreground line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}

                <span className="text-2xl sm:text-3xl font-bold text-foreground">
                  {formatPrice(displayPrice)}
                </span>

                {discount > 0 && <Badge variant="secondary">{discountPercent}% off</Badge>}
              </div>

              {product.gst > 0 && (
                <div className="mt-2 text-xs sm:text-sm text-muted-foreground space-y-1">
                  <p>
                    {product.priceIncludesGst
                      ? `Inclusive of ${product.gst}% GST`
                      : `Exclusive of ${product.gst}% GST`}
                  </p>
                  <p>
                    Taxable Value: {formatPrice(taxableValue)} | GST: {formatPrice(gstAmount)}
                  </p>
                </div>
              )}
            </div>

            <div className="text-sm sm:text-base text-muted-foreground leading-6 sm:leading-7 whitespace-pre-wrap">
              {product.description || "No description available."}
            </div>

            {availableColors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-sm sm:text-base">
                  Color <span className="font-normal text-muted-foreground ml-2">(select one)</span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {availableColors.map((color, index) => (
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

            {availableSizes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-sm sm:text-base">
                  Size <span className="font-normal text-muted-foreground ml-2">(select one)</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size, index) => (
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

            {availableFabrics.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-sm sm:text-base">
                  Fabric <span className="font-normal text-muted-foreground ml-2">(select one)</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availableFabrics.map((fabric, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedFabric(fabric)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all capitalize ${
                        selectedFabric === fabric
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50 text-foreground"
                      }`}
                    >
                      {fabric}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-3 text-sm sm:text-base">Quantity</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center border border-border rounded-xl w-fit">
                  <button onClick={decreaseQty} className="p-3 hover:bg-muted transition-colors rounded-l-xl">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={increaseQty}
                    className="p-3 hover:bg-muted transition-colors rounded-r-xl disabled:opacity-50"
                    disabled={!inStock || quantity >= displayStock}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {inStock ? `In Stock (${displayStock})` : "Out of Stock"}
                </span>
              </div>
            </div>

            {product.isCustomized && (
              <div className="pt-1">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10"
                  onClick={() => {
                    const message = `Hi, I'm interested in customizing this product:%0A%0A*Name:* ${encodeURIComponent(product.name)}%0A*ID:* ${product._id}%0A%0ACan you please share customization options?`;
                    window.open(`https://wa.me/917075848516?text=${message}`, "_blank");
                  }}
                >
                  ✨ Customize This Product
                </Button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="hero"
                size="lg"
                className="flex-1 w-full"
                onClick={handleAddToCart}
                disabled={!inStock || (product.hasVariants && !selectedVariant)}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>

              <div className="grid grid-cols-2 sm:flex gap-3">
                <Button variant="outline" size="lg" onClick={handleWishlistToggle} disabled={isWishlistLoading}>
                  {isWishlistLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current text-primary" : ""}`} />
                  )}
                </Button>

                <Button variant="outline" size="lg" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {visibleSpecs.length > 0 && (
          <section className="mt-12 md:mt-16">
            <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">Specifications</h2>
            <div className="bg-muted/30 rounded-2xl p-4 sm:p-6 overflow-x-auto">
              <table className="w-full min-w-[520px] sm:min-w-full">
                <tbody className="divide-y divide-border">
                  {visibleSpecs.map(({ label, value }, index) => (
                    <tr key={index}>
                      <td className="py-3 pr-4 font-medium text-foreground w-[40%] sm:w-1/3">
                        {label}
                      </td>
                      <td className="py-3 text-muted-foreground break-words">
                        {typeof value === "string" ? value : String(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

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