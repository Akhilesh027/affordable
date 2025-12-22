import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Button } from "@/components/ui/button";
import { categories, products, getFeaturedProducts } from "@/data/products";
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from "lucide-react";

const Index = () => {
  const featuredProducts = getFeaturedProducts();

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
                <Link to="/categories/living-room">
                  <Button variant="hero" size="lg">
                    Shop Now
                    <ArrowRight className="h-5 w-5 ml-1" />
                  </Button>
                </Link>
                <Link to="/categories/living-room">
                  <Button variant="outline" size="lg">
                    Explore Collection
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <div className="relative rounded-3xl overflow-hidden shadow-strong">
                <img
                  src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop"
                  alt="Premium Sofa"
                  className="w-full h-[400px] md:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                
                {/* Floating price tag */}
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg animate-float">
                  <p className="text-sm text-muted-foreground">Starting from</p>
                  <p className="text-2xl font-bold text-foreground">₹12,999</p>
                </div>
              </div>

              {/* Decorative elements */}
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
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <ProductGrid
            products={featuredProducts}
            title="Featured Products"
            subtitle="Handpicked favorites for your home"
          />
          <div className="text-center mt-8">
            <Link to="/categories/living-room">
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
            products={products.slice(0, 8)}
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
