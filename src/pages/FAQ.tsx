import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import {
  HelpCircle,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Truck,
  MessageCircle,
  PhoneCall,
  Search,
  ChevronRight,
  Layers,
  MapPin,
} from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
  category: "ordering" | "materials" | "delivery" | "warranty" | "experience";
}

const FAQ_CATEGORIES = [
  { id: "all", label: "All Questions", icon: HelpCircle },
  { id: "ordering", label: "Ordering & Sizing", icon: Sparkles },
  { id: "materials", label: "Materials & Quality", icon: Layers },
  { id: "delivery", label: "Delivery & Assembly", icon: Truck },
  { id: "warranty", label: "Warranty & Support", icon: ShieldCheck },
  { id: "experience", label: "Experience Center", icon: MapPin },
] as const;

const FAQ_DATA: FAQItem[] = [
  {
    category: "ordering",
    q: "Are custom dimensions available for compact apartments?",
    a: "Yes! Many of our Essential Studio furniture designs can be adjusted to fit compact living rooms, studio apartments, and modern bedroom layouts. Please reach out to our team with your room measurements for sizing guidance.",
  },
  {
    category: "ordering",
    q: "How do I place an order or request bulk pricing?",
    a: "You can place orders directly on our website, or contact our sales specialists on WhatsApp (+91 70758 48516) for customized order requests, fabric selections, or corporate/bulk discounts.",
  },
  {
    category: "materials",
    q: "What materials are used in JS GALLOR Essential Studio furniture?",
    a: "Our Essential range is crafted using sturdy engineered woods with high-pressure laminate finishes, kiln-dried structural wood frames, and resilient high-density foam cushions built for everyday family use.",
  },
  {
    category: "materials",
    q: "How should I clean and maintain this furniture?",
    a: "Dust wooden surfaces with a soft, dry lint-free cloth. For fabric sofas, light vacuuming or spot cleaning with a mild damp cloth is recommended. Avoid harsh chemical cleaners or abrasive scouring pads.",
  },
  {
    category: "delivery",
    q: "How does delivery and assembly work?",
    a: "We offer secure doorstep delivery across Hyderabad and other major cities. For items requiring assembly, our skilled technicians provide quick, hassle-free on-site setup at your scheduled delivery slot.",
  },
  {
    category: "delivery",
    q: "How can I track my delivery status?",
    a: "You can track your order status in your user profile under 'My Orders', or message us on WhatsApp (+91 70758 48516 / +91 81436 78491) with your Order ID for real-time dispatch and logistics updates.",
  },
  {
    category: "warranty",
    q: "What warranty coverage is provided on JS GALLOR Essential furniture?",
    a: "All Essential Studio furniture items include a 1 to 3-year structural warranty protecting against manufacturing defects, termite resistance issues, and structural joinery faults.",
  },
  {
    category: "warranty",
    q: "What should I do if a product arrives damaged?",
    a: "Please inspect the package upon arrival. If you notice any damage or missing hardware, report it to our delivery partner or message our support team within 48 hours for immediate replacement or repair assistance.",
  },
  {
    category: "experience",
    q: "Can I inspect furniture displays in person before purchasing?",
    a: "Yes! You are welcome to visit our Experience Center to see living, dining, and modular mockups in person. We are located at Road No 1, Bagayath Layout, 3rd Floor, Plot 288, Uppal, Hyderabad, Telangana 500039.",
  },
  {
    category: "experience",
    q: "What are your customer support and showroom hours?",
    a: "Our Experience Center is open Monday through Sunday from 10:00 AM to 8:30 PM. Our WhatsApp customer support desk operates daily for quick assistance and inquiries.",
  },
];

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = FAQ_DATA.filter((faq) => {
    const matchesCategory =
      activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleWhatsAppInquiry = () => {
    const msg = encodeURIComponent(
      "Hello JS GALLOR Essential Studio, I have a question regarding your furniture collections."
    );
    window.open(`https://wa.me/917075848516?text=${msg}`, "_blank");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        {/* Breadcrumbs */}
        <nav className="bg-muted/40 py-3 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium">Frequently Asked Questions</span>
            </div>
          </div>
        </nav>

        {/* Hero Header */}
        <section className="relative py-14 md:py-20 text-center border-b border-border bg-muted/20">
          <div className="container mx-auto px-4 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wider uppercase">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Help Center & FAQ</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Frequently Asked Questions
            </h1>

            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Find clear answers to common questions about our furniture, sizing,
              ordering, delivery, assembly, and warranty coverage.
            </p>

            {/* Search Input */}
            <div className="pt-4 max-w-lg mx-auto">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search questions (e.g. warranty, delivery, sizes)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-full bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories Bar */}
        <section className="py-4 border-b border-border bg-background sticky top-16 z-30 shadow-xs">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none justify-start md:justify-center">
              {FAQ_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setOpenIndex(null);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Accordion List */}
        <section className="py-12 md:py-16 container mx-auto px-4 max-w-4xl">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-16 space-y-3 bg-muted/30 rounded-2xl border border-border p-8">
              <HelpCircle className="w-10 h-10 text-muted-foreground/60 mx-auto" />
              <h3 className="text-lg font-semibold">No matching questions found</h3>
              <p className="text-xs text-muted-foreground">
                Try searching with different terms or reset your filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="mt-2 text-xs text-primary underline hover:opacity-80"
              >
                Reset search filters
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredFaqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                      isOpen
                        ? "bg-card border-primary/40 shadow-sm"
                        : "bg-card/70 border-border hover:border-primary/20"
                    }`}
                  >
                    <button
                      onClick={() => handleToggle(idx)}
                      className="w-full p-5 text-left flex items-start justify-between gap-4 focus:outline-none"
                    >
                      <span className="font-medium text-sm sm:text-base leading-snug">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-muted-foreground shrink-0 mt-0.5 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-primary" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/50 mt-1">
                        <div className="pt-3">{faq.a}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Need More Assistance Banner */}
          <div className="mt-14 p-8 rounded-2xl bg-muted/40 border border-border text-center space-y-4 shadow-xs">
            <h3 className="text-xl sm:text-2xl font-bold">
              Still Have Questions?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Our team is here to answer your queries regarding dimensions, delivery schedule, materials, or order updates.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <button
                onClick={handleWhatsAppInquiry}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold tracking-wider uppercase transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </button>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold tracking-wider uppercase transition-colors shadow-sm"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Contact Us</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}