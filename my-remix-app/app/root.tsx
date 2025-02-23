import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  Link,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { useState, useEffect } from "react";
import { supabase } from "~/lib/supabase.client";
import { SpeedInsights } from "@vercel/speed-insights/remix";

import "./tailwind.css";

import { Navbar } from "~/components/Navbar";
import { Footer } from "~/components/Footer";
import { useUserStats } from "~/hooks/useUserStats";

type Scope = 'username' | 'payments';
interface AuthResult {
  accessToken: string;
  user: {
    uid: string;
    username: string;
  };
}

interface PaymentDTO {
  amount: number;
  user_uid: string;
  created_at: string;
  identifier: string;
  metadata: Object;
  memo: string;
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
  to_address: string;
  transaction: null | {
    txid: string;
    verified: boolean;
    _link: string;
  };
}

declare global {
  interface Window {
    Pi: any;
  }
}

// Alert 모달 컴포넌트
const AlertModal = ({ isOpen, onClose, message }: { isOpen: boolean; onClose: () => void; message: string }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* 모달 컨텐츠 */}
      <div className="bg-[#242424] rounded-lg p-6 max-w-lg w-full mx-4 relative z-10 border border-purple-500/20">
        <div className="text-center">
          {/* 성공 아이콘 */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-500/20 mb-4">
            <svg
              className="h-6 w-6 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* 메시지 */}
          <div className="mt-2 text-center px-4">
            <p className="text-white text-lg whitespace-pre-line">{message}</p>
          </div>

          {/* 확인 버튼 */}
          <div className="mt-6">
            <button
              type="button"
              className="w-full rounded-lg bg-purple-500 px-4 py-2 text-white hover:bg-purple-600 transition-colors duration-200"
              onClick={onClose}
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
        <Navbar />
        <main className="flex-grow bg-[#242424]">{children}</main>
        <Footer totalUsers={totalUsers} todayUsers={todayUsers} />
        <SpeedInsights />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="error-container">
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  }

  return (
    <div className="error-container">
      <h1>앗! 예상치 못한 오류가 발생했습니다.</h1>
      <p>잠시 후 다시 시도해주세요.</p>
    </div>
  );
}