import { NextRequest, NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/server';

// 타입 정의
interface RouteParams {
    params: {
        id: string;
    };
}

// GET: 특정 리뷰 가져오기
export async function GET(request: NextRequest, { params }: RouteParams) {
    // params를 비구조화 할당하기 전 await 사용
    const routeParams = await Promise.resolve(params);
    const id = routeParams.id;

    try {
        const supabase = createApiClient();

        const { data, error } = await supabase
            .from('reviews')
            .select('*, users(username)')
            .eq('id', id)
            .single();

        if (error) {
            console.error(`리뷰 ID ${id} 조회 오류:`, error);
            return NextResponse.json(
                { error: '리뷰를 가져오는 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { error: '리뷰를 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error(`리뷰 ID ${id} 조회 처리 오류:`, error);
        return NextResponse.json(
            { error: '리뷰를 가져오는 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

// PATCH: 리뷰 수정
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    // params를 비구조화 할당하기 전 await 사용
    const routeParams = await Promise.resolve(params);
    const id = routeParams.id;

    try {
        const supabase = createApiClient();
        const body = await request.json();

        const { content, rating } = body;

        if (!content || typeof content !== 'string') {
            return NextResponse.json(
                { error: '리뷰 내용은 필수입니다.' },
                { status: 400 }
            );
        }

        if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: '유효한 평점(1-5)이 필요합니다.' },
                { status: 400 }
            );
        }

        // 먼저 리뷰를 가져와서 마커 ID 확인
        const { data: existingReview, error: fetchError } = await supabase
            .from('reviews')
            .select('marker_id')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error(`리뷰 ID ${id} 조회 오류:`, fetchError);
            return NextResponse.json(
                { error: '리뷰를 가져오는 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        if (!existingReview) {
            return NextResponse.json(
                { error: '리뷰를 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        // 리뷰 수정
        const { error } = await supabase
            .from('reviews')
            .update({
                content,
                rating
            })
            .eq('id', id);

        if (error) {
            console.error(`리뷰 ID ${id} 수정 오류:`, error);
            return NextResponse.json(
                { error: '리뷰를 수정하는 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        // 리뷰가 수정되면 마커의 평균 평점을 업데이트
        await updateMarkerRating(existingReview.marker_id);

        return NextResponse.json(
            { message: '리뷰가 성공적으로 수정되었습니다.' },
            { status: 200 }
        );
    } catch (error) {
        console.error(`리뷰 ID ${id} 수정 처리 오류:`, error);
        return NextResponse.json(
            { error: '리뷰를 수정하는 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

// DELETE: 리뷰 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    // params를 비구조화 할당하기 전 await 사용
    const routeParams = await Promise.resolve(params);
    const id = routeParams.id;

    try {
        const supabase = createApiClient();

        // 먼저 리뷰를 가져와서 마커 ID 확인
        const { data: existingReview, error: fetchError } = await supabase
            .from('reviews')
            .select('marker_id')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error(`리뷰 ID ${id} 조회 오류:`, fetchError);
            return NextResponse.json(
                { error: '리뷰를 가져오는 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        if (!existingReview) {
            return NextResponse.json(
                { error: '리뷰를 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`리뷰 ID ${id} 삭제 오류:`, error);
            return NextResponse.json(
                { error: '리뷰를 삭제하는 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        // 리뷰가 삭제되면 마커의 평균 평점을 업데이트
        await updateMarkerRating(existingReview.marker_id);

        return NextResponse.json(
            { message: '리뷰가 성공적으로 삭제되었습니다.' },
            { status: 200 }
        );
    } catch (error) {
        console.error(`리뷰 ID ${id} 삭제 처리 오류:`, error);
        return NextResponse.json(
            { error: '리뷰를 삭제하는 중 오류가 발생했습니다.' },
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
    const ratings = reviews?.map((review: { rating: number }) => review.rating) || [];
    const averageRating = ratings.length > 0
        ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length
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