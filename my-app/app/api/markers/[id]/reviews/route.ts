import { NextRequest, NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/server';
import { InsertReview } from '@/lib/supabase/types';

// 타입 정의
interface RouteParams {
    params: {
        id: string;  // 마커 ID
    };
}

// GET: 특정 마커의 모든 리뷰 가져오기
export async function GET(request: NextRequest, { params }: RouteParams) {
    const { id } = params;

    try {
        const supabase = createApiClient();

        const { data, error } = await supabase
            .from('reviews')
            .select('*, users(username)')
            .eq('marker_id', id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error(`마커 ID ${id}의 리뷰 조회 오류:`, error);
            return NextResponse.json(
                { error: '리뷰를 가져오는 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error(`마커 ID ${id}의 리뷰 조회 처리 오류:`, error);
        return NextResponse.json(
            { error: '리뷰를 가져오는 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

// POST: 특정 마커에 새 리뷰 생성
export async function POST(request: NextRequest, { params }: RouteParams) {
    const { id } = params;

    try {
        const supabase = createApiClient();

        // JSON 데이터 파싱
        const reviewData: InsertReview = await request.json();

        // 마커 ID 설정
        reviewData.marker_id = id;

        // 필수 필드 검증
        if (!reviewData.user_id || !reviewData.content || reviewData.rating === undefined) {
            return NextResponse.json(
                { error: '필수 필드가 누락되었습니다.' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('reviews')
            .insert(reviewData)
            .select()
            .single();

        if (error) {
            console.error('리뷰 생성 오류:', error);
            return NextResponse.json(
                { error: '리뷰를 생성하는 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        // 리뷰가 생성되면 마커의 평균 평점을 업데이트
        await updateMarkerRating(id);

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('리뷰 생성 처리 오류:', error);
        return NextResponse.json(
            { error: '리뷰를 생성하는 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

// 마커의 평균 평점 업데이트 헬퍼 함수
async function updateMarkerRating(markerId: string): Promise<void> {
    const supabase = createApiClient();

    // 마커의 모든 리뷰 가져오기
    const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('marker_id', markerId);

    if (reviewsError) {
        console.error(`마커 ID ${markerId}의 리뷰 조회 오류:`, reviewsError);
        return;
    }

    // 평균 평점 계산
    const ratings = reviews?.map(review => review.rating) || [];
    const averageRating = ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0;

    // 마커의 평점 업데이트
    const { error: updateError } = await supabase
        .from('markers')
        .update({ rating: averageRating })
        .eq('id', markerId);

    if (updateError) {
        console.error(`마커 ID ${markerId}의 평점 업데이트 오류:`, updateError);
    }
} 