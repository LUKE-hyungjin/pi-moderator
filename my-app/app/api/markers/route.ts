import { NextRequest, NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/server';
import { InsertMarker } from '@/lib/supabase/types';

// GET: 모든 마커 가져오기
export async function GET() {
    try {
        const supabase = createApiClient();

        const { data, error } = await supabase
            .from('markers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('마커 조회 오류:', error);
            return NextResponse.json(
                { error: '마커를 가져오는 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('마커 조회 처리 오류:', error);
        return NextResponse.json(
            { error: '마커를 가져오는 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

// POST: 새 마커 생성
export async function POST(request: NextRequest) {
    try {
        const supabase = createApiClient();

        // JSON 데이터 파싱
        const markerData: InsertMarker = await request.json();

        // 필수 필드 검증
        if (!markerData.name || !markerData.latitude || !markerData.longitude || !markerData.created_by) {
            return NextResponse.json(
                { error: '필수 필드가 누락되었습니다.' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('markers')
            .insert(markerData)
            .select()
            .single();

        if (error) {
            console.error('마커 생성 오류:', error);
            return NextResponse.json(
                { error: '마커를 생성하는 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('마커 생성 처리 오류:', error);
        return NextResponse.json(
            { error: '마커를 생성하는 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
} 