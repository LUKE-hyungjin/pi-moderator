'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';

// Leaflet 지도 컴포넌트를 클라이언트 사이드에서만 렌더링하기 위한 동적 임포트
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[500px] bg-zinc-900/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
    )
});

// 마커 유형 정의 - Supabase 테이블과 동일하게 변경
type MarkerType = 'all' | 'education' | 'exchange' | 'tax';

// 마커 상세 정보 인터페이스
interface MarkerDetail {
    id: string;
    title: string;
    description: string;
    address: string;
    phone: string;
    type: string;
    image_url?: string;
    rating: number;
}

export default function MapPage() {
    const t = useTranslations('Map');
    const [activeType, setActiveType] = useState<MarkerType>('all');
    const [selectedMarker, setSelectedMarker] = useState<MarkerDetail | null>(null);

    // 필터 버튼 정의
    const filterButtons = [
        { id: 'all', label: t('all'), activeClass: 'bg-purple-600 hover:bg-purple-500 text-white', inactiveClass: 'border-purple-600 dark:text-purple-400 text-purple-700' },
        { id: 'education', label: t('education'), activeClass: 'bg-blue-600 hover:bg-blue-500 text-white', inactiveClass: 'border-blue-600 dark:text-blue-400 text-blue-700' },
        { id: 'exchange', label: t('exchange'), activeClass: 'bg-pink-600 hover:bg-pink-500 text-white', inactiveClass: 'border-pink-600 dark:text-pink-400 text-pink-700' },
        { id: 'tax', label: t('tax'), activeClass: 'bg-green-600 hover:bg-green-500 text-white', inactiveClass: 'border-green-600 dark:text-green-400 text-green-700' },
    ];

    // 마커 클릭 핸들러
    const handleMarkerClick = (marker: MarkerDetail) => {
        setSelectedMarker(marker);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>

            {/* 필터 버튼 */}
            <div className="flex flex-wrap gap-2 mb-6">
                {filterButtons.map((button) => (
                    <Button
                        key={button.id}
                        variant={activeType === button.id ? "default" : "outline"}
                        className={activeType === button.id ? button.activeClass : button.inactiveClass}
                        onClick={() => setActiveType(button.id as MarkerType)}
                    >
                        {button.label}
                    </Button>
                ))}
            </div>

            {/* 지도와 정보 패널 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 지도 영역 */}
                <div className="lg:col-span-2 bg-zinc-900 rounded-lg overflow-hidden shadow-lg border border-zinc-800">
                    <MapComponent
                        activeType={activeType}
                        onMarkerClick={handleMarkerClick}
                    />
                </div>

                {/* 정보 패널 */}
                <div className="bg-zinc-900 rounded-lg overflow-hidden shadow-lg border border-zinc-800 p-6">
                    {selectedMarker ? (
                        <div>
                            <h2 className="text-xl font-bold mb-4">{selectedMarker.title}</h2>
                            {selectedMarker.image_url && (
                                <div className="mb-4">
                                    <img
                                        src={selectedMarker.image_url}
                                        alt={selectedMarker.title}
                                        className="w-full h-40 object-cover rounded-md"
                                    />
                                </div>
                            )}
                            <div className="flex items-center mb-3">
                                <span className="text-sm bg-gray-700 text-white px-2 py-1 rounded-full">
                                    {selectedMarker.type === 'education' ? t('education') :
                                        selectedMarker.type === 'exchange' ? t('exchange') :
                                            selectedMarker.type === 'tax' ? t('tax') : selectedMarker.type}
                                </span>
                                {selectedMarker.rating > 0 && (
                                    <div className="ml-2 flex items-center">
                                        <span className="text-yellow-400 mr-1">★</span>
                                        <span className="text-sm">{selectedMarker.rating.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>
                            <div
                                className="text-gray-300 mb-4 description"
                                dangerouslySetInnerHTML={{ __html: selectedMarker.description }}
                            />
                            <div className="flex items-center text-gray-400 text-sm mb-2">
                                <span className="mr-2">📍</span> {selectedMarker.address}
                            </div>
                            {selectedMarker.phone && (
                                <div className="flex items-center text-gray-400 text-sm">
                                    <span className="mr-2">📞</span> {selectedMarker.phone}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            {t('select_marker')}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .description {
                    max-height: 200px;
                    overflow-y: auto;
                }
                .description img {
                    max-width: 100%;
                    height: auto;
                }
            `}</style>
        </div>
    );
} 