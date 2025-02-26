import { ko } from './ko';
import { en } from './en';
import { ar } from './arap';
import type { Translation } from '~/types/language';

export const translations: Translation = {
    ko: { ...ko },
    en: { ...en },
    ar: { ...ar }
};

export const translateToString = (value: any): string => {
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value[0]?.text || value[0] || '';
    if (typeof value === 'object' && value.text) return value.text;
    return '';
};