import React from 'react';
import { useTranslations } from 'next-intl';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

// 리뷰 인터페이스
interface Review {
    id: string;
    content: string;
    rating: number;
}

interface ReviewEditDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    editContent: string;
    setEditContent: (content: string) => void;
    editRating: number;
    setEditRating: (rating: number) => void;
    isSubmitting: boolean;
    handleEditReview: () => void;
}

export default function ReviewEditDialog({
    isOpen,
    onOpenChange,
    editContent,
    setEditContent,
    editRating,
    setEditRating,
    isSubmitting,
    handleEditReview
}: ReviewEditDialogProps) {
    const t = useTranslations('Map');

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
                        onClick={() => onOpenChange(false)}
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
    );
} 