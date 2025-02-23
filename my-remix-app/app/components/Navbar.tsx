import { Link, useLocation } from "@remix-run/react";
import { useState, useEffect } from "react";
import type { AuthResult, PaymentDTO } from "~/types";
import { AlertModal } from "./AlertModal";

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [auth, setAuth] = useState<AuthResult | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const location = useLocation();

    useEffect(() => {
        if (window.Pi) {
            window.Pi.init({ version: "2.0", sandbox: true });
        }

        const savedAuth = localStorage.getItem('pi_auth');
        if (savedAuth) {
            setAuth(JSON.parse(savedAuth));
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
            const scopes = ['username', 'payments'];
            const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);

            const verifyResponse = await fetch('/api/pi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'verify_user',
                    authResult
                })
            });

            if (verifyResponse.ok) {
                const { userData, canReceiveReward, now } = await verifyResponse.json();

                if (canReceiveReward) {
                    await fetch('/api/pi', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'update_user',
                            userId: authResult.user.uid,
                            username: authResult.user.username,
                            userData,
                            now
                        })
                    });

                    setAlertMessage(`환영합니다!\n ${authResult.user.username}님의 인증이 완료되었습니다.\n일일 로그인 보상 1 TOKEN 지급되었습니다!`);
                } else {
                    setAlertMessage(`환영합니다!\n ${authResult.user.username}님의 인증이 완료되었습니다.`);
                }

                setAuth(authResult);
                localStorage.setItem('pi_auth', JSON.stringify(authResult));
                setIsAlertOpen(true);
            } else {
                const responseData = await verifyResponse.json();
                throw new Error(responseData.error || '사용자 검증에 실패했습니다.');
            }
        } catch (error) {
            console.error("Authentication error:", error);
            if (error instanceof Error) {
                alert(error.message.includes('User cancelled')
                    ? '사용자가 인증을 취소했습니다.'
                    : error.message.includes('Network error')
                        ? '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.'
                        : `인증 오류: ${error.message}`);
            }
        }
    };

    const isActivePath = (path: string) => {
        if (path === '/') {
            return location.pathname === '/' ? "text-purple-400" : "text-white hover:text-purple-400";
        }
        return location.pathname.startsWith(path) ? "text-purple-400" : "text-white hover:text-purple-400";
    };

    return (
        <>
            <nav className="bg-[#1a1a1a] text-white p-4">
                <div className="container mx-auto">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <img src="/picoin_logo.png" alt="Logo" className="w-12 h-12 rounded-full" />
                            <Link to="/" className="text-xl font-bold hover:text-purple-400">
                                Pi-Moderator
                            </Link>
                        </div>

                        <div className="hidden md:flex items-center space-x-12">
                            <Link to="/" className={`text-lg font-medium ${isActivePath('/')}`}>Home</Link>
                            <Link to="/pi" className={`text-lg font-medium ${isActivePath('/pi')}`}>Pi</Link>
                            <Link to="/map" className={`text-lg font-medium ${isActivePath('/map')}`}>Map</Link>
                            <Link to="/user" className={`text-lg font-medium ${isActivePath('/user')}`}>User</Link>
                        </div>

                        <div className="hidden md:flex items-center space-x-4">
                            <span className="text-white">
                                {auth ? `사용자: ${auth.user.username}` : '로그인이 필요합니다'}
                            </span>
                            {auth ? (
                                <button
                                    className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                                    onClick={authenticateUser}
                                >
                                    재인증
                                </button>
                            ) : (
                                <button
                                    className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                                    onClick={authenticateUser}
                                >
                                    Pi Network 인증
                                </button>
                            )}
                        </div>

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

                    <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} pt-4`}>
                        <div className="flex flex-col space-y-4">
                            <Link to="/" className={`py-2 ${isActivePath('/')}`} onClick={() => setIsMenuOpen(false)}>Home</Link>
                            <Link to="/pi" className={`py-2 ${isActivePath('/pi')}`} onClick={() => setIsMenuOpen(false)}>Pi</Link>
                            <Link to="/map" className={`py-2 ${isActivePath('/map')}`} onClick={() => setIsMenuOpen(false)}>Map</Link>
                            <Link to="/user" className={`py-2 ${isActivePath('/user')}`} onClick={() => setIsMenuOpen(false)}>User</Link>

                            <div className="pt-4 border-t border-gray-600">
                                <span className="block text-white mb-4">
                                    {auth ? `사용자: ${auth.user.username}` : '로그인이 필요합니다'}
                                </span>
                                {auth ? (
                                    <button
                                        className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                                        onClick={authenticateUser}
                                    >
                                        재인증
                                    </button>
                                ) : (
                                    <button
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
            <AlertModal
                isOpen={isAlertOpen}
                onClose={() => setIsAlertOpen(false)}
                message={alertMessage}
            />
        </>
    );
} 