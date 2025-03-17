import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from './types';

export function createClient() {
    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                async get(name: string) {
                    try {
                        return (await cookies()).get(name)?.value;
                    } catch {
                        return undefined;
                    }
                },
                async set(name: string, value: string, options: CookieOptions) {
                    try {
                        (await cookies()).set({ name, value, ...options });
                    } catch (error) {
                        // Server Component에서는 쿠키를 설정할 수 없으므로 무시
                        console.log('쿠키 설정 오류 (무시됨):', error);
                    }
                },
                async remove(name: string, options: CookieOptions) {
                    try {
                        (await cookies()).set({ name, value: "", ...options, maxAge: 0 });
                    } catch (error) {
                        // Server Component에서는 쿠키를 제거할 수 없으므로 무시
                        console.log('쿠키 제거 오류 (무시됨):', error);
                    }
                },
            },
        }
    );
}

// API 라우트용 클라이언트 (동일한 클라이언트 재사용)
export function createApiClient() {
    return createClient();
} 