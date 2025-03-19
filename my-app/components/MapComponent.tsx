'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createClient } from '@/lib/supabase/client';

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

export default function MapComponent({ activeType, onMarkerClick }: MapComponentProps) {
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const [filteredMarkers, setFilteredMarkers] = useState<MarkerData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    // 마커 아이콘 문제 해결을 위한 재설정
    useEffect(() => {
        // @ts-ignore - 타입스크립트 에러 무시, Leaflet 아이콘 관련 알려진 이슈
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: '/images/marker-icon-2x.png',
            iconUrl: '/images/marker-icon.png',
            shadowUrl: '/images/marker-shadow.png',
        });
    }, []);

    // Supabase에서 마커 데이터 가져오기
    useEffect(() => {
        const fetchMarkers = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('markers')
                    .select('*');

                if (error) {
                    throw error;
                }

                if (data) {
                    setMarkers(data);
                }
            } catch (err) {
                console.error('마커 데이터 가져오기 오류:', err);
                setError('마커 데이터를 가져오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchMarkers();
    }, []);

    useEffect(() => {
        // 활성화된 필터에 따라 마커 필터링
        if (activeType === 'all') {
            setFilteredMarkers(markers);
        } else {
            setFilteredMarkers(markers.filter(marker => marker.type === activeType));
        }
    }, [activeType, markers]);

    // 마커 아이콘 설정
    const getMarkerIcon = (type: string) => {
        // 타입에 따른 색상 설정
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
    };

    // 마커 클릭 핸들러 - 데이터 포맷 변환
    const handleMarkerClick = (marker: MarkerData) => {
        // 컴포넌트 프롭스로 전달된 onMarkerClick에 필요한 형식으로 변환
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
          height: 500px;
          width: 100%;
          z-index: 1;
        }
      `}</style>
            <MapContainer
                center={[36.5, 127.5]} // 대한민국 중심
                zoom={7}
                scrollWheelZoom={true}
                style={{ height: '500px', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filteredMarkers.map(marker => (
                    <Marker
                        key={marker.id}
                        position={[marker.latitude, marker.longitude]}
                        icon={getMarkerIcon(marker.type)}
                        eventHandlers={{
                            click: () => handleMarkerClick(marker),
                        }}
                    />
                ))}
            </MapContainer>
        </>
    );
} 