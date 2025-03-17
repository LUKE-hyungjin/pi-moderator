import { NextRequest, NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/server';
import { UpdateUser } from '@/lib/supabase/types';

// 타입 정의
interface RouteParams {
    params: {
        id: string;
    };
}

// GET: 특정 사용자 가져오기
export async function GET(request: NextRequest, { params }: RouteParams) {
    const { id } = params;

    try {
        const supabase = createApiClient();

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(`사용자 ID ${id} 조회 오류:`, error);
            return NextResponse.json(
                { error: '사용자를 가져오는 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { error: '사용자를 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error(`사용자 ID ${id} 조회 처리 오류:`, error);
        return NextResponse.json(
            { error: '사용자를 가져오는 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

// PATCH: 사용자 정보 업데이트
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const { id } = params;

    try {
        const supabase = createApiClient();

        // JSON 데이터 파싱
        const userData: UpdateUser = await request.json();

        const { data, error } = await supabase
            .from('users')
            .update(userData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`사용자 ID ${id} 업데이트 오류:`, error);
            return NextResponse.json(
                { error: '사용자 정보를 업데이트하는 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error(`사용자 ID ${id} 업데이트 처리 오류:`, error);
        return NextResponse.json(
            { error: '사용자 정보를 업데이트하는 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

// PUT: 사용자 포인트 업데이트
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const { id } = params;

    try {
        const supabase = createApiClient();

        // JSON 데이터 파싱
        const { points } = await request.json();

        if (points === undefined) {
            return NextResponse.json(
                { error: '포인트 값이 필요합니다.' },
                { status: 400 }
            );
        }

        // 현재 사용자 정보 가져오기
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('points')
            .eq('id', id)
            .single();

        if (userError) {
            console.error(`사용자 ID ${id} 포인트 조회 오류:`, userError);
            return NextResponse.json(
                { error: '사용자 포인트 정보를 가져오는 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        const currentPoints = userData?.points || 0;
        const newPoints = currentPoints + points;

        // 포인트 업데이트
        const { data, error } = await supabase
            .from('users')
            .update({ points: newPoints })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`사용자 ID ${id} 포인트 업데이트 오류:`, error);
            return NextResponse.json(
                { error: '사용자 포인트를 업데이트하는 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: `포인트가 성공적으로 ${points > 0 ? '추가' : '차감'}되었습니다.`,
            data
        });
    } catch (error) {
        console.error(`사용자 ID ${id} 포인트 업데이트 처리 오류:`, error);
        return NextResponse.json(
            { error: '사용자 포인트를 업데이트하는 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
} 