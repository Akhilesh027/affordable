const API_BASE = import.meta.env.VITE_API_BASE || "https://api.jsgallor.com";
const API_URL = `${API_BASE}/api/admin/legal-pages`;

export type Website = "affordable" | "midrange" | "luxury";
export type PageType =
  | "privacy_policy"
  | "terms_conditions"
  | "refund_policy"
  | "shipping_policy"
  | "about"
  | "contact";

export interface LegalPage {
  id: string;
  website: Website;
  type: PageType;
  title: string;
  slug: string;
  content: string;
  status: "draft" | "published";
  updatedAt: string;
}

/**
 * Fetch a legal page by website and type.
 * Returns the published version (or draft if explicitly needed, but we only show published).
 */
export async function getLegalPage(website: Website, type: PageType): Promise<LegalPage | null> {
  try {
    const params = new URLSearchParams({
      website,
      type,
      status: "published",
    });
    const res = await fetch(`${API_URL}?${params.toString()}`);
    const data = await res.json();
    if (!res.ok || !data?.success) {
      console.error("Failed to fetch legal page", data?.message);
      return null;
    }
    const pages = Array.isArray(data.data) ? data.data : [];
    const page = pages[0];
    if (!page) return null;
    return {
      id: page._id,
      website: page.website,
      type: page.type,
      title: page.title,
      slug: page.slug,
      content: page.content,
      status: page.status,
      updatedAt: page.updatedAt,
    };
  } catch (err) {
    console.error("Error fetching legal page:", err);
    return null;
  }
}