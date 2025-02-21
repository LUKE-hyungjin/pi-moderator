import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  Link,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { useState, useEffect } from "react";
import { supabase } from "~/lib/supabase.client";
import { SpeedInsights } from "@vercel/speed-insights/remix";

import "./tailwind.css";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [auth, setAuth] = useState<AuthResult | null>(null);
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    if (window.Pi) {
      window.Pi.init({ version: "2.0", sandbox: true });
    }
  }, []);

  const onIncompletePaymentFound = async (payment: PaymentDTO) => {
    console.log("Incomplete payment found:", payment);
    try {
      // 서버에 미완료 결제 처리 요청
      await fetch('/api/pi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'verify_payment',
          paymentId: payment.identifier,
          txid: payment.transaction?.txid
        })
      });
    } catch (error) {
      console.error('Error handling incomplete payment:', error);
    }
  };
  const authenticateUser = async () => {
    try {
      if (!window.Pi) {
        alert('Pi Network SDK를 찾을 수 없습니다. Pi Browser에서 접속해주세요.');
        return;
      }

      const scopes: Array<Scope> = ['username', 'payments'];
      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);

      // 서버에서 사용자 검증
      const verifyResponse = await fetch('/api/pi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'verify_user',
          accessToken: authResult.accessToken
        })
      });

      const responseData = await verifyResponse.json();

      if (verifyResponse.ok) {
        // Supabase에 사용자 저장
        const { data, error } = await supabase
          .from('users')
          .upsert({
            id: authResult.user.uid,
            username: authResult.user.username,
            created_at: new Date().toISOString()
          }, {
            onConflict: 'username'
          });

        if (error) {
          alert('사용자 정보 저장에 실패했습니다. 다시 시도해주세요.');
          return;
        }

        setAuth(authResult);
        localStorage.setItem('pi_auth', JSON.stringify(authResult));
        alert(`환영합니다! ${authResult.user.username}님의 인증이 완료되었습니다.`);
      } else {
        alert(`인증 실패: ${responseData.error || '사용자 검증에 실패했습니다.'}`);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      if (error instanceof Error) {
        if (error.message.includes('User cancelled')) {
          alert('사용자가 인증을 취소했습니다.');
        } else if (error.message.includes('Network error')) {
          alert('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
        } else {
          alert(`인증 오류: ${error.message}`);
        }
      } else {
        alert('알 수 없는 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };

  useEffect(() => {
    const savedAuth = localStorage.getItem('pi_auth');
    if (savedAuth) {
      setAuth(JSON.parse(savedAuth));
    }
  }, []);

  const isActivePath = (path: string) => {
    if (path === '/') {
      return currentPath === '/' ? "text-purple-400" : "text-white hover:text-purple-400";
    }
    return currentPath.startsWith(path) ? "text-purple-400" : "text-white hover:text-purple-400";
  };

  return (
    <nav className="bg-[#242424] text-white p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          {/* 로고 영역 */}
          <div className="flex items-center space-x-4">
            <img src="/picoin_logo.png" alt="Logo" className="w-12 h-12 rounded-full" />
            <h1 className="text-xl font-bold">Pi-Moderator</h1>
          </div>

          {/* 데스크톱 메뉴 */}
          <div className="hidden md:flex items-center space-x-12">
            <Link to="/" className={`text-lg font-medium ${isActivePath('/')}`}>Home</Link>
            <Link to="/pi" className={`text-lg font-medium ${isActivePath('/pi')}`}>Pi</Link>
            <Link to="/map" className={`text-lg font-medium ${isActivePath('/map')}`}>Map</Link>
            <Link to="/user" className={`text-lg font-medium ${isActivePath('/user')}`}>User</Link>
          </div>

          {/* 데스크톱 인증 영역 */}
          <div className="hidden md:flex items-center space-x-4">
            <span id="userStatus" className="text-white">
              {auth ? `사용자: ${auth.user.username}` : '로그인이 필요합니다'}
            </span>
            {auth ? (
              <div className="flex space-x-2">
                <button
                  className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                  onClick={authenticateUser}
                >
                  재인증
                </button>
              </div>
            ) : (
              <button
                id="piAuthButton"
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                onClick={authenticateUser}
              >
                Pi Network 인증
              </button>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* 모바일 메뉴 */}
        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} pt-4`}>
          <div className="flex flex-col space-y-4">
            <Link to="/" className={`py-2 ${isActivePath('/')}`} onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            <Link to="/pi" className={`py-2 ${isActivePath('/pi')}`} onClick={() => setIsMenuOpen(false)}>
              Pi
            </Link>
            <Link to="/map" className={`py-2 ${isActivePath('/map')}`} onClick={() => setIsMenuOpen(false)}>
              Map
            </Link>
            <Link to="/user" className={`py-2 ${isActivePath('/user')}`} onClick={() => setIsMenuOpen(false)}>
              User
            </Link>

            {/* 모바일 인증 영역 */}
            <div className="pt-4 border-t border-gray-600">
              <span id="mobileUserStatus" className="block text-white mb-4">
                {auth ? `사용자: ${auth.user.username}` : '로그인이 필요합니다'}
              </span>
              {auth ? (
                <div className="flex space-x-2">
                  <button
                    className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                    onClick={authenticateUser}
                  >
                    재인증
                  </button>
                </div>
              ) : (
                <button
                  id="mobilePiAuthButton"
                  className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                  onClick={authenticateUser}
                >
                  Pi Network 인증
                </button>
              )}
            </div>
          </div>
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
        <script src="https://sdk.minepi.com/pi-sdk.js"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function() {
              window.Pi.init({ version: "2.0", sandbox: false });
            });
          `
        }} />
      </head>
      <body className="flex flex-col min-h-screen"> {/* flex와 min-h-screen 추가 */}
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <footer className="bg-[#242424] text-white py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-6">
                <a
                  href="mailto:pi.moderator.official@gmail.com"
                  className="flex items-center space-x-2 hover:text-purple-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>E-mail</span>
                </a>
              </div>
              <div className="text-sm text-gray-400">
                © 2024 Pi-Moderator. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
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