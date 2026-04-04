import { Link, useLocation, useNavigate } from "react-router-dom"; // add useNavigate
import { ShoppingCart, User, Search, Menu, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useState, FormEvent } from "react"; // add FormEvent
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

// Helper component for avatar with fallback
const UserAvatar = ({ user }: { user: any }) => {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = user?.avatar || user?.profilePicture || user?.image || user?.photo;

  if (!avatarUrl || imgError) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
        <User className="w-5 h-5 text-gray-500" />
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt="User avatar"
      className="w-8 h-8 rounded-full object-cover"
      onError={() => setImgError(true)}
    />
  );
};

export const Navbar = () => {
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate(); // for search navigation

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
        if (!r1.ok || !r2.ok) throw new Error("Failed");
        const j1 = await r1.json().catch(() => ({}));
        const j2 = await r2.json().catch(() => ({}));
        const a1: ApiCategory[] = j1?.data?.items || [];
        const a2: ApiCategory[] = j2?.data?.items || [];
        const map = new Map<string, ApiCategory>();
        a1.forEach((c) => c?.slug && map.set(c.slug, c));
        a2.forEach((c) => c?.slug && map.set(c.slug, c));
        let merged = Array.from(map.values());
        merged = merged.filter((c) => {
          if (c.status && c.status !== "active") return false;
          const seg = norm(c.segment);
          if (seg !== "all" && seg !== "affordable") return false;
          if (typeof c.showOnWebsite === "boolean" && !c.showOnWebsite) return false;
          if (typeof c.showInNavbar === "boolean" && !c.showInNavbar) return false;
          if (c.parentId) return false;
          return true;
        });
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
    return location.pathname === path || location.pathname.startsWith(path);
  };

  // Handle search submission
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    // Navigate to search page with query param
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    setSearchQuery(""); // optional: clear input
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Main navbar */}
      <div className="bg-surface/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#4d602c] flex items-center justify-center shadow-md group-hover:shadow-glow transition-all duration-300 group-hover:rotate-[360deg]">
                <img src={logo} alt="JSGALLOR Logo" className="w-8 h-8 object-contain" />
              </div>
              <div className="flex flex-col">
                <div className="font-semibold text-base text-black leading-tight">JSGALLOR</div>
                <div className="text-[11px] text-gray-500 leading-tight">Furniture & Interiors</div>
              </div>
            </Link>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Search furniture..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 h-10 rounded-full bg-white border-border/50 focus:border-primary focus:ring-primary text-sm"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </form>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Segment Buttons - desktop only */}
              <div className="hidden md:flex items-center gap-2 mr-1">
                <a
                  href="https://signaturespaces.jsgallor.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="rounded-full px-3 h-9 text-xs">
                    Signature Spaces
                  </Button>
                </a>
                <a
                  href="https://celestialiving.jsgallor.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" className="rounded-full px-3 h-9 text-xs">
                    Celestia Living
                  </Button>
                </a>
              </div>

              {/* Wishlist */}
              <Link to="/wishlist">
                <Button variant="ghost" size="icon" className="hidden sm:flex h-9 w-9">
                  <Heart className="h-4 w-4" />
                </Button>
              </Link>

              {/* Cart */}
              <Link to="/checkout">
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <ShoppingCart className="h-4 w-4" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-scale-in">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Auth - Desktop only */}
              <div className="hidden md:block">
                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <UserAvatar user={user} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild><Link to="/profile">My Profile</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link to="/orders">My Orders</Link></DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link to="/login">
                    <Button size="sm" className="h-9 text-xs">Login</Button>
                  </Link>
                )}
              </div>

              {/* Mobile toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Category nav - desktop */}
      <nav className="hidden md:block bg-white border-b border-border/30">
        <div className="container mx-auto px-4 flex justify-center">
          {navCats.map((cat) => (
            <Link
              key={cat.path}
              to={cat.path}
              className={`px-4 py-3 text-sm transition-colors ${
                isCatActive(cat.path)
                  ? "text-primary font-semibold border-b-2 border-primary"
                  : "text-foreground/80 hover:text-primary"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile menu (hamburger) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white p-4 space-y-4 border-b border-border/30">
          {/* Mobile user section */}
          <div className="border-b border-gray-100 pb-3 mb-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <UserAvatar user={user} />
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800">
                    {user?.name || user?.email || "User"}
                  </span>
                  <button
                    onClick={logout}
                    className="text-left text-sm text-red-500 hover:text-red-600"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full rounded-full">Login / Sign Up</Button>
              </Link>
            )}
          </div>

          {/* Mobile segment buttons */}
          <div className="flex gap-2">
            <a
              href="https://signaturespaces.jsgallor.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-1/2"
            >
              <Button variant="outline" className="w-full rounded-full text-xs h-9">
                Signature Spaces
              </Button>
            </a>
            <a
              href="https://celestialiving.jsgallor.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-1/2"
            >
              <Button className="w-full rounded-full text-xs h-9">
                Celestia Living
              </Button>
            </a>
          </div>

          {/* Mobile categories */}
          <div className="grid grid-cols-2 gap-2">
            {navCats.map((cat) => (
              <Link key={cat.path} to={cat.path} onClick={() => setMobileMenuOpen(false)}>
                <div className="p-2 bg-muted text-center rounded hover:bg-muted/80 text-sm">
                  {cat.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};