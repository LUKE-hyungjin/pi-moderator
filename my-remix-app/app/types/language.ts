export type Language = 'ko' | 'en';

export type TranslationValue = string | string[] | Array<string | {
    text: string;
    isWarning?: boolean;
    isDanger?: boolean;
    isNote?: boolean;
    hasCheckmark?: boolean;
    hasLineBreak?: boolean;
}>;

export interface Translation {
    [key: string]: { // 언어 코드 (ko, en)
        [key: string]: TranslationValue; // 번역 키와 값
    };
}