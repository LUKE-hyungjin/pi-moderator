'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import ReviewDialog from '@/components/ReviewDialog';
import ReviewEditDialog from '@/components/ReviewEditDialog';
import ReviewDeleteDialog from '@/components/ReviewDeleteDialog';
import AlertMessageDialog from '@/components/AlertMessageDialog';
import RatingStars from '@/components/RatingStars';

// Leaflet 지도 컴포넌트를 클라이언트 사이드에서만 렌더링하기 위한 동적 임포트
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[300px] sm:h-[500px] bg-gray-200 dark:bg-zinc-900/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
    )
});

// 마커 유형 정의 - Supabase 테이블과 동일하게 변경
type MarkerType = 'all' | 'education' | 'exchange' | 'tax';

// 마커 상세 정보 인터페이스
interface MarkerDetail {
    id: string;
    title: string;
    description: string;
    address: string;
    phone: string;
    type: string;
    image_url?: string;
    rating: number;
}

// 리뷰 인터페이스
interface Review {
    id: string;
    marker_id: string;
    user_id: string;
    content: string;
    rating: number;
    created_at: string;
    users: {
        username: string;
    };
}

// 정렬 타입 정의
type SortType = 'latest' | 'highest';

// Pi Network 인증 타입
interface PiUser {
    uid: string;
    username: string;
}

// Pi 인증 정보 타입
interface PiAuth {
    accessToken: string;
    user: PiUser;
}

export default function MapPage() {
    const t = useTranslations('Map');
    const [activeType, setActiveType] = useState<MarkerType>('all');
    const [selectedMarker, setSelectedMarker] = useState<MarkerDetail | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('info');
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewContent, setReviewContent] = useState('');
    const [reviewRating, setReviewRating] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [auth, setAuth] = useState<PiAuth | null>(null);
    const [alertMessage, setAlertMessage] = useState('');
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [sortType, setSortType] = useState<SortType>('latest');
    const [currentPage, setCurrentPage] = useState(1);
    const [userReview, setUserReview] = useState<Review | null>(null);
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [editRating, setEditRating] = useState(1);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
    const reviewsPerPage = 5;
    const supabase = createClient();

    // 필터 버튼 정의
    const filterButtons = [
        { id: 'all', label: t('all'), activeClass: 'bg-purple-600 hover:bg-purple-500 text-white', inactiveClass: 'border-purple-600 dark:text-purple-400 text-purple-700' },
        { id: 'education', label: t('education'), activeClass: 'bg-blue-600 hover:bg-blue-500 text-white', inactiveClass: 'border-blue-600 dark:text-blue-400 text-blue-700' },
        { id: 'exchange', label: t('exchange'), activeClass: 'bg-pink-600 hover:bg-pink-500 text-white', inactiveClass: 'border-pink-600 dark:text-pink-400 text-pink-700' },
        { id: 'tax', label: t('tax'), activeClass: 'bg-green-600 hover:bg-green-500 text-white', inactiveClass: 'border-green-600 dark:text-green-400 text-green-700' },
    ];

    // 인증 정보 로드
    useEffect(() => {
        const savedAuth = localStorage.getItem('pi_auth');
        if (savedAuth) {
            try {
                const authData = JSON.parse(savedAuth);
                setAuth(authData);
            } catch (error) {
                console.error("저장된 인증 정보 파싱 오류:", error);
                localStorage.removeItem('pi_auth');
            }
        }
    }, []);

    // 마커 클릭 핸들러
    const handleMarkerClick = (marker: MarkerDetail) => {
        setSelectedMarker(marker);
    };

    // 모달이 열릴 때 리뷰 데이터 로드
    useEffect(() => {
        if (detailOpen && selectedMarker) {
            fetchReviews(selectedMarker.id);
            // 모달이 열릴 때마다 페이지와 정렬 초기화
            setCurrentPage(1);
            setSortType('latest');
        }
    }, [detailOpen, selectedMarker]);

    // 리뷰 데이터 가져오기
    const fetchReviews = async (markerId: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/markers/${markerId}/reviews`);
            if (response.ok) {
                const data = await response.json();
                setReviews(data);

                // 로그인한 사용자의 리뷰 확인
                if (auth) {
                    const userReviewData = data.find((review: Review) => review.user_id === auth.user.uid);
                    setUserReview(userReviewData || null);
                } else {
                    setUserReview(null);
                }
            } else {
                console.error('리뷰 로드 실패');
            }
        } catch (error) {
            console.error('리뷰 조회 오류:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 마커 정보 다시 로드
    const fetchMarkerDetails = async (markerId: string) => {
        try {
            const response = await fetch(`/api/markers/${markerId}`);
            if (response.ok) {
                const markerData = await response.json();
                setSelectedMarker(markerData);
            }
        } catch (error) {
            console.error('마커 정보 로드 오류:', error);
        }
    };

    // 리뷰 제출
    const handleReviewSubmit = async () => {
        if (!auth) {
            setAlertMessage(t('login_required_review'));
            setIsAlertOpen(true);
            return;
        }

        if (!reviewContent) {
            setAlertMessage(t('required_field'));
            setIsAlertOpen(true);
            return;
        }

        setIsSubmitting(true);

        try {
            if (selectedMarker) {
                const response = await fetch(`/api/markers/${selectedMarker.id}/reviews`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: auth.user.uid,
                        content: reviewContent,
                        rating: reviewRating,
                    }),
                });

                if (response.ok) {
                    // 리뷰 작성 성공
                    setReviewContent('');
                    setReviewRating(1);
                    // 리뷰 목록 새로고침
                    fetchReviews(selectedMarker.id);
                    // 마커 정보 업데이트
                    fetchMarkerDetails(selectedMarker.id);
                    // 성공 알림은 마지막에 표시
                    setTimeout(() => {
                        setAlertMessage(t('review_success'));
                        setIsAlertOpen(true);
                    }, 300);
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || t('review_error'));
                }
            }
        } catch (error) {
            console.error('리뷰 등록 오류:', error);
            setAlertMessage(error instanceof Error ? error.message : t('review_error'));
            setIsAlertOpen(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 별점 렌더링
    const renderStars = (count: number, isInteractive: boolean = false) => {
        return (
            <RatingStars
                rating={count}
                isInteractive={isInteractive}
                onChange={isInteractive ? setReviewRating : undefined}
            />
        );
    };

    // 날짜 포맷팅
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // 정렬된 리뷰 가져오기 함수 (내 리뷰는 맨 위에 고정)
    const getSortedReviews = () => {
        if (!reviews.length) return [];

        // 내 리뷰 제외한 다른 리뷰들만 정렬
        const otherReviews = reviews.filter(review => !auth || review.user_id !== auth.user.uid);

        const sortedOtherReviews = sortType === 'latest'
            ? [...otherReviews].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            : [...otherReviews].sort((a, b) => b.rating - a.rating);

        return sortedOtherReviews;
    };

    // 현재 페이지 리뷰 가져오기
    const getCurrentPageReviews = () => {
        const sortedReviews = getSortedReviews();
        const indexOfLastReview = currentPage * reviewsPerPage;
        const indexOfFirstReview = indexOfLastReview - reviewsPerPage;

        // 현재 페이지의 리뷰들
        const currentReviews = sortedReviews.slice(indexOfFirstReview, indexOfLastReview);

        return currentReviews;
    };

    // 총 페이지 수 계산 (내 리뷰 제외)
    const totalPages = Math.ceil(getSortedReviews().length / reviewsPerPage);

    // 리뷰 수정 모달 열기
    const handleOpenEditDialog = (review: Review) => {
        setEditingReview(review);
        setEditContent(review.content);
        setEditRating(review.rating);
        setIsEditDialogOpen(true);
    };

    // 리뷰 수정 처리
    const handleEditReview = async () => {
        if (!editingReview || !auth) return;

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/reviews/${editingReview.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: editContent,
                    rating: editRating,
                }),
            });

            if (response.ok) {
                // 수정 성공 후 리뷰 목록 새로고침
                setIsEditDialogOpen(false);
                if (selectedMarker) {
                    fetchReviews(selectedMarker.id);
                    // 마커 정보 업데이트
                    fetchMarkerDetails(selectedMarker.id);
                }
                setAlertMessage(t('review_edit_success'));
                setIsAlertOpen(true);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || '리뷰 수정 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('리뷰 수정 오류:', error);
            setAlertMessage(error instanceof Error ? error.message : '리뷰 수정 중 오류가 발생했습니다.');
            setIsAlertOpen(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 리뷰 삭제 확인 모달 열기
    const handleOpenDeleteDialog = (reviewId: string) => {
        setReviewToDelete(reviewId);
        setIsDeleteDialogOpen(true);
    };

    // 리뷰 삭제 처리
    const handleDeleteReview = async () => {
        if (!reviewToDelete || !selectedMarker) return;

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/reviews/${reviewToDelete}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // 삭제 성공 후 리뷰 목록 새로고침
                setIsDeleteDialogOpen(false);
                fetchReviews(selectedMarker.id);
                // 마커 정보 업데이트
                fetchMarkerDetails(selectedMarker.id);
                setAlertMessage(t('review_delete_success'));
                setIsAlertOpen(true);

                // 삭제한 리뷰가 사용자 자신의 리뷰였다면 userReview 상태 초기화
                if (userReview && userReview.id === reviewToDelete) {
                    setUserReview(null);
                }
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || '리뷰 삭제 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('리뷰 삭제 오류:', error);
            setAlertMessage(error instanceof Error ? error.message : '리뷰 삭제 중 오류가 발생했습니다.');
            setIsAlertOpen(true);
        } finally {
            setIsSubmitting(false);
            setReviewToDelete(null);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>

            {/* 필터 버튼 */}
            <div className="flex flex-wrap gap-2 mb-6">
                {filterButtons.map((button) => (
                    <Button
                        key={button.id}
                        variant={activeType === button.id ? "default" : "outline"}
                        className={activeType === button.id ? button.activeClass : button.inactiveClass}
                        onClick={() => setActiveType(button.id as MarkerType)}
                    >
                        {button.label}
                    </Button>
                ))}
            </div>

            {/* 지도와 정보 패널 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 지도 영역 */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-zinc-800">
                    <MapComponent
                        activeType={activeType}
                        onMarkerClick={handleMarkerClick}
                    />
                </div>

                {/* 정보 패널 */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-800 p-6 h-[400px] sm:h-[600px] flex flex-col relative">
                    {selectedMarker ? (
                        <div className="h-full flex flex-col overflow-hidden">
                            <h2 className="text-xl font-bold mb-2 sm:mb-4 text-gray-900 dark:text-white">{selectedMarker.title}</h2>
                            {selectedMarker.image_url && (
                                <div className="mb-2 sm:mb-4 flex-shrink-0">
                                    <img
                                        src={selectedMarker.image_url}
                                        alt={selectedMarker.title}
                                        className="w-full h-32 sm:h-48 object-cover rounded-md"
                                    />
                                </div>
                            )}
                            <div className="flex items-center mb-3 flex-shrink-0">
                                <span className={`text-sm px-2 py-1 rounded-full ${selectedMarker.type === 'education' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                                    selectedMarker.type === 'exchange' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300' :
                                        selectedMarker.type === 'tax' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                    }`}>
                                    {selectedMarker.type === 'education' ? t('education') :
                                        selectedMarker.type === 'exchange' ? t('exchange') :
                                            selectedMarker.type === 'tax' ? t('tax') : selectedMarker.type}
                                </span>
                                {selectedMarker.rating > 0 && (
                                    <div className="ml-2 flex items-center">
                                        <span className="text-yellow-500 mr-1">★</span>
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {selectedMarker.rating.toFixed(1)} ({reviews.length})
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-grow flex flex-col space-y-6 justify-between">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-2">
                                        <span className="mr-2">📍</span> {selectedMarker.address}
                                    </div>
                                    {selectedMarker.phone && (
                                        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-2">
                                            <span className="mr-2">📞</span> {selectedMarker.phone}
                                        </div>
                                    )}
                                    <Button
                                        className="w-full mt-2 bg-purple-500 hover:bg-purple-600 text-white"
                                        onClick={() => setDetailOpen(true)}
                                    >
                                        {t('view_details')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                            {t('select_marker')}
                        </div>
                    )}
                </div>
            </div>

            {/* 리뷰 다이얼로그 */}
            <ReviewDialog
                selectedMarker={selectedMarker}
                detailOpen={detailOpen}
                setDetailOpen={setDetailOpen}
                reviews={reviews}
                isLoading={isLoading}
                auth={auth}
                userReview={userReview}
                sortType={sortType}
                setSortType={setSortType}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                reviewsPerPage={reviewsPerPage}
                reviewContent={reviewContent}
                setReviewContent={setReviewContent}
                reviewRating={reviewRating}
                setReviewRating={setReviewRating}
                isSubmitting={isSubmitting}
                handleReviewSubmit={handleReviewSubmit}
                handleOpenEditDialog={handleOpenEditDialog}
                handleOpenDeleteDialog={handleOpenDeleteDialog}
                formatDate={formatDate}
                getSortedReviews={getSortedReviews}
                getCurrentPageReviews={getCurrentPageReviews}
                totalPages={totalPages}
                renderStars={renderStars}
            />

            {/* 리뷰 수정 다이얼로그 */}
            <ReviewEditDialog
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                editContent={editContent}
                setEditContent={setEditContent}
                editRating={editRating}
                setEditRating={setEditRating}
                isSubmitting={isSubmitting}
                handleEditReview={handleEditReview}
            />

            {/* 리뷰 삭제 확인 다이얼로그 */}
            <ReviewDeleteDialog
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                handleDeleteReview={handleDeleteReview}
            />

            {/* 알림 메시지 다이얼로그 */}
            <AlertMessageDialog
                isOpen={isAlertOpen}
                onOpenChange={setIsAlertOpen}
                message={alertMessage}
            />
        </div>
    );
} 