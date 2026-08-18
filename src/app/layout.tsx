import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reservas | Gestión de pistas",
  description: "La libreta digital de tu club de pádel.",
  applicationName: "Reservas",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Reservas" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="es"><body>{children}</body></html>;
}
