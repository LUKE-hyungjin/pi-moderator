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
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import React from 'react';

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
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPlaces, setFilteredPlaces] = useState<PlaceData[]>([]);
    const [profileHeight, setProfileHeight] = useState(0);
    const profileRef = React.useRef<HTMLDivElement>(null);

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
        // 프로필 컨테이너 높이 측정
        if (profileRef.current && isDesktop) {
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    setProfileHeight(entry.contentRect.height);
                }
            });

            resizeObserver.observe(profileRef.current);
            return () => {
                resizeObserver.disconnect();
            };
        }
    }, [isDesktop, auth]);

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
            const response = await fetch(`/api/users?id=${piUid}`);
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

    // 검색어에 따라 장소 필터링
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredPlaces(myPlaces);
            return;
        }

        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filtered = myPlaces.filter(place =>
            place.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            place.address.toLowerCase().includes(lowerCaseSearchTerm)
        );

        setFilteredPlaces(filtered);
    }, [searchTerm, myPlaces]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // 로그인 함수 추가
    const handleRewardClaim = async () => {
        try {
            setIsLoading(true);

            // Pi 브라우저에서 PI SDK를 사용하여 인증 정보 새로고침
            if (typeof window.Pi !== 'undefined' && auth) {
                // Pi 로그인 시작
                const scopes = ['username', 'payments', 'wallet_address'];

                try {
                    // Pi Network SDK 문서에 따라 콜백 함수를 정확하게 전달합니다
                    const authResult = await window.Pi.authenticate(scopes, () => {
                        // Promise를 반환하는 빈 콜백 함수
                        return Promise.resolve();
                    });

                    if (authResult) {
                        // 서버에 로그인 정보 전송하여 토큰 보상 요청
                        const response = await fetch('/api/users/claim-reward', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                piUid: authResult.user.uid,
                                username: authResult.user.username,
                            }),
                        });

                        if (response.ok) {
                            const data = await response.json();
                            // 인증 정보 저장
                            localStorage.setItem('pi_auth', JSON.stringify(authResult));
                            setAuth(authResult);

                            // 사용자 데이터 새로고침
                            fetchUserData(authResult.user.uid);

                            // 성공 메시지 표시
                            alert(t('reward_claimed_success', { points: data.pointsAwarded }));
                        } else {
                            const errorData = await response.json();
                            throw new Error(errorData.error || t('reward_claim_error'));
                        }
                    }
                } catch (authError) {
                    console.error("Pi 인증 오류:", authError);
                    throw new Error(t('reward_claim_error'));
                }
            }
        } catch (error) {
            console.error("보상 청구 오류:", error);
            alert(error instanceof Error ? error.message : t('reward_claim_error'));
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

            <div className={`${isDesktop ? 'grid grid-cols-1 lg:grid-cols-3 gap-8' : ''}`} style={{ minHeight: '600px' }}>
                <div className={`${isDesktop ? 'lg:col-span-1' : ''}`}>
                    <div ref={profileRef} className="max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-lg overflow-hidden shadow-lg mb-8 lg:mb-0 border border-gray-200 dark:border-zinc-800">
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
                                <h2 className="text-gray-600 dark:text-gray-400 text-lg mb-2">{t('username')}</h2>
                                <p className="text-5xl font-bold text-gray-900 dark:text-white">{auth.user.username}</p>
                            </div>

                            <Button
                                onClick={() => router.push('/map/add-place')}
                                className="bg-green-500 hover:bg-green-600 text-white w-full rounded-lg text-xl py-6 mb-8"
                            >
                                {t('add_place')}
                            </Button>

                            <div className="bg-gray-100 dark:bg-zinc-800 p-6 rounded-lg">
                                <h2 className="text-gray-600 dark:text-gray-400 text-lg mb-2">{t('tokens')}</h2>
                                <p className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
                                    {userData?.points || 0}
                                </p>

                                {nextRewardAvailable === 'Now' ? (
                                    <Button
                                        onClick={handleRewardClaim}
                                        disabled={isLoading}
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white w-full rounded-lg mb-4"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                {t('claiming_reward')}
                                            </div>
                                        ) : (
                                            t('claim_reward_now')
                                        )}
                                    </Button>
                                ) : (
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {t('next_reward')}: {nextRewardAvailable}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`${isDesktop ? 'lg:col-span-2' : ''}`}>
                    <div className="bg-white dark:bg-zinc-900 rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-zinc-800" style={isDesktop ? { height: '600px' } : {}}>
                        <div className="p-6 flex flex-col h-full">
                            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('my_places')}</h2>
                                <div className="relative w-full sm:w-64">
                                    <div className="relative rounded-full overflow-hidden">
                                        <Input
                                            type="text"
                                            placeholder={t('search_places')}
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-full"
                                        />
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            {myPlaces.length === 0 ? (
                                <div className="text-center py-12 flex-grow flex flex-col justify-center">
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">{t('no_places')}</p>
                                    <Button
                                        onClick={() => router.push('/map/add-place')}
                                        className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg mx-auto"
                                    >
                                        {mapT('add_place')}
                                    </Button>
                                </div>
                            ) : (
                                <div className="overflow-auto" style={{ height: 'calc(100% - 70px)' }}>
                                    <Table>
                                        <TableHeader className="sticky top-0 bg-gray-50 dark:bg-zinc-900 z-10">
                                            <TableRow className="border-b border-gray-200 dark:border-zinc-700">
                                                <TableHead className="text-gray-900 dark:text-white">{t('place_name')}</TableHead>
                                                <TableHead className="hidden md:table-cell text-gray-900 dark:text-white">{t('place_type')}</TableHead>
                                                <TableHead className="hidden md:table-cell text-gray-900 dark:text-white">{t('place_address')}</TableHead>
                                                <TableHead className="text-gray-900 dark:text-white">{t('place_action')}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredPlaces.map((place) => (
                                                <TableRow key={place.id} className="border-b border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                                    <TableCell className="font-medium text-gray-900 dark:text-white">{place.name}</TableCell>
                                                    <TableCell className="hidden md:table-cell text-gray-700 dark:text-gray-300">
                                                        <Badge className={getTypeBadgeColor(place.type)}>
                                                            {getTypeName(place.type)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell truncate max-w-[200px] text-gray-700 dark:text-gray-300">
                                                        {place.address}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            onClick={() => handleEditPlace(place.id)}
                                                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
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