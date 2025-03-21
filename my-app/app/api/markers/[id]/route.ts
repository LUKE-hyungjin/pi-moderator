import { NextRequest, NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/server';
import { UpdateMarker } from '@/lib/supabase/types';

// 타입 정의
interface RouteParams {
    params: {
        id: string;
    };
}

// GET: 특정 마커 가져오기
export async function GET(request: NextRequest, { params }: RouteParams) {
    // params를 비구조화 할당하기 전 await 사용
    const routeParams = await Promise.resolve(params);
    const id = routeParams.id;

    try {
        const supabase = createApiClient();

        const { data, error } = await supabase
            .from('markers')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(`마커 ID ${id} 조회 오류:`, error);
            return NextResponse.json(
                { error: '마커를 가져오는 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { error: '마커를 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error(`마커 ID ${id} 조회 처리 오류:`, error);
        return NextResponse.json(
            { error: '마커를 가져오는 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

// PATCH: 마커 업데이트
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    // params를 비구조화 할당하기 전 await 사용
    const routeParams = await Promise.resolve(params);
    const id = routeParams.id;

    try {
        const supabase = createApiClient();

        // JSON 데이터 파싱
        const markerData: UpdateMarker = await request.json();

        const { data, error } = await supabase
            .from('markers')
            .update(markerData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`마커 ID ${id} 업데이트 오류:`, error);
            return NextResponse.json(
                { error: '마커를 업데이트하는 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error(`마커 ID ${id} 업데이트 처리 오류:`, error);
        return NextResponse.json(
            { error: '마커를 업데이트하는 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

// DELETE: 마커 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    // params를 비구조화 할당하기 전 await 사용
    const routeParams = await Promise.resolve(params);
    const id = routeParams.id;

    try {
        const supabase = createApiClient();

        const { error } = await supabase
            .from('markers')
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`마커 ID ${id} 삭제 오류:`, error);
            return NextResponse.json(
                { error: '마커를 삭제하는 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: '마커가 성공적으로 삭제되었습니다.' },
            { status: 200 }
        );
    } catch (error) {
        console.error(`마커 ID ${id} 삭제 처리 오류:`, error);
        return NextResponse.json(
            { error: '마커를 삭제하는 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
} 