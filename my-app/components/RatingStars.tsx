import React from 'react';

interface RatingStarsProps {
    rating: number;
    isInteractive?: boolean;
    onChange?: (rating: number) => void;
    className?: string;
}

export default function RatingStars({
    rating,
    isInteractive = false,
    onChange,
    className = ''
}: RatingStarsProps) {
    return (
        <div className={`flex space-x-1 ${className}`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={!isInteractive}
                    onClick={isInteractive && onChange ? () => onChange(star) : undefined}
                    className={`text-xl ${star <= rating
                        ? 'text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                        } ${isInteractive ? 'cursor-pointer hover:text-yellow-300' : ''}`}
                >
                    ★
                </button>
            ))}
        </div>
    );
} 