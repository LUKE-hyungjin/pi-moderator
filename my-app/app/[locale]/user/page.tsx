'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/routing';

// Pi Network 인증 타입
interface PiUser {
    uid: string;
    username: string;
}

interface AuthResult {
    accessToken: string;
    user: PiUser;
}

interface UserData {
    id: string;
    username: string;
    points: number;
    last_login_date: string;
}

export default function UserProfilePage() {
    const t = useTranslations('User');
    const router = useRouter();
    const [auth, setAuth] = useState<AuthResult | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isPiBrowser, setIsPiBrowser] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [nextRewardAvailable, setNextRewardAvailable] = useState<string>('Now');

    useEffect(() => {
        // Pi Browser 확인
        setIsPiBrowser(typeof window !== 'undefined' && !!window.Pi);

        // 인증 데이터 로드
        const savedAuth = localStorage.getItem('pi_auth');
        if (savedAuth) {
            try {
                const authData = JSON.parse(savedAuth);
                setAuth(authData);
                fetchUserData(authData.user.uid);
            } catch (error) {
                console.error("저장된 인증 정보 파싱 오류:", error);
                localStorage.removeItem('pi_auth');
            }
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchUserData = async (piUid: string) => {
        try {
            const response = await fetch(`/api/users?pi_uid=${piUid}`);
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    setUserData(data[0]);

                    // 다음 보상 시간 계산
                    const lastLogin = new Date(data[0].last_login_date);
                    const now = new Date();
                    const tomorrow = new Date(lastLogin);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(0, 0, 0, 0);

                    if (now < tomorrow) {
                        const hours = Math.floor((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60));
                        const minutes = Math.floor(((tomorrow.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60));

                        if (hours > 0) {
                            setNextRewardAvailable(`${hours}h ${minutes}m`);
                        } else {
                            setNextRewardAvailable(`${minutes}m`);
                        }
                    } else {
                        setNextRewardAvailable('Now');
                    }
                }
            }
        } catch (error) {
            console.error("사용자 데이터 로드 오류:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 로딩 중 상태
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[70vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    // Pi Browser가 아니거나 인증되지 않은 경우
    if (!isPiBrowser || !auth) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-md mx-auto bg-zinc-900 rounded-lg overflow-hidden shadow-lg p-8 text-center">
                    <Avatar className="mx-auto h-20 w-20 mb-6">
                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-2xl">
                            π
                        </AvatarFallback>
                    </Avatar>
                    <h1 className="text-2xl font-bold mb-4">{t('auth_required')}</h1>
                    <p className="text-gray-400 mb-8">
                        {t('auth_message')}<br />
                        {t('pi_browser_required')}
                    </p>
                    <Button
                        onClick={() => router.push('/')}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full rounded-full"
                    >
                        {t('go_home')}
                    </Button>
                </div>
            </div>
        );
    }

    // 인증된 사용자 정보 표시
    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold mb-12 text-center">{t('title')}</h1>

            <div className="max-w-md mx-auto bg-zinc-900 rounded-lg overflow-hidden shadow-lg">
                <div className="p-8 text-center">
                    <Avatar className="mx-auto h-24 w-24 mb-6">
                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white text-2xl">
                            {auth.user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    <div className="mb-8">
                        <h2 className="text-gray-400 text-lg mb-2">{t('username')}</h2>
                        <p className="text-5xl font-bold text-white">{auth.user.username}</p>
                    </div>

                    <Button
                        onClick={() => router.push('/map/add-place')}
                        className="bg-green-500 hover:bg-green-600 w-full rounded-lg text-xl py-6 mb-8"
                    >
                        {t('add_place')}
                    </Button>

                    <div className="bg-zinc-800 p-6 rounded-lg">
                        <h2 className="text-gray-400 text-lg mb-2">{t('tokens')}</h2>
                        <p className="text-5xl font-bold text-white mb-4">
                            {userData?.points || 0}
                        </p>
                        <p className="text-gray-400">
                            {t('next_reward')}: {nextRewardAvailable}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 