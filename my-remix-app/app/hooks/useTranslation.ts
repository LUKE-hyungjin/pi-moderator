import { useCallback } from 'react';
import { translations } from '~/i18n/translations';
import type { Language } from '~/types/language';

export function useTranslation(language: Language = 'ko') {
    const t = useCallback((key: string) => {
        return translations[language][key] || key;
    }, [language]);

    return { t };
}