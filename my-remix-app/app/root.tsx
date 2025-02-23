import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { LanguageProvider } from '~/contexts/LanguageContext';
import { SpeedInsights } from "@vercel/speed-insights/remix";
import { Analytics } from "@vercel/analytics/remix"

import "./tailwind.css";

import { Navbar } from "~/components/Navbar";
import { Footer } from "~/components/Footer";
import { useUserStats } from "~/hooks/useUserStats";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css",
  },
  {
    rel: "stylesheet",
    href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
    integrity: "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { totalUsers, todayUsers } = useUserStats();

  return (
    <html lang="en" className="h-full bg-[#242424]">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script src="https://sdk.minepi.com/pi-sdk.js"></script>
      </head>
      <body className="flex flex-col min-h-full bg-[#242424]">
        <LanguageProvider>
          <Navbar />
          <main className="flex-grow bg-[#242424]">{children}</main>
          <Footer totalUsers={totalUsers} todayUsers={todayUsers} />
          <SpeedInsights />
          <Analytics />
          <ScrollRestoration />
          <Scripts />
        </LanguageProvider>
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}