'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

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

// 장소 데이터 타입
interface PlaceData {
    id: string;
    name: string;
    address: string;
    type: string;
    created_at: string;
}

export default function UserProfilePage() {
    const t = useTranslations('User');
    const mapT = useTranslations('Map');
    const router = useRouter();
    const [auth, setAuth] = useState<AuthResult | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isPiBrowser, setIsPiBrowser] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [nextRewardAvailable, setNextRewardAvailable] = useState<string>('Now');
    const [myPlaces, setMyPlaces] = useState<PlaceData[]>([]);
    const [isDesktop, setIsDesktop] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        // 화면 크기 감지
        const checkIsDesktop = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };

        checkIsDesktop();
        window.addEventListener('resize', checkIsDesktop);

        return () => {
            window.removeEventListener('resize', checkIsDesktop);
        };
    }, []);

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
                fetchMyPlaces(authData.user.uid);
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

    const fetchMyPlaces = async (piUid: string) => {
        try {
            const { data, error } = await supabase
                .from('markers')
                .select('id, name, address, type, created_at')
                .eq('created_by', piUid)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("장소 데이터 로드 오류:", error);
                return;
            }

            if (data) {
                setMyPlaces(data as PlaceData[]);
            }
        } catch (error) {
            console.error("장소 데이터 로드 오류:", error);
        }
    };

    const handleEditPlace = (placeId: string) => {
        router.push(`/map/edit-place/${placeId}`);
    };

    const getTypeBadgeColor = (type: string) => {
        switch (type) {
            case 'education':
                return 'bg-blue-500 hover:bg-blue-600';
            case 'exchange':
                return 'bg-pink-500 hover:bg-pink-600';
            case 'tax':
                return 'bg-green-500 hover:bg-green-600';
            default:
                return 'bg-purple-500 hover:bg-purple-600';
        }
    };

    const getTypeName = (type: string) => {
        switch (type) {
            case 'education':
                return mapT('education');
            case 'exchange':
                return mapT('exchange');
            case 'tax':
                return mapT('tax');
            default:
                return type;
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
                    <div className="relative w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-4 border-purple-500 shadow-lg shadow-purple-500/30 transition-transform hover:scale-105 duration-300">
                        <Image
                            src="/images/picoin_logo.png"
                            alt="Pi Coin Logo"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                    <h1 className="text-white text-2xl font-bold mb-4">{t('auth_required')}</h1>
                    <p className="text-gray-400 mb-8">
                        {t('auth_message')}<br />
                        {t('pi_browser_required')}
                    </p>
                    <Button
                        onClick={() => router.push('/')}
                        className="bg-gradient-to-r text-white from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full rounded-full"
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

            <div className={`${isDesktop ? 'grid grid-cols-1 lg:grid-cols-3 gap-8' : ''}`}>
                <div className={`${isDesktop ? 'lg:col-span-1' : ''}`}>
                    <div className="max-w-md mx-auto bg-zinc-900 rounded-lg overflow-hidden shadow-lg mb-8">
                        <div className="p-8 text-center">
                            <div className="relative w-28 h-28 mx-auto mb-6 rounded-full overflow-hidden border-4 border-purple-500 shadow-lg shadow-purple-500/30 transition-transform hover:scale-105 duration-300">
                                <Image
                                    src="/images/picoin_logo.png"
                                    alt={`${auth.user.username}'s profile`}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>

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

                <div className={`${isDesktop ? 'lg:col-span-2' : ''}`}>
                    <div className="bg-zinc-900 rounded-lg overflow-hidden shadow-lg">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-6 text-white">{t('my_places')}</h2>

                            {myPlaces.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-400 mb-6">{t('no_places')}</p>
                                    <Button
                                        onClick={() => router.push('/map/add-place')}
                                        className="bg-purple-500 hover:bg-purple-600 rounded-lg"
                                    >
                                        {mapT('add_place')}
                                    </Button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>{t('place_name')}</TableHead>
                                                <TableHead className="hidden md:table-cell">{t('place_type')}</TableHead>
                                                <TableHead className="hidden md:table-cell">{t('place_address')}</TableHead>
                                                <TableHead>{t('place_action')}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {myPlaces.map((place) => (
                                                <TableRow key={place.id}>
                                                    <TableCell className="font-medium">{place.name}</TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        <Badge className={getTypeBadgeColor(place.type)}>
                                                            {getTypeName(place.type)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell truncate max-w-[200px]">
                                                        {place.address}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            onClick={() => handleEditPlace(place.id)}
                                                            className="bg-blue-500 hover:bg-blue-600 rounded-lg"
                                                            size="sm"
                                                        >
                                                            {t('edit_place')}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 