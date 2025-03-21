'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
            <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type={isInteractive ? "button" : "button"}
                        disabled={!isInteractive}
                        onClick={isInteractive ? () => setReviewRating(star) : undefined}
                        className={`text-xl ${star <= (isInteractive ? reviewRating : count)
                            ? 'text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                            } ${isInteractive ? 'cursor-pointer hover:text-yellow-300' : ''}`}
                    >
                        ★
                    </button>
                ))}
            </div>
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

    // 알림 모달 닫기 핸들러
    const handleAlertClose = () => {
        setIsAlertOpen(false);
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

    // 페이지 변경 핸들러
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // 정렬 변경 핸들러
    const handleSortChange = (sort: SortType) => {
        setSortType(sort);
        setCurrentPage(1); // 정렬 변경 시 첫 페이지로 이동
    };

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
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{selectedMarker.rating.toFixed(1)}</span>
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

            {/* 상세 정보 모달 */}
            {selectedMarker && (
                <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader className="mb-4">
                            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                                {selectedMarker.title}
                            </DialogTitle>
                        </DialogHeader>

                        {selectedMarker.image_url && (
                            <div className="mb-4">
                                <img
                                    src={selectedMarker.image_url}
                                    alt={selectedMarker.title}
                                    className="w-full max-h-[300px] object-cover rounded-md"
                                />
                            </div>
                        )}

                        <div className="flex items-center mb-4">
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
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{selectedMarker.rating.toFixed(1)}</span>
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-2">
                                <span className="mr-2">📍</span> {selectedMarker.address}
                            </div>
                            {selectedMarker.phone && (
                                <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                                    <span className="mr-2">📞</span> {selectedMarker.phone}
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                            <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t('description')}</h3>
                            <div
                                className="text-gray-700 dark:text-gray-300 description"
                                dangerouslySetInnerHTML={{ __html: selectedMarker.description || '' }}
                            />
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                    {t('reviews')}
                                    <span className="ml-2 text-sm px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300">
                                        {t('review_count', { count: reviews.length })}
                                    </span>
                                </h3>
                                {reviews.length > 0 && (
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {t('total_rating', { rating: selectedMarker.rating.toFixed(1) })}
                                        </span>
                                        <div className="flex items-center text-yellow-500">
                                            {renderStars(Math.round(selectedMarker.rating))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {reviews.length > 0 && (
                                <div className="flex items-center justify-end space-x-2 mb-4">
                                    <button
                                        className={`px-3 py-1 text-sm rounded-md ${sortType === 'latest'
                                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                        onClick={() => handleSortChange('latest')}
                                    >
                                        {t('sort_latest')}
                                    </button>
                                    <button
                                        className={`px-3 py-1 text-sm rounded-md ${sortType === 'highest'
                                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                        onClick={() => handleSortChange('highest')}
                                    >
                                        {t('sort_highest')}
                                    </button>
                                </div>
                            )}

                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                                </div>
                            ) : reviews.length > 0 ? (
                                <div className="space-y-4 mb-6">
                                    {/* 내 리뷰 (있는 경우 맨 위에 고정) */}
                                    {userReview && (
                                        <div key={userReview.id} className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border-l-4 border-purple-500">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center">
                                                    <Avatar className="h-8 w-8 mr-2 bg-purple-200">
                                                        <AvatarFallback className="bg-purple-300 text-purple-800 dark:bg-purple-800 dark:text-purple-200">
                                                            {userReview.users.username.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium text-gray-900 dark:text-white flex items-center">
                                                        {userReview.users.username}
                                                        <span className="ml-2 text-xs px-2 py-0.5 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full">
                                                            {t('my_review')}
                                                        </span>
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    {renderStars(userReview.rating)}
                                                </div>
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300 mb-1">{userReview.content}</p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(userReview.created_at)}</p>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleOpenEditDialog(userReview)}
                                                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800/60"
                                                    >
                                                        {t('edit_review')}
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenDeleteDialog(userReview.id)}
                                                        className="text-xs px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800/60"
                                                    >
                                                        {t('delete_review')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 다른 사용자들의 리뷰 */}
                                    {getCurrentPageReviews().map((review) => (
                                        <div key={review.id} className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center">
                                                    <Avatar className="h-8 w-8 mr-2">
                                                        <AvatarFallback className="bg-purple-200 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                                            {review.users.username.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium text-gray-900 dark:text-white">{review.users.username}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    {renderStars(review.rating)}
                                                </div>
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300 mb-1">{review.content}</p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(review.created_at)}</p>
                                                {auth && review.user_id === auth.user.uid && (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleOpenEditDialog(review)}
                                                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800/60"
                                                        >
                                                            {t('edit_review')}
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenDeleteDialog(review.id)}
                                                            className="text-xs px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800/60"
                                                        >
                                                            {t('delete_review')}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    {t('no_reviews')}
                                </div>
                            )}

                            {/* 페이지네이션 */}
                            {getSortedReviews().length > reviewsPerPage && (
                                <div className="flex justify-center items-center space-x-2 mt-4">
                                    <button
                                        className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        &lt;
                                    </button>

                                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                                        // 페이지 번호 계산 로직 (총 페이지가 5 이상인 경우 현재 페이지 주변 번호만 표시)
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                            if (i === 4) pageNum = totalPages;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                            if (i === 0) pageNum = 1;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                            if (i === 0) pageNum = 1;
                                            if (i === 4) pageNum = totalPages;
                                        }

                                        return (
                                            <button
                                                key={i}
                                                className={`w-8 h-8 rounded-md ${currentPage === pageNum
                                                    ? 'bg-purple-500 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                    }`}
                                                onClick={() => handlePageChange(pageNum)}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        &gt;
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 리뷰 작성 폼은 사용자 본인의 리뷰가 없는 경우에만 표시 */}
                        {!userReview ? (
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('write_review')}</h3>

                                <div className="mb-4">
                                    <div className="flex items-center mb-2">
                                        <span className="text-gray-700 dark:text-gray-300 mr-2">{t('rating')}:</span>
                                        {renderStars(reviewRating, true)}
                                    </div>
                                    <Textarea
                                        value={reviewContent}
                                        onChange={(e) => setReviewContent(e.target.value)}
                                        placeholder={t('review_placeholder')}
                                        className="w-full min-h-24 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>

                                <Button
                                    onClick={handleReviewSubmit}
                                    disabled={isSubmitting || !auth}
                                    className="bg-purple-500 hover:bg-purple-600 text-white"
                                >
                                    {isSubmitting ? '...' : t('submit_review')}
                                </Button>

                                {!auth && (
                                    <p className="mt-2 text-sm text-red-500">{t('login_required_review')}</p>
                                )}
                            </div>
                        ) : (
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('your_review')}</h3>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-lg">
                                    <p className="text-gray-700 dark:text-gray-300 mb-4">{t('already_reviewed')}</p>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            )}

            {/* 알림 다이얼로그 */}
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('notification')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {alertMessage}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction>{t('confirm')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* 리뷰 수정 다이얼로그 */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('edit_review_title')}</DialogTitle>
                    </DialogHeader>
                    <div className="mb-4">
                        <div className="flex items-center mb-2">
                            <span className="text-gray-700 dark:text-gray-300 mr-2">{t('rating')}:</span>
                            <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setEditRating(star)}
                                        className={`text-xl ${star <= editRating
                                            ? 'text-yellow-400'
                                            : 'text-gray-300 dark:text-gray-600'
                                            } cursor-pointer hover:text-yellow-300`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            placeholder={t('review_placeholder')}
                            className="w-full min-h-24 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsEditDialogOpen(false)}
                            className="border-gray-300 dark:border-gray-700"
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            onClick={handleEditReview}
                            disabled={isSubmitting}
                            className="bg-purple-500 hover:bg-purple-600 text-white"
                        >
                            {isSubmitting ? '...' : t('submit')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 리뷰 삭제 확인 다이얼로그 */}
            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('delete_review')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('review_delete_confirm')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteReview}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {t('delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <style jsx>{`
                .description {
                    overflow-y: auto;
                }
                .description img {
                    max-width: 100%;
                    height: auto;
                }
                .description table {
                    border-collapse: collapse;
                    width: 100%;
                    margin-bottom: 1rem;
                }
                .description table td, 
                .description table th {
                    border: 1px solid #ddd;
                    padding: 8px;
                }
                .description ul, .description ol {
                    padding-left: 1.5rem;
                    margin-bottom: 1rem;
                }
                .description ul li {
                    list-style-type: disc;
                }
                .description ol li {
                    list-style-type: decimal;
                }
            `}</style>
        </div>
    );
} 