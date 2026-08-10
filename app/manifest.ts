import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Express Customs Consulting UK Ltd",
    short_name: "Express Customs",
    description:
      "UK customs consultancy: HMRC compliance, tariff classification, duty optimisation, documentation, audits and training.",
    start_url: "/",
    display: "standalone",
    background_color: "#080c10",
    theme_color: "#080c10",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
