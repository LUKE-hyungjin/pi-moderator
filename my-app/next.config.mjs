import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts'); // app 폴더를 사용하는 경우 경로 설정
// -> src 폴더를 사용하는 경우 인자를 생략합니다.

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withNextIntl(nextConfig);