import React, { useState, useEffect } from "react";
import { Star, CheckCircle, Quote, MessageSquare, ArrowRight, ShieldCheck, Truck, ThumbsUp, MapPin, Sparkles } from "lucide-react";

export interface FurnitureReview {
  id: string;
  clientName: string;
  locality: string;
  city: string;
  furnitureBought: string;
  category: string;
  rating: number;
  deliveryDate: string;
  quote: string;
  avatar: string;
}

const ESSENTIAL_TESTIMONIALS: FurnitureReview[] = [
  {
    id: "ft-1",
    clientName: "Rahul & Sneha Sharma",
    locality: "Kondapur, Hyderabad",
    city: "Hyderabad",
    furnitureBought: "Urban 3-Seater Fabric Sofa & Solid Wood Coffee Table",
    category: "Living Room",
    rating: 5,
    deliveryDate: "Delivered in 4 Days",
    quote: "We were looking for durable yet affordable furniture for our 2BHK flat. The sofa cushioning and fabric quality completely exceeded our expectations. Solid wood frame at this price point is unbelievable!",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "ft-2",
    clientName: "Venkatesh Rao",
    locality: "Whitefield, Bangalore",
    city: "Bangalore",
    furnitureBought: "Compact 4-Seater Sheesham Dining Set",
    category: "Dining Room",
    rating: 5,
    deliveryDate: "Delivered in 3 Days",
    quote: "The finish on the Sheesham wood dining table is top notch. Delivery team assembled everything in under 20 minutes with zero hassle. Very sturdy and fits our dining nook perfectly.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "ft-3",
    clientName: "Ananya Deshmukh",
    locality: "Miyapur, Hyderabad",
    city: "Hyderabad",
    furnitureBought: "Queen Hydraulic Storage Bed with Headboard",
    category: "Bedroom Suite",
    rating: 5,
    deliveryDate: "Delivered in 5 Days",
    quote: "The hydraulic lift mechanism is very smooth and makes using under-bed storage effortless. The wooden finish matches our wardrobe seamlessly. Best value-for-money furniture in Hyderabad.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "ft-4",
    clientName: "Karthik & Priya Nair",
    locality: "HSR Layout, Bangalore",
    city: "Bangalore",
    furnitureBought: "Minimalist TV Unit & Study Desk Combo",
    category: "Work & Living",
    rating: 5,
    deliveryDate: "Delivered in 3 Days",
    quote: "Ordered the study desk and floating TV entertainment unit. Cable management is well planned and the engineered wood has clean edge banding. Highly recommended for young professionals!",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  },
];

export const FurnitureTestimonials: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Auto-scroll through testimonials every 5.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % ESSENTIAL_TESTIMONIALS.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const activeReview = ESSENTIAL_TESTIMONIALS[activeIndex] || ESSENTIAL_TESTIMONIALS[0];

  return (
    <section
      id="customer-reviews"
      className="py-16 md:py-24 bg-card/40 border-y border-border relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 pb-6 border-b border-border gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified Furniture Buyers</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground tracking-tight">
              Real Homes. <span className="text-primary">Happy Customers.</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Discover why thousands of homeowners trust JS GALLOR Essential Studio for compact, functional, and durable furniture.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-4 self-start lg:self-end">
            <div className="text-right">
              <div className="text-xl font-bold text-foreground">4.9 / 5.0</div>
              <div className="text-[11px] text-muted-foreground">Over 1,200+ Verified Orders</div>
            </div>
            <div className="flex gap-1 text-primary">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
          </div>
        </div>

        {/* Testimonial Spotlight & Ledger Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
          {/* Spotlight Card */}
          <div className="lg:col-span-7 p-6 sm:p-10 rounded-3xl bg-card border border-border hover:border-primary/40 shadow-lg flex flex-col justify-between relative overflow-hidden transition-all">
            <Quote className="absolute -top-4 -right-4 w-32 h-32 text-primary/5 pointer-events-none" />

            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>REVIEW 0{activeIndex + 1} OF 0{ESSENTIAL_TESTIMONIALS.length}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Verified Purchase</span>
                </div>
              </div>

              <blockquote className="text-lg sm:text-xl leading-relaxed text-foreground font-medium mb-6 italic">
                "{activeReview.quote}"
              </blockquote>
            </div>

            <div className="pt-6 border-t border-border space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={activeReview.avatar}
                  alt={activeReview.clientName}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-primary shadow-sm"
                />
                <div>
                  <h4 className="font-bold text-foreground text-base">
                    {activeReview.clientName}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{activeReview.locality}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border text-xs">
                <div>
                  <div className="text-muted-foreground text-[11px]">Item Purchased:</div>
                  <div className="font-semibold text-foreground mt-0.5 truncate">{activeReview.furnitureBought}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-[11px]">Room Category:</div>
                  <div className="font-semibold text-primary mt-0.5">{activeReview.category}</div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <div className="text-muted-foreground text-[11px]">Delivery Speed:</div>
                  <div className="font-semibold text-emerald-600 mt-0.5">{activeReview.deliveryDate}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Ledger Stack */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between px-1 text-xs uppercase tracking-wider font-bold text-muted-foreground">
              <span>Customer Ledger</span>
              <span className="text-primary text-[11px]">Auto-scrolling (Click to view)</span>
            </div>

            {ESSENTIAL_TESTIMONIALS.map((review, idx) => {
              const isCurrent = activeIndex === idx;
              return (
                <div
                  key={review.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    isCurrent
                      ? "bg-card border-primary shadow-md scale-[1.01]"
                      : "bg-card/50 border-border hover:border-primary/40 hover:bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-primary font-bold">0{idx + 1}</span>
                      <h4 className="font-semibold text-sm text-foreground">{review.clientName}</h4>
                    </div>
                    <div className="flex gap-0.5 text-primary">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">
                    "{review.quote}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1.5 border-t border-border">
                    <span className="truncate max-w-[180px]">{review.furnitureBought}</span>
                    <span className="text-primary font-medium">{review.locality.split(",")[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust Badges Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">3 to 5 Days Direct Delivery</div>
              <div className="text-xs text-muted-foreground">Pan-Hyderabad & Bangalore express shipping</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">3-Year Frame Warranty</div>
              <div className="text-xs text-muted-foreground">Structural integrity & termite resistance</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <ThumbsUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">Direct Factory Pricing</div>
              <div className="text-xs text-muted-foreground">Zero middleman margins on all items</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
