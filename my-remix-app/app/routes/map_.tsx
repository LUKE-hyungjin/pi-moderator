import { ClientOnly } from "remix-utils/client-only";
import { Link, useLoaderData } from "@remix-run/react";
import { Map } from "~/components/map.client";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { MarkerData, MarkerType } from "~/components/map.client";
import { supabase } from "~/lib/supabase.server";
import { useState } from "react";

export const loader: LoaderFunction = async () => {
    const { data: markers, error } = await supabase
        .from('markers')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error loading markers:', error);
        return json({ markers: [] });
    }

    const formattedMarkers: MarkerData[] = markers.map(marker => ({
        id: marker.id,
        position: [marker.latitude, marker.longitude] as [number, number],
        name: marker.name,
        address: marker.address,
        phone: marker.number,
        feePercentage: marker.fee_percentage,
        description: marker.description,
        created_at: marker.created_at,
        image_url: marker.image_url,
        type: marker.type as MarkerType
    }));

    return json({ markers: formattedMarkers });
};

export default function MapRoute() {
    const { markers } = useLoaderData<{ markers: MarkerData[] }>();
    const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
    const [selectedType, setSelectedType] = useState<'all' | MarkerType>('all');

    return (
        <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold">지도</h2>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setSelectedType('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 
                                ${selectedType === 'all'
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                        >
                            전체
                        </button>
                        <button
                            onClick={() => setSelectedType('education')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 
                                ${selectedType === 'education'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                        >
                            교육
                        </button>
                        <button
                            onClick={() => setSelectedType('relay')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 
                                ${selectedType === 'relay'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                        >
                            중계
                        </button>
                        <button
                            onClick={() => setSelectedType('tax')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 
                                ${selectedType === 'tax'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                        >
                            세무
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="w-full lg:flex-1 bg-[rgba(255,255,255,0.05)] rounded-lg p-4 sm:p-6">
                        <div className="h-[400px] sm:h-[500px] lg:h-[600px]">
                            <ClientOnly fallback={<div>지도를 불러오는 중...</div>}>
                                {() => (
                                    <Map
                                        markers={markers}
                                        onMarkerClick={setSelectedMarker}
                                        selectedType={selectedType}
                                    />
                                )}
                            </ClientOnly>
                        </div>
                    </div>

                    <div className="w-full lg:w-96 bg-[rgba(255,255,255,0.05)] rounded-lg p-4 sm:p-6">
                        {selectedMarker ? (
                            <MarkerDetail marker={selectedMarker} />
                        ) : (
                            <div className="text-center text-gray-500">
                                마커를 선택하면 정보가 표시됩니다.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MarkerDetail({ marker }: { marker: MarkerData }) {
    // 마커 타입별 색상 정의
    const typeColors = {
        education: 'bg-blue-500',
        relay: 'bg-red-500',
        tax: 'bg-green-500'
    };

    // 마커 타입별 텍스트
    const typeLabels = {
        education: '교육',
        relay: '중계',
        tax: '세무'
    };
    return (
        <div>
            <h3 className="text-xl sm:text-2xl font-bold mb-4">{marker.name}</h3>
            <div className="space-y-4">
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

                <div className="space-y-2">
                    <p className="text-sm sm:text-base">
                        <span className="font-medium">카테고리:</span>{' '}
                        <span className={`px-2 py-1 rounded text-white ${typeColors[marker.type]}`}>
                            {typeLabels[marker.type]}
                        </span>
                    </p>
                    <p className="text-sm sm:text-base">
                        <span className="font-medium">주소:</span> {marker.address}
                    </p>
                    <p className="text-sm sm:text-base">
                        <span className="font-medium">1파이당 수수료:</span> {marker.feePercentage}%
                    </p>
                </div>

                <Link
                    to={`/map/${marker.id}`}
                    className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mt-4"
                >
                    자세히 보기
                </Link>
            </div>
        </div>
    );
}