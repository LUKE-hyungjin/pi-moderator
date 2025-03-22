import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { piUid, username } = body;

        if (!piUid) {
            return NextResponse.json({ error: '사용자 ID가 필요합니다.' }, { status: 400 });
        }

        const supabase = createClient();

        // 사용자 존재 확인 (pi_uid 대신 id 컬럼 사용)
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', piUid)
            .single();

        if (userError && userError.code !== 'PGRST116') {
            console.error('사용자 조회 오류:', userError);
            return NextResponse.json({ error: '사용자 조회 중 오류가 발생했습니다.' }, { status: 500 });
        }

        // 마지막 로그인 확인 및 데일리 보상 자격 검증
        const now = new Date();
        const lastLogin = userData ? new Date(userData.last_login_date) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isEligibleForReward = !lastLogin ||
            lastLogin.getDate() !== now.getDate() ||
            lastLogin.getMonth() !== now.getMonth() ||
            lastLogin.getFullYear() !== now.getFullYear();

        if (!isEligibleForReward) {
            return NextResponse.json({ error: '오늘 이미 보상을 받았습니다. 내일 다시 시도해주세요.' }, { status: 400 });
        }

        // 보상 포인트 (기본 2점)
        const pointsAwarded = 2;

        // 사용자 데이터 업데이트 또는 생성
        if (userData) {
            // 기존 사용자 업데이트
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    points: userData.points + pointsAwarded,
                    last_login_date: now.toISOString(),
                })
                .eq('id', piUid);

            if (updateError) {
                console.error('사용자 업데이트 오류:', updateError);
                return NextResponse.json({ error: '사용자 정보 업데이트 중 오류가 발생했습니다.' }, { status: 500 });
            }
        } else {
            // 새 사용자 생성
            const { error: insertError } = await supabase
                .from('users')
                .insert([{
                    id: piUid,
                    username: username,
                    points: pointsAwarded,
                    last_login_date: now.toISOString(),
                    created_at: now.toISOString(),
                    is_admin: false
                }]);

            if (insertError) {
                console.error('사용자 생성 오류:', insertError);
                return NextResponse.json({ error: '사용자 정보 생성 중 오류가 발생했습니다.' }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true, pointsAwarded, message: `${pointsAwarded} 토큰을 받았습니다!` });

    } catch (error) {
        console.error('보상 처리 오류:', error);
        return NextResponse.json({ error: '보상 처리 중 오류가 발생했습니다. 나중에 다시 시도해주세요.' }, { status: 500 });
    }
} 