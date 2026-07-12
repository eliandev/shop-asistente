import type { MetadataRoute } from "next";

const BASE = "https://silvi-assistants.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const ahora = new Date();
  return [
    {
      url: `${BASE}/`,
      lastModified: ahora,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE}/crear`,
      lastModified: ahora,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE}/chat`,
      lastModified: ahora,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];
}
