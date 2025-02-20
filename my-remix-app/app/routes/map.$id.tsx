import { useLoaderData, Link } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { supabase } from "~/lib/supabase.server";
import type { MarkerType } from "~/components/map.client";

interface MarkerDetail {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address: string;
    image_url: string;
    fee_percentage: number;
    description: string;
    created_at: string;
    type: MarkerType;
}

export const loader: LoaderFunction = async ({ params }) => {
    const { data: marker, error } = await supabase
        .from('markers')
        .select('*')
        .eq('id', params.id)
        .single();

    if (error) {
        console.error('Error loading marker:', error);
        throw new Error('마커를 찾을 수 없습니다.');
    }

    return json({ marker });
};

export default function MarkerDetail() {
    const { marker } = useLoaderData<{ marker: MarkerDetail }>();
    const createdAt = new Date(marker.created_at).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold">{marker.name}</h2>
                    <Link
                        to="/map"
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                    >
                        지도로 돌아가기
                    </Link>
                </div>

                <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-8 space-y-8">
                    {/* 대표 이미지 */}
                    <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                        {marker.image_url ? (
                            <img
                                src={marker.image_url}
                                alt={marker.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                대표 이미지 없음
                            </div>
                        )}
                    </div>

                    {/* 기본 정보 */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">기본 정보</h3>
                            <div className="space-y-2">
                                <p>
                                    <span className="font-medium">카테고리:</span>{' '}
                                    {marker.type === 'education' ? '교육' : '중계'}
                                </p>
                                <p>
                                    <span className="font-medium">주소:</span>{' '}
                                    {marker.address}
                                </p>
                                <p>
                                    <span className="font-medium">1파이당 수수료:</span>{' '}
                                    {marker.fee_percentage}%
                                </p>
                                <p>
                                    <span className="font-medium">등록일:</span>{' '}
                                    {createdAt}
                                </p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">위치 정보</h3>
                            <div className="space-y-2">
                                <p>
                                    <span className="font-medium">위도:</span>{' '}
                                    {marker.latitude}
                                </p>
                                <p>
                                    <span className="font-medium">경도:</span>{' '}
                                    {marker.longitude}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 상세 설명 */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">상세 설명</h3>
                        <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-6">
                            <p className="whitespace-pre-wrap">{marker.description}</p>
                        </div>
                    </div>

                    {/* 나중에 추가할 리뷰 섹션을 위한 공간 */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">리뷰</h3>
                        <div className="text-center text-gray-500 py-8">
                            리뷰 기능은 준비 중입니다.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}