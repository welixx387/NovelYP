import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ranobe Reader — читай ранобэ онлайн",
    short_name: "Ranobe Reader",
    description: "Онлайн-читалка ранобэ и веб-новелл с закладками и премиум-главами.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0b0f",
    theme_color: "#8b5cf6",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
