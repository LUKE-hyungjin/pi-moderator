'use client';

import { createClient } from '../supabase/client';
import type { Marker, InsertMarker, UpdateMarker } from '../supabase/types';

// 모든 마커 가져오기
export async function getAllMarkers(): Promise<Marker[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('markers')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('마커 조회 오류:', error);
        throw new Error('마커를 가져오는 중 오류가 발생했습니다.');
    }

    return data || [];
}

// 특정 마커 상세 정보 가져오기
export async function getMarkerById(id: string): Promise<Marker | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('markers')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`마커 ID ${id} 조회 오류:`, error);
        throw new Error('마커 상세 정보를 가져오는 중 오류가 발생했습니다.');
    }

    return data;
}

// 새 마커 생성
export async function createMarker(marker: InsertMarker): Promise<Marker> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('markers')
        .insert(marker)
        .select()
        .single();

    if (error) {
        console.error('마커 생성 오류:', error);
        throw new Error('마커를 생성하는 중 오류가 발생했습니다.');
    }

    return data;
}

// 마커 업데이트
export async function updateMarker(id: string, marker: UpdateMarker): Promise<Marker> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('markers')
        .update(marker)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error(`마커 ID ${id} 업데이트 오류:`, error);
        throw new Error('마커를 업데이트하는 중 오류가 발생했습니다.');
    }

    return data;
}

// 마커 삭제
export async function deleteMarker(id: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
        .from('markers')
        .delete()
        .eq('id', id);

    if (error) {
        console.error(`마커 ID ${id} 삭제 오류:`, error);
        throw new Error('마커를 삭제하는 중 오류가 발생했습니다.');
    }
} 