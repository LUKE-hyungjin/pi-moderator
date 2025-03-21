import { useState } from 'react';
import React from 'react';
import { useTranslations } from 'next-intl';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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

// Pi 인증 타입
interface PiAuth {
    accessToken: string;
    user: {
        uid: string;
        username: string;
    };
}

// 정렬 타입
type SortType = 'latest' | 'highest';

interface ReviewDialogProps {
    selectedMarker: MarkerDetail | null;
    detailOpen: boolean;
    setDetailOpen: (open: boolean) => void;
    reviews: Review[];
    isLoading: boolean;
    auth: PiAuth | null;
    userReview: Review | null;
    sortType: SortType;
    setSortType: (type: SortType) => void;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    reviewsPerPage: number;
    reviewContent: string;
    setReviewContent: (content: string) => void;
    reviewRating: number;
    setReviewRating: (rating: number) => void;
    isSubmitting: boolean;
    handleReviewSubmit: () => void;
    handleOpenEditDialog: (review: Review) => void;
    handleOpenDeleteDialog: (reviewId: string) => void;
    formatDate: (dateString: string) => string;
    getSortedReviews: () => Review[];
    getCurrentPageReviews: () => Review[];
    totalPages: number;
    renderStars: (count: number, isInteractive?: boolean) => React.ReactElement;
}

export default function ReviewDialog({
    selectedMarker,
    detailOpen,
    setDetailOpen,
    reviews,
    isLoading,
    auth,
    userReview,
    sortType,
    setSortType,
    currentPage,
    setCurrentPage,
    reviewsPerPage,
    reviewContent,
    setReviewContent,
    reviewRating,
    setReviewRating,
    isSubmitting,
    handleReviewSubmit,
    handleOpenEditDialog,
    handleOpenDeleteDialog,
    formatDate,
    getSortedReviews,
    getCurrentPageReviews,
    totalPages,
    renderStars
}: ReviewDialogProps) {
    const t = useTranslations('Map');

    // 정렬 변경 핸들러
    const handleSortChange = (sort: SortType) => {
        setSortType(sort);
        setCurrentPage(1); // 정렬 변경 시 첫 페이지로 이동
    };

    // 페이지 변경 핸들러
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (!selectedMarker) return null;

    return (
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
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {selectedMarker.rating.toFixed(1)} ({reviews.length})
                            </span>
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
            </DialogContent>
        </Dialog>
    );
} 