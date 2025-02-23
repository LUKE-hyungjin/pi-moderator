import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@remix-run/react';
import { supabase } from '~/lib/supabase.client';
import { useLanguage } from "~/contexts/LanguageContext";
import { useTranslation } from "~/hooks/useTranslation";
import { translateToString } from "~/i18n/translations";

interface Marker {
    id: string;
    name: string;
    address: string;
    type: string;
    created_at: string;
    fee_percentage: number;
}

interface UserData {
    points: number;
    last_login_date: string;
}

interface AuthResult {
    accessToken: string;
    user: {
        uid: string;
        username: string;
    };
}

export default function User() {
    const { language } = useLanguage();
    const { t } = useTranslation(language);
    const [auth, setAuth] = useState<AuthResult | null>(null);
    const [markers, setMarkers] = useState<Marker[]>([]);
    const [userData, setUserData] = useState<UserData | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const savedAuth = localStorage.getItem('pi_auth');
        if (savedAuth) {
            const authData = JSON.parse(savedAuth);
            setAuth(authData);
            fetchUserMarkers(authData.user.uid);
            fetchUserData(authData.user.uid);
        }
    }, []);

    const fetchUserMarkers = async (userId: string) => {
        const { data, error } = await supabase
            .from('markers')
            .select('*')
            .eq('created_by', userId)
            .order('created_at', { ascending: false });

        if (data) {
            setMarkers(data);
        }
    };

    const fetchUserData = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('points, last_login_date')
                .eq('id', userId)
                .single();

            if (error) throw error;
            setUserData(data);
        } catch (error) {
            console.error(translateToString(t('user.error.fetch_data')), error);
        }
    };

    const getNextRewardTime = () => {
        if (!userData?.last_login_date) return translateToString(t('user.reward.now'));

        const lastLogin = new Date(userData.last_login_date);
        const nextReward = new Date(lastLogin.getTime() + 24 * 60 * 60 * 1000);
        const now = new Date();
        const timeLeft = nextReward.getTime() - now.getTime();

        if (timeLeft <= 0) return translateToString(t('user.reward.now'));

        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        return `${hoursLeft} ${translateToString(t('user.reward.hour'))} ${minutesLeft}${translateToString(t('user.reward.minute'))}`;

    };

    if (!auth) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <div className="text-center bg-gray-800 rounded-lg p-8 shadow-lg max-w-md w-full">
                    <div className="mb-6">
                        <svg
                            className="mx-auto h-16 w-16 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold mb-4 text-white">{translateToString(t('user.auth.required'))}</h2>
                    <p className="text-gray-400">{translateToString(t('user.auth.description'))}</p>
                    <p className="text-gray-400 mb-6">{translateToString(t('user.auth.pi_browser'))}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[60vh] p-4">
            <div className="max-w-6xl mx-auto">
                {/* 사용자 정보 섹션 */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-8 text-white">{translateToString(t('user.info.title'))}</h2>
                    <div className="bg-gray-800 rounded-xl p-8 shadow-lg max-w-2xl mx-auto">
                        <div className="mb-8">
                            <div className="inline-block bg-purple-500 rounded-full p-4 mb-4">
                                <svg
                                    className="h-12 w-12 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </div>
                            <div className="mb-4">
                                <label className="text-gray-400 block mb-2">{translateToString(t('user.info.username'))}</label>
                                <p className="text-2xl font-semibold text-white">{auth.user.username}</p>
                            </div>
                            <button
                                onClick={() => navigate('/user/map')}
                                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-200"
                            >
                                {translateToString(t('user.action.add_place'))}
                            </button>
                        </div>
                        {/* 포인트 정보 */}
                        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                            <div className="mb-4">
                                <label className="text-gray-400 block mb-2">{translateToString(t('user.info.tokens'))}</label>
                                <p className="text-2xl font-semibold text-white">
                                    {userData?.points || 0}
                                </p>
                            </div>
                            <div className="text-sm text-gray-400">
                                {translateToString(t('user.reward.next_time'))}: {getNextRewardTime()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* 내가 등록한 장소 목록 */}
            <div className="mt-12">
                <h3 className="text-3xl font-bold mb-6 text-center text-white">{translateToString(t('user.places.title'))}</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{translateToString(t('user.places.name'))}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">{translateToString(t('user.places.address'))}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{translateToString(t('user.places.type'))}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{translateToString(t('user.places.fee'))}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">{translateToString(t('user.places.date'))}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{translateToString(t('user.places.actions'))}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {markers.map((marker) => (
                                <tr key={marker.id}>
                                    <td className="px-4 py-4 text-sm text-gray-300">
                                        <div className="line-clamp-2">{marker.name}</div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-300 hidden md:table-cell">
                                        <div className="line-clamp-2">{marker.address}</div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-300">
                                        <div className="line-clamp-1">{translateToString(t(`marker.type.${marker.type}`))}</div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-300 whitespace-nowrap">
                                        {marker.fee_percentage}%
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-300 hidden md:table-cell whitespace-nowrap">
                                        {new Date(marker.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-300 whitespace-nowrap">
                                        <button
                                            onClick={() => navigate(`/user/map/edit/${marker.id}`)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                                        >
                                            {translateToString(t('user.action.edit'))}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}