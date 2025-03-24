import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  /* 아래내용 제거 필요 */
  eslint: {
    // 빌드 시 ESLint 실행을 비활성화
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 타입 체크 오류를 무시
    ignoreBuildErrors: true,
  },
};

export default withNextIntl(nextConfig);
