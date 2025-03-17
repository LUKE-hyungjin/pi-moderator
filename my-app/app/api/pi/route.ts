import { NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// Pi Network API로 토큰 검증하는 함수
async function verifyPiToken(accessToken: string) {
    try {
        const response = await fetch('https://api.minepi.com/v2/me', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (!response.ok) {
            console.error('Pi API 응답 오류:', response.status);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Pi 토큰 검증 오류:', error);
        return null;
    }
}

export async function POST(request: Request) {
    try {
        const requestData = await request.json();
        const { type } = requestData;

        // Supabase 클라이언트 초기화 (API 라우트용)
        const supabase = createApiClient();

        // 요청 타입에 따라 처리
        switch (type) {
            case 'verify_user': {
                const { authResult } = requestData;

                if (!authResult || !authResult.accessToken || !authResult.user || !authResult.user.uid) {
                    return NextResponse.json({ error: '유효하지 않은 인증 정보입니다.' }, { status: 400 });
                }

                try {
                    // Pi Network API로 토큰 검증
                    const piUserData = await verifyPiToken(authResult.accessToken);

                    if (!piUserData || piUserData.uid !== authResult.user.uid) {
                        console.error('Pi 토큰 검증 실패:', piUserData);
                        return NextResponse.json({ error: '유효하지 않은 Pi Network 토큰입니다.' }, { status: 401 });
                    }

                    console.log('Pi 토큰 검증 성공:', piUserData);

                    // 사용자 정보 조회
                    const { data: userData, error } = await supabase
                        .from('users')
                        .select('*')
                        .eq('pi_uid', authResult.user.uid)
                        .single();

                    const now = new Date().toISOString();
                    let canReceiveReward = false;

                    if (userData) {
                        // 기존 사용자 - 마지막 로그인 날짜 확인하여 보상 여부 결정
                        const lastLoginDate = new Date(userData.last_login_date || 0);
                        const today = new Date();

                        canReceiveReward =
                            today.getDate() !== lastLoginDate.getDate() ||
                            today.getMonth() !== lastLoginDate.getMonth() ||
                            today.getFullYear() !== lastLoginDate.getFullYear();

                    } else {
                        // 신규 사용자 - users 테이블에 생성
                        console.log('신규 사용자 생성:', authResult.user);

                        const newUser = {
                            id: crypto.randomUUID(),
                            username: authResult.user.username,
                            pi_uid: authResult.user.uid,
                            created_at: now,
                            is_admin: false,
                            points: 1, // 신규 가입 보상
                            last_login_date: now
                        };

                        console.log('삽입할 데이터:', newUser);

                        const { error: insertError } = await supabase
                            .from('users')
                            .insert(newUser);

                        if (insertError) {
                            console.error('사용자 생성 오류:', insertError);
                            return NextResponse.json({ error: '사용자 생성에 실패했습니다.' }, { status: 500 });
                        }

                        canReceiveReward = false; // 신규 가입시에는 가입 보상만 지급
                    }

                    return NextResponse.json({
                        userData,
                        canReceiveReward,
                        now
                    });
                } catch (error) {
                    console.error('사용자 정보 처리 오류:', error);
                    return NextResponse.json({ error: '사용자 정보 처리 중 오류가 발생했습니다.' }, { status: 500 });
                }
            }

            case 'update_user': {
                const { userId, username, now } = requestData;

                if (!userId) {
                    return NextResponse.json({ error: '사용자 ID가 필요합니다.' }, { status: 400 });
                }

                try {
                    // 사용자 정보 조회
                    const { data: userData, error: fetchError } = await supabase
                        .from('users')
                        .select('*')
                        .eq('pi_uid', userId)
                        .single();

                    if (fetchError) {
                        return NextResponse.json({ error: '사용자 정보를 찾을 수 없습니다.' }, { status: 404 });
                    }

                    // 포인트 증가 및 로그인 날짜 업데이트
                    const { error: updateError } = await supabase
                        .from('users')
                        .update({
                            last_login_date: now,
                            points: (userData.points || 0) + 1
                        })
                        .eq('pi_uid', userId);

                    if (updateError) {
                        return NextResponse.json({ error: '사용자 정보 업데이트에 실패했습니다.' }, { status: 500 });
                    }

                    return NextResponse.json({ success: true });
                } catch (error) {
                    console.error('사용자 업데이트 오류:', error);
                    return NextResponse.json({ error: '사용자 업데이트 중 오류가 발생했습니다.' }, { status: 500 });
                }
            }

            case 'verify_payment': {
                // 결제 정보 처리 로직
                const { paymentId, txid } = requestData;

                // TODO: 실제 결제 검증 로직 구현
                console.log('결제 검증 요청:', paymentId, txid);

                return NextResponse.json({ success: true });
            }

            default:
                return NextResponse.json({ error: '알 수 없는 요청 타입입니다.' }, { status: 400 });
        }
    } catch (error) {
        console.error('API 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
} 