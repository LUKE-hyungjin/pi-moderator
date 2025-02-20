import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

import "./tailwind.css";

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

const Navbar = () => {
  return (
    <nav className="bg-[#1a1a1a] text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img src="/assets/picoin_logo.png" alt="Logo" className="w-9 h-9 rounded-full" />
          <h1 className="text-xl font-bold">Pi-Moderator</h1>
        </div>
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-purple-400">Home</Link>
          <Link to="/pi" className="hover:text-purple-400">Pi</Link>
          <Link to="/map" className="hover:text-purple-400">Map</Link>
          <Link to="/education" className="hover:text-purple-400">Education</Link>
          <Link to="/user" className="hover:text-purple-400">User</Link>
        </div>
        <div className="md:hidden">
          <button className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <span id="userStatus" className="text-white">로그인이 필요합니다</span>
          <button
            id="piAuthButton"
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            onClick={() => {
              // Pi Network 인증 로직
              // if (window.Pi) {
              //   window.Pi.authenticate(['username', 'payments'], () => { })
              //     .then((auth: any) => {
              //       const userStatus = document.getElementById('userStatus');
              //       if (userStatus) {
              //         userStatus.textContent = `USER: ${auth.user.username}`;
              //       }
              //     })
              //     .catch((error: any) => {
              //       console.error('Authentication error:', error);
              //     });
              // }
            }}
          >
            Pi Network 인증
          </button>
        </div>
      </div>
    </nav>
  );
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script src="https://sdk.minepi.com/pi-sdk.js" defer></script>
      </head>
      <body className="bg-[#111111] min-h-screen text-white">
        <Navbar />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}