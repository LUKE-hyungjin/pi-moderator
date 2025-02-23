import { supabase } from "~/lib/supabase.server";
import type { PaymentDTO } from "~/types";

export async function verifyPiUser(accessToken: string) {
    const response = await fetch(`${process.env.PI_API_URL}/v2/me`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error('Pi Network 사용자 검증 실패');
    }

    return response.json();
}

export async function handleUserAuthentication(authResult: any) {
    const now = new Date();
    const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authResult.user.uid)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error('사용자 데이터 조회 실패');
    }

    const lastLoginDate = userData?.last_login_date ? new Date(userData.last_login_date) : null;
    const timeSinceLastLogin = lastLoginDate ? now.getTime() - lastLoginDate.getTime() : null;
    const canReceiveReward = !lastLoginDate || (timeSinceLastLogin !== null && timeSinceLastLogin >= 24 * 60 * 60 * 1000);

    return { userData, canReceiveReward, now };
}

export async function updateUserData(userId: string, username: string, userData: any, now: Date) {
    const { error } = await supabase
        .from('users')
        .upsert({
            id: userId,
            username: username,
            created_at: userData?.created_at || now.toISOString(),
            last_login_date: now.toISOString(),
            points: (userData?.points || 0) + 1
        });

    if (error) throw new Error('사용자 정보 업데이트 실패');
} 