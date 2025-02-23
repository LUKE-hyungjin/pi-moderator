export type Language = 'ko' | 'en';

export interface Translation {
    [key: string]: string | string[] | Translation;
} 