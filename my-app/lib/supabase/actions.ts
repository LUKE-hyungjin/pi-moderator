'use server';

import { createClient } from './server';

/**
 * 전체 사용자 수를 조회합니다.
 */
export async function getTotalUsers(): Promise<number> {
    try {
        const supabase = createClient();
        const { count, error } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('전체 사용자 조회 오류:', error);
            return 0;
        }

        return count || 0;
    } catch (error) {
        console.error('전체 사용자 조회 처리 오류:', error);
        return 0;
    }
}

/**
 * 오늘 로그인한 사용자 수를 조회합니다.
 */
export async function getTodayUsers(): Promise<number> {
    try {
        const supabase = createClient();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { count, error } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .gte('last_login_date', today.toISOString());

        if (error) {
            console.error('오늘 사용자 조회 오류:', error);
            return 0;
        }

        return count || 0;
    } catch (error) {
        console.error('오늘 사용자 조회 처리 오류:', error);
        return 0;
    }
} 