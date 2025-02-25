import { Link, useLocation } from "@remix-run/react";
import { useState, useEffect } from "react";
import type { AuthResult, PaymentDTO, TranslationValue } from "~/types";
import { AlertModal } from "./AlertModal";
import { useTranslation } from '~/hooks/useTranslation';
import { useLanguage } from "~/contexts/LanguageContext";
import { translateToString } from "~/i18n/translations";

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [auth, setAuth] = useState<AuthResult | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const location = useLocation();
    const { language, setLanguage } = useLanguage();
    const { t } = useTranslation(language);

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
                        <div className="w-[100px] lg:w-[250px] flex items-center space-x-2 lg:space-x-4 shrink-0">
                            <img src="/picoin_logo.png" alt="Logo" className="w-10 h-10 lg:w-12 lg:h-12 rounded-full" />
                            <Link to="/" className="text-lg lg:text-xl font-bold hover:text-purple-400 whitespace-nowrap">
                                Pi-Moderator
                            </Link>
                        </div>

                        <div className="flex-1 hidden md:flex justify-center px-4">
                            <div className="inline-flex items-center space-x-6 lg:space-x-16">
                                <Link to="/" className={`text-base lg:text-lg font-medium whitespace-nowrap transition-colors duration-200 ${isActivePath('/')}`}>
                                    {translateToString(t('nav.home'))}
                                </Link>
                                <Link to="/pi" className={`text-base lg:text-lg font-medium whitespace-nowrap transition-colors duration-200 ${isActivePath('/pi')}`}>
                                    {translateToString(t('nav.pi'))}
                                </Link>
                                <Link to="/map" className={`text-base lg:text-lg font-medium whitespace-nowrap transition-colors duration-200 ${isActivePath('/map')}`}>
                                    {translateToString(t('nav.map'))}
                                </Link>
                                <Link to="/user" className={`text-base lg:text-lg font-medium whitespace-nowrap transition-colors duration-200 ${isActivePath('/user')}`}>
                                    {translateToString(t('nav.user'))}
                                </Link>
                            </div>
                        </div>

                        <div className="w-[180px] lg:w-[300px] hidden md:flex items-center justify-end shrink-0">
                            <div className="flex items-center space-x-2">
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value as 'ko' | 'en')}
                                    className="bg-[#333] text-white px-3 py-1.5 rounded-md text-sm border border-[#444] 
                                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                                    hover:bg-[#444] transition-colors duration-200"
                                >
                                    <option value="ko">한국어</option>
                                    <option value="en">English</option>
                                </select>
                                <span className="text-white text-sm lg:text-base truncate">
                                    {auth ? `${translateToString(t('nav.user'))}: ${auth.user.username}` : translateToString(t('nav.login_required'))}
                                </span>
                                {auth ? (
                                    <button
                                        className="bg-purple-500 text-white px-2 py-1 lg:px-4 lg:py-2 text-sm lg:text-base rounded hover:bg-purple-600 whitespace-nowrap"
                                        onClick={authenticateUser}
                                    >
                                        {translateToString(t('nav.reauth'))}
                                    </button>
                                ) : (
                                    <button
                                        className="bg-purple-500 text-white px-2 py-1 lg:px-4 lg:py-2 text-sm lg:text-base rounded hover:bg-purple-600 whitespace-nowrap"
                                        onClick={authenticateUser}
                                    >
                                        {translateToString(t('nav.pi_auth'))}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* 언어 선택 - 모바일 */}
                            <div className="md:hidden">
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value as 'ko' | 'en')}
                                    className="bg-[#333] text-white px-2 py-1.5 rounded-md text-sm border border-[#444]
                                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="ko">한국어</option>
                                    <option value="en">English</option>
                                </select>
                            </div>

                            {/* 메뉴 버튼 */}
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
                    </div>
                    <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} pt-4`}>
                        <div className="flex flex-col space-y-4">
                            <Link to="/" className={`py-2 ${isActivePath('/')}`} onClick={() => setIsMenuOpen(false)}>
                                {translateToString(t('nav.home'))}
                            </Link>
                            <Link to="/pi" className={`py-2 ${isActivePath('/pi')}`} onClick={() => setIsMenuOpen(false)}>
                                {translateToString(t('nav.pi'))}
                            </Link>
                            <Link to="/map" className={`py-2 ${isActivePath('/map')}`} onClick={() => setIsMenuOpen(false)}>
                                {translateToString(t('nav.map'))}
                            </Link>
                            <Link to="/user" className={`py-2 ${isActivePath('/user')}`} onClick={() => setIsMenuOpen(false)}>
                                {translateToString(t('nav.user'))}
                            </Link>


                            {/* 로그인 상태 및 버튼 */}
                            <div className="py-2 border-t border-gray-700">
                                <div className="flex flex-col space-y-2">
                                    <span className="text-white text-sm">
                                        {auth ? `${translateToString(t('nav.user'))}: ${auth.user.username}` : translateToString(t('nav.login_required'))}
                                    </span>
                                    <button
                                        className="w-full bg-purple-500 text-white px-4 py-2 text-sm rounded hover:bg-purple-600"
                                        onClick={() => {
                                            authenticateUser();
                                            setIsMenuOpen(false);
                                        }}
                                    >
                                        {auth ? translateToString(t('nav.reauth')) : translateToString(t('nav.pi_auth'))}
                                    </button>
                                </div>
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