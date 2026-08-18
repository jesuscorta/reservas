import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "Reservas de Pádel", short_name: "Reservas", description: "Gestión interna de pistas de pádel.", start_url: "/", display: "standalone", background_color: "#f4f7f5", theme_color: "#177c5b", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }] };
}
