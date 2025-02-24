import type { FooterProps } from "~/types";
import { useLanguage } from "~/contexts/LanguageContext";
import { useTranslation } from "~/hooks/useTranslation";
import { translateToString } from "~/i18n/translations";

export function Footer({ totalUsers, todayUsers }: FooterProps) {
    const { language } = useLanguage();
    const { t } = useTranslation(language);

    return (
        <footer className="bg-[#1a1a1a] text-white py-6">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-6 md:w-1/3">
                        <a
                            href="mailto:pi.moderator.official@gmail.com"
                            className="flex items-center space-x-2 hover:text-purple-400"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>{translateToString(t('footer.email'))}</span>
                        </a>
                    </div>
                    <div className="flex flex-col items-center md:w-1/3">
                        <span>{translateToString(t('footer.total_users'))}: {totalUsers.toLocaleString()}{translateToString(t('footer.users'))}</span>
                        <span>{translateToString(t('footer.today_users'))}: {todayUsers.toLocaleString()}{translateToString(t('footer.users'))}</span>
                    </div>
                    <div className="flex items-center justify-end space-x-6 md:w-1/3">
                        <span className="text-sm text-gray-400">{translateToString(t('footer.copyright'))}</span>
                    </div>
                </div>
            </div >
        </footer >
    );
} 