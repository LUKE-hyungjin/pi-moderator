import { useCallback } from 'react';
import { translations } from '~/i18n/translations';
import type { Language, TranslationValue } from '~/types/language';

export function useTranslation(language: Language = 'ko') {
    const t = useCallback((key: string): TranslationValue => {
        return translations[language][key] || key;
    }, [language]);

    return { t };
}