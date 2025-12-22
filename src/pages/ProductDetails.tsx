import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { getProductById, formatPrice, products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { Star, Heart, Share2, Truck, Shield, RefreshCw, Minus, Plus, ShoppingCart } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { Badge } from "@/components/ui/badge";

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const product = getProductById(productId || "");

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </Layout>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Mock multiple images
  const images = [
    product.image,
    product.image.replace("w=600", "w=601"),
    product.image.replace("w=600", "w=602"),
    product.image.replace("w=600", "w=603"),
  ];

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <a href="/" className="hover:text-primary">Home</a>
          <span className="mx-2">/</span>
          <a href={`/categories/${product.category}`} className="hover:text-primary capitalize">
            {product.category.replace("-", " ")}
          </a>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Product Section */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="flex gap-4">
            {/* Thumbnails */}
            <div className="flex flex-col gap-3">
              {images.map((img, index) => (
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

            {/* Main image */}
            <div className="flex-1 relative rounded-2xl overflow-hidden bg-muted group">
              <img
                src={images[selectedImage]}
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
              
              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating)
                          ? "fill-primary text-primary"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium">{product.rating}</span>
                <span className="text-muted-foreground">({product.reviews} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <Badge variant="secondary">{discount}% off</Badge>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground">{product.description}</p>

            {/* Colors */}
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
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
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
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="hero"
                size="lg"
                className="flex-1"
                onClick={() => addToCart(product, quantity)}
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

            {/* Features */}
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

        {/* Specifications */}
        <section className="mt-12 md:mt-16">
          <h2 className="text-2xl font-bold mb-6">Specifications</h2>
          <div className="bg-muted/30 rounded-2xl p-6">
            <table className="w-full">
              <tbody className="divide-y divide-border">
                {[
                  ["Material", "Solid Wood & Premium Fabric"],
                  ["Dimensions", '180cm x 90cm x 85cm (L x W x H)'],
                  ["Weight", "45 kg"],
                  ["Color Options", product.colors?.length + " colors available"],
                  ["Warranty", "2 Years"],
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

        {/* Reviews */}
        <section className="mt-12 md:mt-16">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Summary */}
            <div className="bg-muted/30 rounded-2xl p-6">
              <div className="text-center mb-6">
                <p className="text-5xl font-bold text-primary">{product.rating}</p>
                <div className="flex justify-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? "fill-primary text-primary"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Based on {product.reviews} reviews
                </p>
              </div>

              {/* Rating bars */}
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2 mb-2">
                  <span className="text-sm w-3">{star}</span>
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${star === 5 ? 70 : star === 4 ? 20 : 10}%` }}
                    />
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full mt-6">
                Write a Review
              </Button>
            </div>

            {/* Reviews list */}
            <div className="md:col-span-2 space-y-4">
              {[
                {
                  name: "Priya S.",
                  rating: 5,
                  date: "2 weeks ago",
                  comment: "Absolutely love this furniture! The quality exceeded my expectations. Delivery was quick and the assembly was easy.",
                },
                {
                  name: "Rahul M.",
                  rating: 4,
                  date: "1 month ago",
                  comment: "Great value for money. The color matches exactly what was shown in the pictures. Very comfortable and sturdy.",
                },
                {
                  name: "Anita K.",
                  rating: 5,
                  date: "2 months ago",
                  comment: "Perfect addition to our living room. The craftsmanship is excellent and it looks even better in person!",
                },
              ].map((review, index) => (
                <div key={index} className="bg-card p-6 rounded-2xl border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="font-semibold text-primary">
                          {review.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{review.name}</p>
                        <p className="text-xs text-muted-foreground">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-primary text-primary"
                              : "fill-muted text-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12 md:mt-16">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetails;
