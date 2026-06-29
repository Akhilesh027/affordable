import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Youtube,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import logo from "../../Images/JSGALORE.png";

const API_ADMIN = "https://api.jsgallor.com/api/admin";

type ApiCategory = {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  segment?: "all" | "affordable" | "midrange" | "luxury";
  parentId?: string | null;
  parent?: string | null;
  parentCategory?: string | null;
  status?: "active" | "hidden" | "disabled";
  showOnWebsite?: boolean;
  showInNavbar?: boolean;
  order?: number;
};

const norm = (s?: string | null) => String(s || "").trim().toLowerCase();

const getCatId = (cat: ApiCategory) =>
  String(cat.id || cat._id || cat.slug);

const getParentId = (cat: ApiCategory) =>
  String(cat.parentId || cat.parent || cat.parentCategory || "");

export const Footer = () => {
  const [cats, setCats] = useState<ApiCategory[]>([]);
  const [catLoading, setCatLoading] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        setCatLoading(true);

        const urls = [
          `${API_ADMIN}/categories?segment=all&status=active&level=all&sort=order&limit=200`,
          `${API_ADMIN}/categories?segment=midrange&status=active&level=all&sort=order&limit=200`,
        ];

        const [r1, r2] = await Promise.all(urls.map((url) => fetch(url)));

        const j1 = await r1.json().catch(() => ({}));
        const j2 = await r2.json().catch(() => ({}));

        const a1: ApiCategory[] = Array.isArray(j1)
          ? j1
          : j1?.data?.items || j1?.data || [];

        const a2: ApiCategory[] = Array.isArray(j2)
          ? j2
          : j2?.data?.items || j2?.data || [];

        const map = new Map<string, ApiCategory>();

        [...a1, ...a2].forEach((cat) => {
          if (!cat?.slug) return;

          const key = getCatId(cat);

          map.set(key, {
            ...cat,
            id: cat.id || cat._id || cat.slug,
            _id: cat._id || cat.id || cat.slug,
          });
        });

        const merged = Array.from(map.values())
          .filter((cat) => {
            if (cat.status && cat.status !== "active") return false;
            if (typeof cat.showOnWebsite === "boolean" && !cat.showOnWebsite)
              return false;
            if (typeof cat.showInNavbar === "boolean" && !cat.showInNavbar)
              return false;

            const seg = norm(cat.segment);
            if (seg && seg !== "all" && seg !== "midrange") return false;

            return true;
          })
          .sort(
            (a, b) =>
              Number(a.order || 0) - Number(b.order || 0) ||
              a.name.localeCompare(b.name)
          );

        setCats(merged);
      } catch (error) {
        console.error("Footer categories error:", error);
        setCats([]);
      } finally {
        setCatLoading(false);
      }
    };

    fetchCats();
  }, []);

  const footerCategories = useMemo(() => {
    return cats.filter((cat) => !getParentId(cat)).slice(0, 5);
  }, [cats]);

  return (
    <>
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
                <h2 className="text-2xl md:text-3xl font-bold">
                  Get 10% Off Your First Order
                </h2>
                <p className="text-background/80 mt-2">
                  Sign up for our newsletter and enjoy exclusive discounts
                </p>
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

      <footer className="bg-foreground text-background">
        <div className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <Link to="/" className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                    <img
                      src={logo}
                      alt="JSGALORE Logo"
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">JSGALLOR</h2>
                    <p className="text-xs text-muted-foreground">
                      Furniture & Interiors
                    </p>
                  </div>
                </Link>

                <p className="text-muted-foreground text-sm mb-4">
                  Premium furniture for modern living. Quality craftsmanship
                  meets contemporary design.
                </p>

                <p className="text-sm text-primary font-medium mb-4">
                  We deal with premium and trusted manufacturers only.
                </p>

                <div className="flex gap-3">
                  <a
                    href="https://www.facebook.com/profile.php?id=61586448690693"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>

                  <a
                    href="https://www.instagram.com/jsgallor/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>

                  <a
                    href="https://www.youtube.com/@JSGALLOR"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                  >
                    <Youtube className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Quick Links</h3>

                {catLoading ? (
                  <p className="text-muted-foreground text-sm">
                    Loading categories...
                  </p>
                ) : footerCategories.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No categories found
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {footerCategories.map((cat) => (
                      <li key={getCatId(cat)}>
                        <Link
                          to={`/categories/${cat.slug}`}
                          className="text-muted-foreground hover:text-primary text-sm"
                        >
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">
                  Support & Policies
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/about"
                      className="text-muted-foreground hover:text-primary text-sm"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/faq"
                      className="text-muted-foreground hover:text-primary text-sm"
                    >
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      className="text-muted-foreground hover:text-primary text-sm"
                    >
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/shipping-info"
                      className="text-muted-foreground hover:text-primary text-sm"
                    >
                      Shipping Info
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/delivery-policy"
                      className="text-muted-foreground hover:text-primary text-sm"
                    >
                      Delivery Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/warranty-refund"
                      className="text-muted-foreground hover:text-primary text-sm"
                    >
                      Warranty & Refund
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/replacement-policy"
                      className="text-muted-foreground hover:text-primary text-sm"
                    >
                      Replacement Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/privacy-policy"
                      className="text-muted-foreground hover:text-primary text-sm"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/terms"
                      className="text-muted-foreground hover:text-primary text-sm"
                    >
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Our Locations</h3>
                <ul className="space-y-4 text-sm">
                  <li className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-primary mt-1" />
                    <span className="text-white">
                      WorkFlo Bizness Square, 4th Floor, H No 1-98/3/5/23 to
                      27, Jubilee Enclave, Madhapur, RR District, Telangana –
                      500081
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
                    <span className="text-muted-foreground">
                      +91 7075848516
                    </span>
                  </li>

                  <li className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">
                      hello@jsgalore.com
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 py-4">
          <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between text-sm text-muted-foreground gap-2">
            <p>© 2026 JSGALORE. All rights reserved.</p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/privacy-policy" className="hover:text-primary">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-primary">
                Terms of Service
              </Link>
              <Link to="/delivery-policy" className="hover:text-primary">
                Delivery Policy
              </Link>
              <Link to="/warranty-refund" className="hover:text-primary">
                Warranty & Refund
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};