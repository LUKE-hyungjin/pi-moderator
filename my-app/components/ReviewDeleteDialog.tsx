import React from 'react';
import { useTranslations } from 'next-intl';
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

interface ReviewDeleteDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    handleDeleteReview: () => void;
}

export default function ReviewDeleteDialog({
    isOpen,
    onOpenChange,
    handleDeleteReview
}: ReviewDeleteDialogProps) {
    const t = useTranslations('Map');

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
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
    );
} 