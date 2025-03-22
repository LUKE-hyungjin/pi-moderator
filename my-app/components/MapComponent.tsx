'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createClient } from '@/lib/supabase/client';

// Leaflet 리소스 미리 로드
if (typeof window !== 'undefined') {
    // 이미지들 미리 로드
    const preloadImages = [
        '/images/marker-icon.png',
        '/images/marker-icon-2x.png',
        '/images/marker-shadow.png'
    ];

    preloadImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// 마커 아이콘 초기화 - 모듈 레벨에서 한 번만 실행
if (typeof L !== 'undefined') {
    // @ts-ignore - 타입스크립트 에러 무시, Leaflet 아이콘 관련 알려진 이슈
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/images/marker-icon-2x.png',
        iconUrl: '/images/marker-icon.png',
        shadowUrl: '/images/marker-shadow.png',
    });
}

// 마커 데이터 타입 정의
interface MarkerData {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address: string;
    phone: string;
    description: string;
    type: string; // string으로 변경하여 더 유연하게 처리
    image_url?: string;
    rating: number;
    created_at: string;
    created_by: string;
    fee_percentage: number;
}

// 컴포넌트 프롭스 타입 정의
interface MapComponentProps {
    activeType: string;
    onMarkerClick: (marker: any) => void;
}

// 맵 리사이즈 핸들러 컴포넌트
function MapResizeHandler() {
    const map = useMap();

    useEffect(() => {
        // 맵이 로드된 후 resize 이벤트를 즉시 트리거
        map.invalidateSize();

        // 창 크기 변경 시 맵 크기 업데이트 (디바운스 적용)
        let resizeTimeout: NodeJS.Timeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                map.invalidateSize();
            }, 100);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);
        };
    }, [map]);

    return null;
}

export default function MapComponent({ activeType, onMarkerClick }: MapComponentProps) {
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const [filteredMarkers, setFilteredMarkers] = useState<MarkerData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([36.5, 127.5]); // 한국 중심을 기본값으로 설정
    const [mapReady, setMapReady] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(7);
    const [mapError, setMapError] = useState<string | null>(null);

    // 마커 아이콘 캐싱 - 각 타입별로 한 번만 생성
    const markerIcons = useMemo(() => {
        const icons: Record<string, L.DivIcon> = {};
        ['education', 'exchange', 'tax', 'default'].forEach(type => {
            icons[type] = createMarkerIcon(type);
        });
        return icons;
    }, []);

    // 사용자 위치 정보 최적화
    useEffect(() => {
        // 항상 맵을 표시하기 위해 바로 mapReady를 true로 설정하고 나중에 위치 정보로 업데이트
        setMapReady(true);

        // 타임아웃 변수를 미리 초기화
        let locationTimeout: NodeJS.Timeout | null = null;

        if (navigator.geolocation) {
            const geoOptions = {
                enableHighAccuracy: false,
                timeout: 3000,
                maximumAge: 60000
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    if (locationTimeout) clearTimeout(locationTimeout);
                    setMapCenter([position.coords.latitude, position.coords.longitude]);
                    setZoomLevel(13); // 위치를 찾았을 때 더 가까이 확대
                },
                (error) => {
                    if (locationTimeout) clearTimeout(locationTimeout);
                    console.error("위치 정보 가져오기 실패:", error);
                    // 위치 정보를 가져오지 못해도 기본 한국 중심으로 표시
                },
                geoOptions
            );
        }

        return () => {
            if (locationTimeout) clearTimeout(locationTimeout);
        };
    }, []);

    // 마커 데이터 가져오기 최적화
    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        // 가능한 빨리 데이터 캐시 설정
        if (markers.length > 0) {
            if (activeType === 'all') {
                setFilteredMarkers(markers);
            } else {
                setFilteredMarkers(markers.filter(marker => marker.type === activeType));
            }
            setLoading(false);
        }

        const fetchMarkers = async () => {
            try {
                const { data, error } = await supabase
                    .from('markers')
                    .select('id, name, latitude, longitude, address, phone, description, type, image_url, rating, created_at, created_by, fee_percentage');

                if (!isMounted) return;

                if (error) {
                    throw error;
                }

                if (data) {
                    setMarkers(data);
                    if (activeType === 'all') {
                        setFilteredMarkers(data);
                    } else {
                        setFilteredMarkers(data.filter(marker => marker.type === activeType));
                    }
                }
            } catch (err) {
                if (!isMounted) return;
                console.error('마커 데이터 가져오기 오류:', err);
                setError('마커 데이터를 가져오는 중 오류가 발생했습니다.');
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchMarkers();

        return () => {
            isMounted = false;
        };
    }, [activeType, supabase]);

    // 맵 컨테이너 크기 변경 감지
    useEffect(() => {
        if (mapContainerRef.current) {
            const resizeObserver = new ResizeObserver(() => {
                // ResizeObserver를 통해 컨테이너 크기 변경 감지
                if (document.querySelector('.leaflet-container')) {
                    // leaflet-container가 존재할 경우 이벤트 발생
                    window.dispatchEvent(new Event('resize'));
                }
            });

            resizeObserver.observe(mapContainerRef.current);

            return () => {
                if (mapContainerRef.current) {
                    resizeObserver.unobserve(mapContainerRef.current);
                }
            };
        }
    }, []);

    // 마커 아이콘 생성 함수
    function createMarkerIcon(type: string) {
        const colorClass =
            type === 'education' ? 'blue' :
                type === 'exchange' ? 'pink' :
                    type === 'tax' ? 'green' : 'purple';

        return L.divIcon({
            className: `marker-icon marker-${type}`,
            html: `<div class="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="30" height="36">
                    <path d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24c0-6.6-5.4-12-12-12z" 
                        fill="${type === 'education' ? '#3b82f6' :
                    type === 'exchange' ? '#ec4899' :
                        type === 'tax' ? '#22c55e' : '#8b5cf6'}" />
                    <circle cx="12" cy="12" r="4" fill="white" />
                </svg>
            </div>`,
            iconSize: [30, 36],
            iconAnchor: [15, 36],
        });
    }

    // 마커 클릭 핸들러
    const handleMarkerClick = (marker: MarkerData) => {
        onMarkerClick({
            id: marker.id,
            title: marker.name,
            description: marker.description,
            address: marker.address,
            phone: marker.phone,
            type: marker.type,
            image_url: marker.image_url,
            rating: marker.rating
        });
    };

    return (
        <>
            <style jsx global>{`
                .leaflet-container {
                    height: 300px;
                    width: 100%;
                    z-index: 1;
                    display: block;
                    will-change: transform;
                    transform: translateZ(0);
                }
                
                @media (min-width: 640px) {
                    .leaflet-container {
                        height: 600px;
                    }
                }
                
                .marker-icon {
                    background: none;
                    border: none;
                }
            `}</style>

            <div ref={mapContainerRef} className="w-full h-[300px] sm:h-[600px] relative">
                {mapError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-zinc-900/50">
                        <div className="text-red-500 p-4">{mapError}</div>
                    </div>
                )}

                {mapReady && (
                    <MapContainer
                        center={mapCenter}
                        zoom={zoomLevel}
                        zoomControl={false}
                        attributionControl={false}
                        scrollWheelZoom={true}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            // 타일 로딩 최적화 설정
                            maxNativeZoom={19}
                            maxZoom={19}
                        />
                        <MapResizeHandler />

                        {filteredMarkers.map((marker) => (
                            <Marker
                                key={marker.id}
                                position={[marker.latitude, marker.longitude]}
                                icon={markerIcons[marker.type] || markerIcons['default']}
                                eventHandlers={{
                                    click: () => handleMarkerClick(marker),
                                }}
                            >
                                <Popup>
                                    <div className="text-center">
                                        <strong>{marker.name}</strong>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}
            </div>
        </>
    );
} 