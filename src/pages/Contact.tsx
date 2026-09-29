// src/pages/Contact.tsx
import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Send,
  CheckCircle2,
  ChevronRight,
  Building2,
  Headphones,
  Calendar,
  Sparkles,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Contact() {
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formSubject, setFormSubject] = useState("Product Inquiry");
  const [formMessage, setFormMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const text =
      `*New Contact Message – JS GALLOR (Essential Studio)*%0A%0A` +
      `*Name:* ${formName}%0A` +
      `*Email:* ${formEmail}%0A` +
      `*Phone:* ${formPhone}%0A` +
      `*Subject:* ${formSubject}%0A%0A` +
      `*Message:*%0A${formMessage}`;

    const whatsappUrl = `https://wa.me/917075848516?text=${text}`;

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      window.open(whatsappUrl, "_blank");
    }, 600);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormSubject("Product Inquiry");
    setFormMessage("");
  };

  const contactCards = [
    {
      icon: Phone,
      title: "Call Us",
      subtitle: "Speak directly with our support & sales representatives",
      details: ["+91 70758 48516", "+91 81436 78491"],
      actionLabel: "Call Now",
      actionHref: "tel:+917075848516",
    },
    {
      icon: Mail,
      title: "Email Us",
      subtitle: "Send your questions, design requirements or order inquiries",
      details: ["info@jsgallor.com", "support@jsgallor.com"],
      actionLabel: "Send Email",
      actionHref: "mailto:info@jsgallor.com",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Support",
      subtitle: "Instant quotes, live catalogs and quick assistance",
      details: ["+91 70758 48516", "Mon – Sun • 24/7 Response"],
      actionLabel: "Chat on WhatsApp",
      actionHref: "https://wa.me/917075848516?text=Hello%20JS%20GALLOR,%20I%20have%20an%20inquiry.",
      highlight: true,
    },
    {
      icon: Clock,
      title: "Operating Hours",
      subtitle: "Customer service & showroom timing",
      details: [
        "Mon – Sat: 9:00 AM – 8:00 PM IST",
        "Sunday: 10:00 AM – 6:00 PM IST",
      ],
      actionLabel: "Visit Center",
      actionHref: "#locations",
    },
  ];

  const locations = [
    {
      name: "Corporate Headquarters & Interior Architecture Studio",
      badge: "Interiors & Corporate HQ",
      subtitle: "Interior Design Consultations, Material Atelier & 3D Walkthroughs",
      address:
        "WorkFlo Bizness Square, 4th Floor, Jubilee Enclave, HITEC City, Madhapur, Hyderabad, Telangana – 500081",
      phone: "+91 81436 78491 / +91 70758 48516",
      email: "info@jsgallor.com",
      timings: "Monday – Saturday: 9:00 AM – 8:00 PM",
      mapUrl: "https://maps.google.com/?q=WorkFlo+Bizness+Square+Madhapur+Hyderabad",
    },
    {
      name: "Central Experience Center & Furniture / Interiors Warehouse",
      badge: "Walk-In Experience Center (Furniture & Interiors)",
      subtitle: "Live Modular Kitchens, Wardrobe Setups, Living & Dining Displays",
      address:
        "JS GALLOR Experience Center & Central Warehouse, Main Road, Near Metro Station Pillar 812, Uppal, Hyderabad, Telangana – 500039",
      phone: "+91 81436 78491 / +91 70758 48516",
      email: "support@jsgallor.com",
      timings: "Monday – Sunday: 10:00 AM – 8:30 PM",
      mapUrl: "https://maps.google.com/?q=Uppal+Hyderabad+Telangana",
    },
    {
      name: "Premium Showroom & Interior Consultation Lounge",
      badge: "Furniture Showroom & Design Studio",
      subtitle: "Curated Living & Bedroom Collections, Fabric & Finish Selection",
      address:
        "Road No. 12, Banjara Hills, Hyderabad, Telangana – 500034",
      phone: "+91 81436 78491 / +91 70758 48516",
      email: "sales@jsgallor.com",
      timings: "Monday – Sunday: 10:30 AM – 8:30 PM",
      mapUrl: "https://maps.google.com/?q=Road+No+12+Banjara+Hills+Hyderabad",
    },
    {
      name: "Bangalore Experience Pavilion & Studio",
      badge: "Furniture & Interior Experience Center",
      subtitle: "Modular Systems, Solid Wood Display & Senior Architect Desk",
      address:
        "840, 100ft Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka – 560038",
      phone: "+91 81436 78491",
      email: "bangalore@jsgallor.com",
      timings: "Tuesday – Sunday: 10:00 AM – 8:00 PM",
      mapUrl: "https://maps.google.com/?q=Indiranagar+Bengaluru+Karnataka",
    },
  ];

  const faqs = [
    {
      q: "What warranty coverage is provided on JS GALLOR Essential furniture?",
      a: "All Essential Studio furniture comes with a 1 to 3-year structural warranty covering materials, frame integrity, and workmanship.",
    },
    {
      q: "How can I track my order delivery?",
      a: "You can track your orders anytime under 'My Orders' in your profile or WhatsApp us at +91 70758 48516 with your Order ID for real-time updates.",
    },
    {
      q: "Are customized sizes available for compact spaces?",
      a: "Yes! Many of our furniture products can be customized for compact apartments and studios. Contact our design specialists for custom sizing.",
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        {/* Breadcrumbs */}
        <nav className="bg-muted/40 py-3 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary">
                Home
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium">Contact Us</span>
            </div>
          </div>
        </nav>

        {/* Hero Header */}
        <section className="py-16 text-center border-b border-border bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4 max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wider uppercase">
              <Headphones className="w-4 h-4" />
              <span>We're Here to Help</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Contact JS GALLOR Essential Studio
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Need assistance with our furniture collections, order tracking, or warranty support? We're just a call, email, or message away.
            </p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-12 container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl p-6 border transition-all duration-300 flex flex-col justify-between ${
                    card.highlight
                      ? "bg-primary/5 border-primary/30 shadow-lg shadow-primary/5"
                      : "bg-card border-border hover:border-primary/40 shadow-sm"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {card.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        {card.subtitle}
                      </p>
                      <div className="space-y-1">
                        {card.details.map((line, i) => (
                          <div
                            key={i}
                            className="text-sm font-medium text-foreground"
                          >
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <a
                    href={card.actionHref}
                    target={card.actionHref.startsWith("http") ? "_blank" : undefined}
                    rel={card.actionHref.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="mt-6 inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <span>{card.actionLabel}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            })}
          </div>
        </section>

        {/* Form and Quick Chat Section */}
        <section className="py-8 container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form */}
            <div className="lg:col-span-7 bg-card rounded-2xl border border-border p-6 sm:p-8 md:p-10 shadow-md">
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary font-semibold">
                  <MessageSquare className="w-4 h-4" />
                  <span>Send a Direct Message</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  How Can We Assist You Today?
                </h2>
                <p className="text-sm text-muted-foreground">
                  Fill out the form below and our team will get back to you within 2 business hours.
                </p>
              </div>

              {isSubmitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    Thank You! Message Sent
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Your inquiry has been submitted and forwarded via WhatsApp. We will contact you shortly.
                  </p>
                  <Button onClick={handleReset}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Your Full Name *
                      </label>
                      <Input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Phone Number *
                      </label>
                      <Input
                        type="tel"
                        required
                        placeholder="e.g. +91 98765 43210"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        placeholder="e.g. rahul@example.com"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Subject / Topic
                      </label>
                      <select
                        value={formSubject}
                        onChange={(e) => setFormSubject(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm h-10"
                      >
                        <option value="Product Inquiry">Product Inquiry</option>
                        <option value="Order Tracking & Status">Order Tracking & Status</option>
                        <option value="Compact Furniture Consultation">Compact Furniture Consultation</option>
                        <option value="Bulk & Commercial Order">Bulk & Commercial Order</option>
                        <option value="Warranty & Service Support">Warranty & Service Support</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Your Message or Details *
                    </label>
                    <Textarea
                      required
                      rows={4}
                      placeholder="Please share product names, questions or requirements..."
                      value={formMessage}
                      onChange={(e) => setFormMessage(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 gap-2 h-11"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? "Sending..." : "Send Message & Open WhatsApp"}</span>
                  </Button>
                </form>
              )}
            </div>

            {/* Side Assistance */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 space-y-6 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Need Quick Assistance?</h3>
                    <p className="text-xs text-muted-foreground">Direct contact with our team</p>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                    <Phone className="w-4 h-4 mt-0.5 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Direct Phone Support</div>
                      <a href="tel:+917075848516" className="font-semibold text-foreground hover:underline">
                        +91 70758 48516
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                    <Mail className="w-4 h-4 mt-0.5 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">General Enquiries</div>
                      <a href="mailto:info@jsgallor.com" className="font-semibold text-foreground hover:underline">
                        info@jsgallor.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                    <Calendar className="w-4 h-4 mt-0.5 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Consultation Support</div>
                      <div className="text-xs text-muted-foreground">Get help choosing the right furniture dimensions.</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <a
                    href="https://wa.me/917075848516?text=Hello%20JS%20GALLOR,%20I%20would%20like%20to%20inquire%20about%20furniture."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-sm bg-[#25D366] text-white hover:bg-[#20ba59] transition-all shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat Directly on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Experience Centers */}
        <section id="locations" className="py-12 container mx-auto px-4 border-t border-border">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-primary">
              <Building2 className="w-4 h-4" />
              <span>Our Centers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Experience Centers & Showrooms
            </h2>
            <p className="text-sm text-muted-foreground">
              Visit our experience centers in Hyderabad to view materials and explore compact & functional furniture setups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {locations.map((loc, idx) => (
              <div
                key={idx}
                className="bg-card rounded-2xl border border-border p-6 flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm"
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {loc.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-foreground leading-snug">
                      {loc.name}
                    </h3>
                    {loc.subtitle && (
                      <p className="text-xs text-primary font-medium mt-1">
                        {loc.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 text-sm text-muted-foreground pt-1">
                    <div className="flex gap-2.5 items-start">
                      <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                      <span>{loc.address}</span>
                    </div>

                    <div className="flex gap-2.5 items-center">
                      <Phone className="w-4 h-4 text-primary shrink-0" />
                      <a href={`tel:${loc.phone.split('/')[0].trim()}`} className="hover:text-primary">
                        {loc.phone}
                      </a>
                    </div>

                    <div className="flex gap-2.5 items-center">
                      <Clock className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-xs">{loc.timings}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <a
                    href={loc.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors border border-border"
                  >
                    <span>Get Directions on Map</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="py-12 container mx-auto px-4 max-w-4xl border-t border-border">
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-muted-foreground">
              Quick answers to common questions about contacting and ordering from Essential Studio.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-card border border-border rounded-xl p-5"
              >
                <h4 className="font-semibold text-foreground text-base mb-2">
                  {faq.q}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}