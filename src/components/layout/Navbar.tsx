import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, User, Search, Menu, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "../../Images/JSGALORE.png";

const API_ADMIN = "https://api.jsgallor.com/api/admin";

type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  segment?: "all" | "affordable" | "midrange" | "luxury";
  status?: "active" | "hidden" | "disabled";
  showOnWebsite?: boolean;
  showInNavbar?: boolean;
  order?: number;
};

const fallbackCategories = [
  { name: "Living Room", slug: "living-room" },
  { name: "Bedroom", slug: "bedroom" },
  { name: "Dining", slug: "dining" },
  { name: "Office", slug: "office" },
  { name: "Outdoor", slug: "outdoor" },
  { name: "Decor", slug: "decor" },
];

const norm = (s?: string) => String(s || "").trim().toLowerCase();

export const Navbar = () => {
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  // ✅ categories from backend
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [catLoading, setCatLoading] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        setCatLoading(true);

        const urls = [
          `${API_ADMIN}/categories?segment=all&status=active&level=parent&sort=order&limit=200`,
          `${API_ADMIN}/categories?segment=affordable&status=active&level=parent&sort=order&limit=200`,
        ];

        const [r1, r2] = await Promise.all(urls.map((u) => fetch(u)));
        if (!r1.ok || !r2.ok) throw new Error("Failed to fetch categories");

        const j1 = await r1.json().catch(() => ({}));
        const j2 = await r2.json().catch(() => ({}));

        const a1: ApiCategory[] = j1?.data?.items || [];
        const a2: ApiCategory[] = j2?.data?.items || [];

        // ✅ merge unique by slug (prefer affordable if duplicates)
        const map = new Map<string, ApiCategory>();
        a1.forEach((c) => c?.slug && map.set(c.slug, c));
        a2.forEach((c) => c?.slug && map.set(c.slug, c));

        let merged = Array.from(map.values());

        // ✅ only active + (all or affordable) + showOnWebsite true (if present)
        merged = merged.filter((c) => {
          if (c.status && c.status !== "active") return false;
          const seg = norm(c.segment);
          if (seg !== "all" && seg !== "affordable") return false;

          // if backend sends showOnWebsite, enforce it
          if (typeof c.showOnWebsite === "boolean" && !c.showOnWebsite) return false;

          // if backend sends showInNavbar, enforce it (optional)
          if (typeof c.showInNavbar === "boolean" && !c.showInNavbar) return false;

          // parent only (already filtered by level=parent, but double safe)
          if (c.parentId) return false;

          return true;
        });

        // ✅ sort by order if present
        merged.sort((x, y) => Number(x.order || 0) - Number(y.order || 0));

        setCategories(merged);
      } catch {
        setCategories([]);
      } finally {
        setCatLoading(false);
      }
    };

    fetchCats();
  }, []);

  // ✅ final list for navbar (fallback if api fails)
  const navCats = useMemo(() => {
    if (categories.length > 0) {
      return categories.map((c) => ({
        name: c.name,
        path: `/categories/${c.slug}`,
      }));
    }
    return fallbackCategories.map((c) => ({
      name: c.name,
      path: `/categories/${c.slug}`,
    }));
  }, [categories]);

  const isCatActive = (path: string) => {
    // active for exact OR when you're inside that category route
    // example: /categories/living-room or /categories/living-room?sub=xxx
    return location.pathname === path || location.pathname.startsWith(path + "/") || location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Main navbar */}
      <div className="bg-surface/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-glow transition-all duration-300 group-hover:rotate-[360deg]">
                <img src={logo} alt="JSGALORE Logo" className="w-8 h-8 object-contain" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-lg text-foreground leading-tight">JS GALLOR </h1>
                <p className="text-xs text-muted-foreground">Furniture & Interiors</p>
              </div>
            </Link>

            {/* Search bar - desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Search furniture..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 h-10 rounded-full bg-white border-border/50 focus:border-primary focus:ring-primary"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Wishlist */}
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Heart className="h-5 w-5" />
              </Button>

              {/* Cart */}
              <Link to="/checkout">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-scale-in">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </Link>

              {/* User menu */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="font-medium text-sm">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile">My Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders">My Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive">
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
                  <Button variant="default" size="sm">
                    Login
                  </Button>
                </Link>
              )}

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Category navigation - desktop */}
      <nav className="hidden md:block bg-white border-b border-border/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-1">
            {navCats.map((cat) => (
              <Link
                key={cat.path}
                to={cat.path}
                className={`px-4 py-3 text-sm font-medium transition-colors hover:text-primary relative group ${
                  isCatActive(cat.path) ? "text-primary" : "text-foreground/80"
                }`}
              >
                {cat.name}
                <span
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary transition-all duration-300 ${
                    isCatActive(cat.path) ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}
          </div>

          {catLoading && (
            <div className="text-center text-xs text-muted-foreground pb-2">
              Loading categories...
            </div>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-border animate-slide-in">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Mobile search */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search furniture..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 rounded-full"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            {/* Mobile categories */}
            <div className="grid grid-cols-2 gap-2">
              {navCats.map((cat) => (
                <Link
                  key={cat.path}
                  to={cat.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-center rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
