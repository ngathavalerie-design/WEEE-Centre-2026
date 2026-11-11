import type { MetadataRoute } from "next";
import { SITE } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly",
  ) => ({ url: `${SITE.url}${path}`, lastModified: now, changeFrequency, priority });

  return [
    page("", 1.0),
    page("/services", 0.9),
    page("/about", 0.8),
    page("/contact", 0.7),
    page("/projects", 0.7),
    page("/events", 0.7, "weekly"),
    page("/conferences", 0.6),
    page("/track", 0.4, "yearly"),
    page("/terms", 0.3, "yearly"),
    page("/privacy", 0.3, "yearly"),
  ];
}
