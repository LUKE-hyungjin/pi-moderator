import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
    // 이는 일반적으로 `[locale]` 세그먼트에 해당합니다.
    let locale = await requestLocale;

    // 유효한 로캘이 사용되었는지 확인하세요.
    if (!locale || !routing.locales.includes(locale as never)) {
        locale = routing.defaultLocale;
    }

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default, // 상대 경로 확인, messages 폴더에 JSON 파일이 있어야 함
    };
});