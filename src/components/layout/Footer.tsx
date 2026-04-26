import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Youtube } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import logo from '../../Images/JSGALORE.png';

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      
      {/* Newsletter */}
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
            </div>

            <Button variant="secondary" className="rounded-full">
              Subscribe
            </Button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                  <img src={logo} alt="JSGALORE Logo" className="w-8 h-8 object-contain" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">JSGALLOR</h2>
                  <p className="text-xs text-muted-foreground">Furniture & Interiors</p>
                </div>
              </Link>

              <p className="text-muted-foreground text-sm mb-4">
                Premium furniture for modern living. Quality craftsmanship meets contemporary design.
              </p>

              <p className="text-sm text-primary font-medium mb-4">
                We deal with premium and trusted manufacturers only.
              </p>

              <div className="flex gap-3">
                <a href="https://www.facebook.com/profile.php?id=61586448690693" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="https://www.instagram.com/jsgallor/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="https://www.youtube.com/@JSGALLOR" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                  <Youtube className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Quick Links – Categories */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/categories/living-room" className="text-muted-foreground hover:text-primary text-sm">Living Room</Link></li>
                <li><Link to="/categories/bedroom" className="text-muted-foreground hover:text-primary text-sm">Bedroom</Link></li>
                <li><Link to="/categories/dining" className="text-muted-foreground hover:text-primary text-sm">Dining</Link></li>
                <li><Link to="/categories/office" className="text-muted-foreground hover:text-primary text-sm">Office</Link></li>
                <li><Link to="/categories/outdoor" className="text-muted-foreground hover:text-primary text-sm">Outdoor</Link></li>
              </ul>
            </div>

            {/* Support & Policies (all legal + about) */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Support & Policies</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-muted-foreground hover:text-primary text-sm">About Us</Link></li>
                <li><Link to="/faq" className="text-muted-foreground hover:text-primary text-sm">FAQ</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-primary text-sm">Contact Us</Link></li>
                <li><Link to="/shipping-info" className="text-muted-foreground hover:text-primary text-sm">Shipping Info</Link></li>
                <li><Link to="/delivery-policy" className="text-muted-foreground hover:text-primary text-sm">Delivery Policy</Link></li>
                <li><Link to="/warranty-refund" className="text-muted-foreground hover:text-primary text-sm">Warranty & Refund</Link></li>
                <li><Link to="/replacement-policy" className="text-muted-foreground hover:text-primary text-sm">Replacement Policy</Link></li>
                <li><Link to="/privacy-policy" className="text-muted-foreground hover:text-primary text-sm">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-muted-foreground hover:text-primary text-sm">Terms of Service</Link></li>
              </ul>
            </div>

            {/* Locations & Contact */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Our Locations</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-primary mt-1" />
                  <span className="text-white">
                    WorkFlo Bizness Square, 4th Floor, H No 1-98/3/5/23 to 27,  
                    Jubilee Enclave, Madhapur, RR District, Telangana – 500081
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-primary mt-1" />
                  <span className="text-white">
                    Uppal, Hyderabad, Telangana – 500039
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">+91 7075848516</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">hello@jsgalore.com</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom – quick policy links again */}
      <div className="border-t border-background/10 py-4">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between text-sm text-muted-foreground gap-2">
          <p>© 2026 JSGALORE. All rights reserved.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/privacy-policy" className="hover:text-primary">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary">Terms of Service</Link>
            <Link to="/delivery-policy" className="hover:text-primary">Delivery Policy</Link>
            <Link to="/warranty-refund" className="hover:text-primary">Warranty & Refund</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};