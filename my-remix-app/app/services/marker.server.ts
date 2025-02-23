import { supabase } from '~/lib/supabase.server';
import type { MarkerData, MarkerType } from '~/types/marker';

export async function getMarkers() {
    const { data: markers, error } = await supabase
        .from('markers')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) throw new Error('마커 데이터를 불러오는데 실패했습니다.');

    return markers.map(formatMarkerData);
}

export async function getMarkerById(id: string) {
    const { data: marker, error } = await supabase
        .from('markers')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw new Error('마커를 찾을 수 없습니다.');

    return formatMarkerData(marker);
}

// 마커 데이터 포맷팅 헬퍼 함수
function formatMarkerData(marker: any): MarkerData {
    return {
        id: marker.id,
        position: [marker.latitude, marker.longitude],
        name: marker.name,
        address: marker.address,
        phone: marker.phone,
        feePercentage: marker.fee_percentage,
        description: marker.description,
        created_at: marker.created_at,
        image_url: marker.image_url,
        type: marker.type as MarkerType
    };
} 