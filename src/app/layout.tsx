import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Milestone",
  description:
    "Metas con horizonte, hábitos con racha y un día claro. Sin fricción.",
  applicationName: "Milestone",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Milestone" },
};

export const viewport: Viewport = {
  themeColor: "#0B1038",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Degradado de fondo fijo: el mismo de la maqueta. */}
        <div
          aria-hidden
          className="fixed inset-0 z-0"
          style={{
            background:
              "linear-gradient(180deg,var(--bg-top) 0%,var(--bg-mid) 52%,var(--bg-bottom) 100%)",
          }}
        />
        {children}
      </body>
    </html>
  );
}
