'use client';

import { useTranslations } from 'next-intl';
import { Mail } from 'lucide-react';

interface FooterProps {
    totalUsers: number;
    todayUsers: number;
}

export default function Footer({ totalUsers, todayUsers }: FooterProps) {
    const t = useTranslations('Footer');

    return (
        <footer className="bg-[#1a1a1a] text-white py-6">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-6 md:w-1/3">
                        <a
                            href="mailto:pi.moderator.official@gmail.com"
                            className="flex items-center space-x-2 hover:text-purple-400 transition-colors"
                        >
                            <Mail className="h-5 w-5" />
                            <span>{t('email')}</span>
                        </a>
                    </div>
                    <div className="flex flex-col items-center md:w-1/3">
                        <span>
                            {t('total_users')}: {totalUsers.toLocaleString()}{t('users')}
                        </span>
                        <span>
                            {t('today_users')}: {todayUsers.toLocaleString()}{t('users')}
                        </span>
                    </div>
                    <div className="flex items-center justify-end space-x-6 md:w-1/3">
                        <span className="text-sm text-gray-400">{t('copyright')}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
} 