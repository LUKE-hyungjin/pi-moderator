import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing'; // 경로를 잘 설정해주세요.

export default createMiddleware(routing);

export const config = {
    // 국제화된 경로명만 일치
    matcher: ['/', '/(ko|en)/:path*'], // "/" 경로와 "/:path*" 경로를 지원합니다.
};