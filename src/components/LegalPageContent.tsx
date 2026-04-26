// src/components/LegalPageContent.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getLegalPage, LegalPage, PageType, Website } from "@/lib/legalPages";
import { Loader2, Home } from "lucide-react";

interface LegalPageContentProps {
  type: PageType;
  website?: Website;
}

// Human-readable page titles for breadcrumbs
const pageTitles: Record<PageType, string> = {
  privacy_policy: "Privacy Policy",
  terms_conditions: "Terms & Conditions",
  refund_policy: "Refund Policy",
  shipping_policy: "Shipping Policy",
  about: "About Us",
  contact: "Contact",
};

export function LegalPageContent({ type, website }: LegalPageContentProps) {
  const { tier } = useParams<{ tier: string }>();
  const [page, setPage] = useState<LegalPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentWebsite: Website =
    website ||
    (tier && ["affordable", "midrange", "luxury"].includes(tier)
      ? (tier as Website)
      : "affordable");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    getLegalPage(currentWebsite, type)
      .then((data) => {
        if (!mounted) return;
        if (data) {
          setPage(data);
        } else {
          setError("Page not found or not published yet.");
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load content.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [currentWebsite, type]);

  // Loading state
  if (loading) {
    return (
      <div className="py-12 flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error || !page) {
    return (
      <div className="py-12 flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted/5">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">Content Unavailable</h1>
          <p className="text-muted-foreground">
            {error || "The requested page could not be found."}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Home className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="bg-gradient-to-br from-muted/20 to-muted/5 py-12">
      <div className="container mx-auto px-4 max-w">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex flex-wrap items-center gap-1 text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-primary transition-colors">
                Home
              </Link>
            </li>
            <li className="text-muted-foreground/50">/</li>
            <li className="text-foreground font-medium">
              {pageTitles[type]}
            </li>
          </ol>
        </nav>

        {/* Main content card */}
        <div className="bg-card rounded-2xl shadow-lg border border-border/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 md:p-8 border-b border-border/50">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              {page.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: {new Date(page.updatedAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Content with basic Markdown heading support */}
          <div className="p-6 md:p-8 prose prose-slate dark:prose-invert max-w-none">
            {page.content.split("\n").map((paragraph, idx) => {
              if (!paragraph.trim()) return null;
              // Support ## Heading
              if (paragraph.startsWith("## ")) {
                return (
                  <h2 key={idx} className="text-2xl font-semibold mt-6 mb-3">
                    {paragraph.replace("## ", "")}
                  </h2>
                );
              }
              // Support ### Heading
              if (paragraph.startsWith("### ")) {
                return (
                  <h3 key={idx} className="text-xl font-semibold mt-5 mb-2">
                    {paragraph.replace("### ", "")}
                  </h3>
                );
              }
              return (
                <p key={idx} className="leading-relaxed mb-4">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}