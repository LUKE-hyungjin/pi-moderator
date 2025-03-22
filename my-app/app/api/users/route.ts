import { NextRequest, NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/server';
import { InsertUser } from '@/lib/supabase/types';

// GET: 모든 사용자 가져오기 (관리자 전용)
export async function GET(request: NextRequest) {
    try {
        const supabase = createApiClient();

        // URL 쿼리 파라미터 처리
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        // 특정 ID로 사용자 검색 
        if (id) {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', id);

            if (error) {
                console.error('사용자 조회 오류:', error);
                return NextResponse.json(
                    { error: '사용자 정보를 가져오는 중 오류가 발생했습니다.' },
                    { status: 500 }
                );
            }

            return NextResponse.json(data);
        }

        // ID가 없으면 모든 사용자 검색
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('사용자 조회 오류:', error);
            return NextResponse.json(
                { error: '사용자 목록을 가져오는 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('사용자 조회 처리 오류:', error);
        return NextResponse.json(
            { error: '사용자 목록을 가져오는 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

// POST: 새 사용자 생성 (회원가입)
export async function POST(request: NextRequest) {
    try {
        const supabase = createApiClient();

        // JSON 데이터 파싱
        const userData: InsertUser = await request.json();

        // 필수 필드 검증
        if (!userData.username) {
            return NextResponse.json(
                { error: '사용자 이름이 필요합니다.' },
                { status: 400 }
            );
        }

        // ID가 제공되지 않은 경우 자동 생성 설정
        if (!userData.id) {
            const { data: authUser } = await supabase.auth.getUser();
            if (authUser.user) {
                userData.id = authUser.user.id;
            }
        }

        // 기본값 설정
        userData.created_at = userData.created_at || new Date().toISOString();
        userData.is_admin = userData.is_admin || false;
        userData.points = userData.points || 0;
        userData.last_login_date = userData.last_login_date || new Date().toISOString();

        const { data, error } = await supabase
            .from('users')
            .insert(userData)
            .select()
            .single();

        if (error) {
            console.error('사용자 생성 오류:', error);
            return NextResponse.json(
                { error: '사용자를 생성하는 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('사용자 생성 처리 오류:', error);
        return NextResponse.json(
            { error: '사용자를 생성하는 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
} 