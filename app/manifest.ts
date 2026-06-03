import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MyQuizLab",
    short_name: "QuizLab",
    description: "Practice any topic in short quiz sessions",
    start_url: "/",
    display: "standalone",
    background_color: "#0F1117",
    theme_color: "#0F1117",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
