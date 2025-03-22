'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link as I18nLink } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetClose,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Menu, X, ChevronDown } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { AlertModal } from '@/components/AlertModal';
import Script from 'next/script';
import { ThemeToggle } from '@/components/ThemeToggle';

// Pi Network 인증 타입
interface PiUser {
    uid: string;
    username: string;
}

interface AuthResult {
    accessToken: string;
    user: PiUser;
}

interface PaymentDTO {
    identifier: string;
    transaction?: { txid: string };
}

// Pi Network 타입 정의
declare global {
    interface Window {
        Pi?: {
            init: (options: { version: string; sandbox: boolean }) => void;
            authenticate: (scopes: string[], onIncompletePaymentFound: (payment: PaymentDTO) => Promise<void>) => Promise<AuthResult>;
        };
    }
}

export default function Navbar() {
    const t = useTranslations('Navbar');
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [auth, setAuth] = useState<AuthResult | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [sdkLoaded, setSdkLoaded] = useState(false);
    const [servicesOpen, setServicesOpen] = useState(false);

    // 메인 네비게이션 링크
    const navLinks = [
        { href: '/', label: t('home') },
        {
            href: '#',
            label: t('services'),
            hasSubmenu: true,
            submenu: [
                { href: '/service?type=education', label: t('education') },
                { href: '/service?type=exchange', label: t('exchange') },
                { href: '/service?type=tax', label: t('tax') },
            ]
        },
        { href: '/map', label: t('map') },
        { href: '/user', label: t('user') },
    ];

    // Pi Network SDK 로드 핸들러
    const handleSdkLoad = () => {
        console.log("Pi SDK 스크립트 로드됨");
        setSdkLoaded(true);
        if (typeof window !== 'undefined' && window.Pi) {
            console.log("Pi SDK 초기화:", window.Pi);
            window.Pi.init({ version: "2.0", sandbox: true });
        }
    };

    // Pi Network 초기화 및 기존 인증 정보 로드
    useEffect(() => {
        console.log("컴포넌트 마운트");

        // 기존 인증 데이터 복원
        const savedAuth = localStorage.getItem('pi_auth');
        if (savedAuth) {
            try {
                setAuth(JSON.parse(savedAuth));
            } catch (error) {
                console.error("저장된 인증 정보 파싱 오류:", error);
                localStorage.removeItem('pi_auth');
            }
        }
    }, []);

    // 미완료 결제 처리
    const onIncompletePaymentFound = async (payment: PaymentDTO) => {
        console.log("미완료 결제 발견:", payment);
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
            console.error('미완료 결제 처리 오류:', error);
        }
    };

    // Pi Network 인증
    const authenticateUser = async () => {
        if (!window.Pi) {
            setAlertMessage("Pi Browser에서 접속해 주세요.");
            setIsAlertOpen(true);
            return;
        }

        try {
            // Pi Network 인증 요청
            const scopes = ['username', 'payments'];
            const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);

            // 서버에 인증 정보 검증 요청
            const verifyResponse = await fetch('/api/pi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'verify_user',
                    authResult
                })
            });
            console.log(verifyResponse);

            if (verifyResponse.ok) {
                const { userData, canReceiveReward, now } = await verifyResponse.json();

                if (canReceiveReward) {
                    // 일일 보상 지급
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

                    setAlertMessage(`환영합니다!\n ${authResult.user.username}님의 인증이 완료되었습니다.\n일일 로그인 보상 1 파이 지급되었습니다!`);
                } else {
                    setAlertMessage(`환영합니다!\n ${authResult.user.username}님의 인증이 완료되었습니다.`);
                }

                // 인증 정보 저장
                setAuth(authResult);
                localStorage.setItem('pi_auth', JSON.stringify(authResult));
                setIsAlertOpen(true);
            } else {
                const responseData = await verifyResponse.json();
                throw new Error(responseData.error || '사용자 검증에 실패했습니다.');
            }
        } catch (error) {
            console.error("인증 오류:", error);
            if (error instanceof Error) {
                setAlertMessage(
                    error.message.includes('User cancelled')
                        ? '사용자가 인증을 취소했습니다.'
                        : error.message.includes('Network error')
                            ? '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.'
                            : `인증 오류: ${error.message}`
                );
                setIsAlertOpen(true);
            }
        }
    };

    // 로그아웃
    const handleSignOut = () => {
        setAuth(null);
        localStorage.removeItem('pi_auth');
        setAlertMessage("로그아웃 되었습니다.");
        setIsAlertOpen(true);
    };

    return (
        <>
            <Script
                src="https://sdk.minepi.com/pi-sdk.js"
                onLoad={handleSdkLoad}
                strategy="afterInteractive"
            />
            <nav className="sticky top-0 w-full dark:bg-black/95 bg-white/95 backdrop-blur-md dark:text-white text-black border-b dark:border-white/10 border-black/10 shadow-lg z-100">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    {/* 로고와 데스크톱 네비게이션 */}
                    <div className="flex items-center gap-6">
                        {/* 로고 */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500 transition-transform group-hover:scale-110">
                                <Image
                                    src="/images/picoin_logo.png"
                                    alt="Pi Coin Logo"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                            <span className="font-bold text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Pi-Moderator</span>
                        </Link>

                        {/* 데스크톱 네비게이션 */}
                        <div className="hidden md:flex items-center gap-6">
                            {navLinks.map((link, index) => (
                                link.hasSubmenu ? (
                                    <Popover key={index} open={servicesOpen} onOpenChange={setServicesOpen}>
                                        <PopoverTrigger asChild>
                                            <button
                                                className="flex items-center gap-1 hover:text-purple-400 transition-colors relative group py-1"
                                                onClick={() => setServicesOpen(!servicesOpen)}
                                            >
                                                {link.label}
                                                <ChevronDown className="h-4 w-4" />
                                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover:w-full"></span>
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-2 w-48 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shadow-lg rounded-md z-150">
                                            <div className="flex flex-col space-y-1">
                                                {link.submenu.map((subitem, subindex) => (
                                                    <I18nLink
                                                        key={subindex}
                                                        href={subitem.href}
                                                        className="hover:bg-gray-100 dark:hover:bg-zinc-800 px-3 py-2 rounded-md transition-colors"
                                                        onClick={() => setServicesOpen(false)}
                                                    >
                                                        {subitem.label}
                                                    </I18nLink>
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                ) : (
                                    <I18nLink
                                        key={index}
                                        href={link.href}
                                        className="hover:text-purple-400 transition-colors relative group py-1"
                                    >
                                        {link.label}
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover:w-full"></span>
                                    </I18nLink>
                                )
                            ))}
                        </div>
                    </div>

                    {/* 중앙 여백 */}
                    <div className="flex-1"></div>

                    {/* 유틸리티 메뉴 */}
                    <div className="flex items-center gap-4">
                        {/* 데스크톱 유틸리티 메뉴 */}
                        <div className="hidden md:flex items-center gap-3">
                            <ThemeToggle />
                            <LanguageSwitcher />
                            {auth ? (
                                <div className="flex items-center gap-3">
                                    <span className="text-purple-300 text-sm">{auth.user.username}</span>
                                    <Button
                                        variant="destructive"
                                        onClick={handleSignOut}
                                        className="rounded-full"
                                    >
                                        {t('logout')}
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <span className="dark:text-gray-400 text-gray-600 text-sm">{t('login_required')}</span>
                                    <I18nLink href="/user">
                                        <Button
                                            onClick={authenticateUser}
                                            className="bg-gradient-to-r text-white from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full"
                                        >
                                            {t('auth')}
                                        </Button>
                                    </I18nLink>
                                </>
                            )}
                        </div>

                        {/* 모바일 메뉴 버튼 */}
                        <div className="md:hidden flex items-center gap-3">
                            <ThemeToggle />
                            <LanguageSwitcher />
                            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="hover:bg-white/10">
                                        <Menu className="h-6 w-6" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="bg-zinc-900/98 text-white border-l border-white/10 shadow-xl z-150">
                                    <SheetHeader>
                                        <SheetTitle className="text-white text-xl">{t('menu')}</SheetTitle>
                                    </SheetHeader>
                                    <div className="flex flex-col gap-8 mt-10 text-center">
                                        {navLinks.map((link, index) => (
                                            link.hasSubmenu ? (
                                                <div key={index} className="flex flex-col gap-4">
                                                    <div className="text-lg text-purple-400 font-medium">
                                                        {link.label}
                                                    </div>
                                                    <div className="flex flex-col gap-3 pl-4">
                                                        {link.submenu.map((subitem, subindex) => (
                                                            <SheetClose asChild key={subindex}>
                                                                <I18nLink
                                                                    href={subitem.href}
                                                                    className="text-base hover:text-purple-400 transition-colors"
                                                                    onClick={() => setIsOpen(false)}
                                                                >
                                                                    {subitem.label}
                                                                </I18nLink>
                                                            </SheetClose>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <SheetClose asChild key={index}>
                                                    <I18nLink
                                                        href={link.href}
                                                        className="text-lg hover:text-purple-400 transition-colors flex items-center justify-center"
                                                        onClick={() => setIsOpen(false)}
                                                    >
                                                        {link.label}
                                                    </I18nLink>
                                                </SheetClose>
                                            )
                                        ))}
                                        <hr className="border-white/10" />
                                        {auth ? (
                                            <>
                                                <span className="text-purple-300 text-sm">{auth.user.username}</span>
                                                <Button
                                                    variant="destructive"
                                                    className="w-full rounded-full"
                                                    onClick={() => {
                                                        handleSignOut();
                                                        setIsOpen(false);
                                                    }}
                                                >
                                                    {t('logout')}
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-gray-400 text-sm">{t('login_required')}</span>
                                                <I18nLink href="/user">
                                                    <Button
                                                        className="text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full rounded-full"
                                                        onClick={() => {
                                                            authenticateUser();
                                                            setIsOpen(false);
                                                        }}
                                                    >
                                                        {t('auth')}
                                                    </Button>
                                                </I18nLink>
                                            </>
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </nav>
            {/* 알림 모달 */}
            <AlertModal
                isOpen={isAlertOpen}
                onClose={() => setIsAlertOpen(false)}
                message={alertMessage}
            />
        </>
    );
} 