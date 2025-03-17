'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/lib/supabase/client';
import { Marker, Review, User, InsertMarker, InsertReview, InsertUser } from '@/lib/supabase/types';

export default function PiCoinPage() {
    const t = useTranslations('Home');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [users, setUsers] = useState<User[]>([]);
    const [markers, setMarkers] = useState<Marker[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);

    const supabase = createClient();

    // 데이터 가져오기
    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            // 사용자 데이터 가져오기
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (usersError) throw new Error(`사용자 조회 오류: ${usersError.message}`);
            setUsers(usersData || []);

            // 마커 데이터 가져오기
            const { data: markersData, error: markersError } = await supabase
                .from('markers')
                .select('*')
                .order('created_at', { ascending: false });

            if (markersError) throw new Error(`마커 조회 오류: ${markersError.message}`);
            setMarkers(markersData || []);

            // 리뷰 데이터 가져오기
            const { data: reviewsData, error: reviewsError } = await supabase
                .from('reviews')
                .select('*, users(username)')
                .order('created_at', { ascending: false });

            if (reviewsError) throw new Error(`리뷰 조회 오류: ${reviewsError.message}`);
            setReviews(reviewsData || []);

            setSuccess('데이터를 성공적으로 불러왔습니다.');
        } catch (error: any) {
            setError(`데이터 조회 오류: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // 테스트 사용자 생성
    const createTestUser = async () => {
        setLoading(true);
        setError(null);

        try {
            const testUser: InsertUser = {
                id: uuidv4(),
                username: `사용자_${Math.floor(Math.random() * 1000)}`,
                created_at: new Date().toISOString(),
                is_admin: false,
                points: 0,
                last_login_date: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('users')
                .insert(testUser)
                .select()
                .single();

            if (error) throw new Error(`사용자 생성 오류: ${error.message}`);

            setUsers(prevUsers => [data, ...prevUsers]);
            setSuccess('테스트 사용자가 성공적으로 생성되었습니다.');
        } catch (error: any) {
            setError(`사용자 생성 오류: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // 테스트 마커 생성
    const createTestMarker = async () => {
        setLoading(true);
        setError(null);

        // 사용자가 없으면 생성 불가
        if (users.length === 0) {
            setError('마커를 생성하려면 먼저 사용자를 생성해야 합니다.');
            setLoading(false);
            return;
        }

        try {
            const testMarker: InsertMarker = {
                id: uuidv4(),
                name: `마커_${Math.floor(Math.random() * 1000)}`,
                latitude: 37.5 + (Math.random() * 0.1),
                longitude: 127 + (Math.random() * 0.1),
                address: '서울시 강남구 테스트 주소',
                fee_percentage: Math.floor(Math.random() * 10),
                rating: 0, // 리뷰가 없으므로 초기값 0
                description: '테스트 마커입니다.',
                created_at: new Date().toISOString(),
                image_url: 'https://via.placeholder.com/150',
                type: ['식당', '카페', '편의점'][Math.floor(Math.random() * 3)],
                created_by: users[0].id, // 첫 번째 사용자를 생성자로 설정
                phone: '010-1234-5678'
            };

            const { data, error } = await supabase
                .from('markers')
                .insert(testMarker)
                .select()
                .single();

            if (error) throw new Error(`마커 생성 오류: ${error.message}`);

            setMarkers(prevMarkers => [data, ...prevMarkers]);
            setSuccess('테스트 마커가 성공적으로 생성되었습니다.');
        } catch (error: any) {
            setError(`마커 생성 오류: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // 테스트 리뷰 생성
    const createTestReview = async () => {
        setLoading(true);
        setError(null);

        // 사용자나 마커가 없으면 생성 불가
        if (users.length === 0 || markers.length === 0) {
            setError('리뷰를 생성하려면 사용자와 마커가 필요합니다.');
            setLoading(false);
            return;
        }

        try {
            const testReview: InsertReview = {
                id: uuidv4(),
                marker_id: markers[0].id, // 첫 번째 마커에 대한 리뷰
                user_id: users[0].id, // 첫 번째 사용자가 작성
                content: `이 곳은 ${Math.random() > 0.5 ? '좋은' : '괜찮은'} 곳입니다. 테스트 리뷰입니다.`,
                rating: Math.floor(Math.random() * 5) + 1, // 1-5 랜덤 평점
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('reviews')
                .insert(testReview)
                .select()
                .single();

            if (error) throw new Error(`리뷰 생성 오류: ${error.message}`);

            // 마커 평점 업데이트를 위해 데이터 다시 불러오기
            fetchData();
            setSuccess('테스트 리뷰가 성공적으로 생성되었습니다.');
        } catch (error: any) {
            setError(`리뷰 생성 오류: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // 데이터 삭제
    const deleteItem = async (table: 'users' | 'markers' | 'reviews', id: string) => {
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', id);

            if (error) throw new Error(`삭제 오류: ${error.message}`);

            // 데이터 다시 불러오기
            fetchData();
            setSuccess(`항목이 성공적으로 삭제되었습니다.`);
        } catch (error: any) {
            setError(`삭제 오류: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // 페이지 로드 시 데이터 불러오기
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">파이코인 데이터베이스 테스트</h1>

            {/* 상태 표시 영역 */}
            {loading && <div className="bg-blue-100 text-blue-800 p-4 mb-4 rounded">로딩 중...</div>}
            {error && <div className="bg-red-100 text-red-800 p-4 mb-4 rounded">{error}</div>}
            {success && <div className="bg-green-100 text-green-800 p-4 mb-4 rounded">{success}</div>}

            {/* 데이터 생성 버튼 */}
            <div className="flex flex-wrap gap-4 mb-8">
                <button
                    onClick={createTestUser}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    테스트 사용자 생성
                </button>
                <button
                    onClick={createTestMarker}
                    disabled={loading || users.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    테스트 마커 생성
                </button>
                <button
                    onClick={createTestReview}
                    disabled={loading || users.length === 0 || markers.length === 0}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    테스트 리뷰 생성
                </button>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    데이터 새로고침
                </button>
            </div>

            {/* 사용자 테이블 */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">사용자 ({users.length})</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-zinc-800 border border-zinc-700 rounded-lg">
                        <thead>
                            <tr className="bg-zinc-700">
                                <th className="px-4 py-2 text-left text-white">ID</th>
                                <th className="px-4 py-2 text-left text-white">사용자명</th>
                                <th className="px-4 py-2 text-left text-white">관리자 여부</th>
                                <th className="px-4 py-2 text-left text-white">포인트</th>
                                <th className="px-4 py-2 text-left text-white">생성일</th>
                                <th className="px-4 py-2 text-left text-white">액션</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-t border-zinc-700 hover:bg-zinc-700/50">
                                    <td className="px-4 py-2 text-gray-300">{user.id.slice(0, 8)}...</td>
                                    <td className="px-4 py-2 text-gray-300">{user.username}</td>
                                    <td className="px-4 py-2 text-gray-300">{user.is_admin ? '예' : '아니오'}</td>
                                    <td className="px-4 py-2 text-gray-300">{user.points}</td>
                                    <td className="px-4 py-2 text-gray-300">{new Date(user.created_at).toLocaleString()}</td>
                                    <td className="px-4 py-2">
                                        <button
                                            onClick={() => deleteItem('users', user.id)}
                                            disabled={loading}
                                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm disabled:opacity-50"
                                        >
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-2 text-center text-gray-400">사용자가 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 마커 테이블 */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">마커 ({markers.length})</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-zinc-800 border border-zinc-700 rounded-lg">
                        <thead>
                            <tr className="bg-zinc-700">
                                <th className="px-4 py-2 text-left text-white">ID</th>
                                <th className="px-4 py-2 text-left text-white">이름</th>
                                <th className="px-4 py-2 text-left text-white">위치</th>
                                <th className="px-4 py-2 text-left text-white">유형</th>
                                <th className="px-4 py-2 text-left text-white">평점</th>
                                <th className="px-4 py-2 text-left text-white">생성자</th>
                                <th className="px-4 py-2 text-left text-white">액션</th>
                            </tr>
                        </thead>
                        <tbody>
                            {markers.map(marker => (
                                <tr key={marker.id} className="border-t border-zinc-700 hover:bg-zinc-700/50">
                                    <td className="px-4 py-2 text-gray-300">{marker.id.slice(0, 8)}...</td>
                                    <td className="px-4 py-2 text-gray-300">{marker.name}</td>
                                    <td className="px-4 py-2 text-gray-300">{marker.latitude.toFixed(4)}, {marker.longitude.toFixed(4)}</td>
                                    <td className="px-4 py-2 text-gray-300">{marker.type}</td>
                                    <td className="px-4 py-2 text-gray-300">{marker.rating.toFixed(1)}</td>
                                    <td className="px-4 py-2 text-gray-300">{marker.created_by.slice(0, 8)}...</td>
                                    <td className="px-4 py-2">
                                        <button
                                            onClick={() => deleteItem('markers', marker.id)}
                                            disabled={loading}
                                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm disabled:opacity-50"
                                        >
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {markers.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-2 text-center text-gray-400">마커가 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 리뷰 테이블 */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">리뷰 ({reviews.length})</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-zinc-800 border border-zinc-700 rounded-lg">
                        <thead>
                            <tr className="bg-zinc-700">
                                <th className="px-4 py-2 text-left text-white">ID</th>
                                <th className="px-4 py-2 text-left text-white">마커 ID</th>
                                <th className="px-4 py-2 text-left text-white">사용자</th>
                                <th className="px-4 py-2 text-left text-white">평점</th>
                                <th className="px-4 py-2 text-left text-white">내용</th>
                                <th className="px-4 py-2 text-left text-white">생성일</th>
                                <th className="px-4 py-2 text-left text-white">액션</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map(review => (
                                <tr key={review.id} className="border-t border-zinc-700 hover:bg-zinc-700/50">
                                    <td className="px-4 py-2 text-gray-300">{review.id.slice(0, 8)}...</td>
                                    <td className="px-4 py-2 text-gray-300">{review.marker_id.slice(0, 8)}...</td>
                                    <td className="px-4 py-2 text-gray-300">{review.user_id.slice(0, 8)}...</td>
                                    <td className="px-4 py-2 text-gray-300">{review.rating}</td>
                                    <td className="px-4 py-2 text-gray-300">{review.content.slice(0, 30)}{review.content.length > 30 ? '...' : ''}</td>
                                    <td className="px-4 py-2 text-gray-300">{new Date(review.created_at).toLocaleString()}</td>
                                    <td className="px-4 py-2">
                                        <button
                                            onClick={() => deleteItem('reviews', review.id)}
                                            disabled={loading}
                                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm disabled:opacity-50"
                                        >
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {reviews.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-2 text-center text-gray-400">리뷰가 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
} 