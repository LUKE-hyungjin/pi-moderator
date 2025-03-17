import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        const cookieStore = cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    async get(name: string) {
                        return (await cookieStore).get(name)?.value;
                    },
                    async set(name: string, value: string, options: CookieOptions) {
                        try {
                            (await cookieStore).set({ name, value, ...options });
                        } catch (error) {
                            // 서버 컴포넌트에서는 쿠키를 설정할 수 없으므로 무시
                        }
                    },
                    async remove(name: string, options: CookieOptions) {
                        try {
                            (await cookieStore).set({ name, value: "", ...options, maxAge: 0 });
                        } catch (error) {
                            // 서버 컴포넌트에서는 쿠키를 제거할 수 없으므로 무시
                        }
                    },
                },
            }
        );

        await supabase.auth.exchangeCodeForSession(code);
    }

    // 홈 페이지로 리디렉션
    return NextResponse.redirect(requestUrl.origin);
} 