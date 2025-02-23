export type Language = 'ko' | 'en';

export type Translation = {
    [key: string]: { [key: string]: string | string[] };
};