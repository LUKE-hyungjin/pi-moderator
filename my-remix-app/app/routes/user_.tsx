import { useState, useEffect } from 'react';
import { FaCopy } from 'react-icons/fa';
import { Link, useNavigate } from '@remix-run/react';
import { supabase } from '~/lib/supabase.client';

interface AuthResult {
    accessToken: string;
    user: {
        uid: string;
        username: string;
    };
}

export default function User() {
    const [auth, setAuth] = useState<AuthResult | null>(null);
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const savedAuth = localStorage.getItem('pi_auth');
        if (savedAuth) {
            const authData = JSON.parse(savedAuth);
            setAuth(authData);
        }
    }, []);

    if (!auth) {
        return (
            <div className="p-4">
                <h2 className="text-3xl font-bold mb-6">사용자</h2>
                <p className="text-gray-400">로그인이 필요합니다.</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-3xl font-bold mb-6">사용자 정보</h2>

            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl">
                <div className="mb-4">
                    <label className="text-gray-400 block mb-2">사용자 이름</label>
                    <p className="text-xl font-semibold">{auth.user.username}</p>
                </div>

                <div className="mt-6 text-sm text-gray-400">
                    <p>User ID: {auth.user.uid}</p>
                </div>

                {/* 로그인 시 장소 추가 버튼 표시 */}
                <div className="mt-6">
                    <button
                        onClick={() => navigate('/user/map')}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg inline-block"
                    >
                        장소 추가하기
                    </button>
                </div>
            </div>
        </div>
    );
}