import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
    // 미들웨어에서 사용할 응답 생성
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // Supabase 클라이언트 생성
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    // Response에 쿠키 설정
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: CookieOptions) {
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                        maxAge: 0,
                    });
                },
            },
        }
    );

    // 세션 새로고침
    await supabase.auth.getSession();

    // next-intl 미들웨어 적용
    const intlResponse = await intlMiddleware(request);

    // 수정된 쿠키를 intlResponse로 복사
    response.cookies.getAll().forEach((cookie) => {
        intlResponse.cookies.set(cookie);
    });

    return intlResponse;
}

export const config = {
    matcher: ['/', '/(ko|en)/:path*'],
};