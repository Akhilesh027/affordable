import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      {/* Newsletter section */}
      <div className="bg-primary py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-primary-foreground">Subscribe to our Newsletter</h3>
              <p className="text-primary-foreground/80 text-sm">Get exclusive offers and updates</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/20 border-white/30 text-primary-foreground placeholder:text-primary-foreground/60 rounded-full min-w-[250px]"
              />
              <Button variant="secondary" className="rounded-full">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">JS</span>
                </div>
                <div>
                  <h2 className="font-bold text-lg">JSGALORE</h2>
                  <p className="text-xs text-muted-foreground">Furniture & Interiors</p>
                </div>
              </Link>
              <p className="text-muted-foreground text-sm mb-4">
                Premium furniture for modern living. Quality craftsmanship meets contemporary design.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                  <Twitter className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/categories/living-room" className="text-muted-foreground hover:text-primary transition-colors text-sm">Living Room</Link></li>
                <li><Link to="/categories/bedroom" className="text-muted-foreground hover:text-primary transition-colors text-sm">Bedroom</Link></li>
                <li><Link to="/categories/dining" className="text-muted-foreground hover:text-primary transition-colors text-sm">Dining</Link></li>
                <li><Link to="/categories/office" className="text-muted-foreground hover:text-primary transition-colors text-sm">Office</Link></li>
                <li><Link to="/categories/outdoor" className="text-muted-foreground hover:text-primary transition-colors text-sm">Outdoor</Link></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Customer Service</h3>
              <ul className="space-y-2">
                <li><Link to="/orders" className="text-muted-foreground hover:text-primary transition-colors text-sm">Track Order</Link></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Returns & Exchanges</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Shipping Info</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">FAQ</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Contact Us</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-primary mt-0.5" />
                  <span className="text-muted-foreground">123 Furniture Street, Design District, Mumbai 400001</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">+91 98765 43210</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">hello@jsgalore.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
            <p>© 2024 JSGALORE. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
