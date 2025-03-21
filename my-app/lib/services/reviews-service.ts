'use client';

import { createClient } from '../supabase/client';
import type { Review, InsertReview, UpdateReview } from '../supabase/types';

// 특정 마커의 모든 리뷰 가져오기
export async function getReviewsByMarkerId(markerId: string): Promise<Review[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('reviews')
        .select('*, users(username)')
        .eq('marker_id', markerId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(`마커 ID ${markerId}의 리뷰 조회 오류:`, error);
        throw new Error('리뷰를 가져오는 중 오류가 발생했습니다.');
    }

    return data || [];
}

// 특정 리뷰 상세 정보 가져오기
export async function getReviewById(id: string): Promise<Review | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('reviews')
        .select('*, users(username)')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`리뷰 ID ${id} 조회 오류:`, error);
        throw new Error('리뷰 상세 정보를 가져오는 중 오류가 발생했습니다.');
    }

    return data;
}

// 새 리뷰 생성
export async function createReview(review: InsertReview): Promise<Review> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('reviews')
        .insert(review)
        .select()
        .single();

    if (error) {
        console.error('리뷰 생성 오류:', error);
        throw new Error('리뷰를 생성하는 중 오류가 발생했습니다.');
    }

    // 리뷰가 생성되면 마커의 평균 평점을 업데이트
    await updateMarkerRating(review.marker_id);

    return data;
}

// 리뷰 업데이트
export async function updateReview(id: string, content: string, rating: number): Promise<void> {
    const supabase = createClient();

    // 먼저 리뷰를 가져와서 마커 ID 확인
    const { data: existingReview, error: fetchError } = await supabase
        .from('reviews')
        .select('marker_id')
        .eq('id', id)
        .single();

    if (fetchError) {
        console.error(`리뷰 ID ${id} 조회 오류:`, fetchError);
        throw new Error('리뷰를 가져오는 중 오류가 발생했습니다.');
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
        throw new Error('리뷰를 수정하는 중 오류가 발생했습니다.');
    }

    // 리뷰가 수정되면 마커의 평균 평점을 업데이트
    await updateMarkerRating(existingReview.marker_id);
}

// 리뷰 삭제
export async function deleteReview(id: string, markerId: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

    if (error) {
        console.error(`리뷰 ID ${id} 삭제 오류:`, error);
        throw new Error('리뷰를 삭제하는 중 오류가 발생했습니다.');
    }

    // 리뷰가 삭제되면 마커의 평균 평점을 업데이트
    await updateMarkerRating(markerId);
}

// 마커의 평균 평점 업데이트
async function updateMarkerRating(markerId: string): Promise<void> {
    const supabase = createClient();

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