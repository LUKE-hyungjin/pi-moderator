import { supabase } from "~/lib/supabase.server";
import type { MarkerType } from "~/types";

export async function getMarkers() {
    const { data, error } = await supabase
        .from('markers')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) throw new Error('마커 데이터를 불러오는데 실패했습니다.');

    return data;
}

export async function getMarkerById(id: string) {
    const { data, error } = await supabase
        .from('markers')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw new Error('마커를 찾을 수 없습니다.');

    return data;
} 