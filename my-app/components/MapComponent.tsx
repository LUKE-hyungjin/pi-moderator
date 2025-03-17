'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 마커 데이터 타입 정의
interface Marker {
    id: number;
    lat: number;
    lng: number;
    title: string;
    description: string;
    address: string;
    phone: string;
    type: 'education' | 'exchange' | 'tax';
}

// 컴포넌트 프롭스 타입 정의
interface MapComponentProps {
    activeType: string;
    onMarkerClick: (marker: Marker) => void;
}

// 임시 마커 데이터
const dummyMarkers: Marker[] = [
    {
        id: 1,
        lat: 37.5665,
        lng: 126.9780,
        title: '서울 파이코인 교육센터',
        description: '파이코인에 대한 기초 및 심화 교육을 제공합니다.',
        address: '서울특별시 중구 세종대로 110',
        phone: '02-1234-5678',
        type: 'education'
    },
    {
        id: 2,
        lat: 35.1796,
        lng: 129.0756,
        title: '부산 파이코인 거래소',
        description: '안전한 파이코인 거래를 도와드립니다.',
        address: '부산광역시 중구 중앙대로 20',
        phone: '051-987-6543',
        type: 'exchange'
    },
    {
        id: 3,
        lat: 37.4563,
        lng: 127.0219,
        title: '강남 파이코인 세무상담소',
        description: '파이코인 관련 세금 신고 및 상담 서비스 제공.',
        address: '서울특별시 강남구 테헤란로 152',
        phone: '02-555-7890',
        type: 'tax'
    },
    {
        id: 4,
        lat: 35.8714,
        lng: 128.6014,
        title: '대구 파이코인 학습센터',
        description: '파이코인 채굴 및 활용법 교육',
        address: '대구광역시 중구 동성로 45',
        phone: '053-321-4567',
        type: 'education'
    }
];

export default function MapComponent({ activeType, onMarkerClick }: MapComponentProps) {
    const [filteredMarkers, setFilteredMarkers] = useState<Marker[]>([]);

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

    useEffect(() => {
        // 활성화된 필터에 따라 마커 필터링
        if (activeType === 'all') {
            setFilteredMarkers(dummyMarkers);
        } else {
            setFilteredMarkers(dummyMarkers.filter(marker => marker.type === activeType));
        }
    }, [activeType]);

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
                        position={[marker.lat, marker.lng]}
                        icon={getMarkerIcon(marker.type)}
                        eventHandlers={{
                            click: () => onMarkerClick(marker),
                        }}
                    >
                        <Popup>
                            <div>
                                <h3 className="font-bold">{marker.title}</h3>
                                <p className="text-sm">{marker.type}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </>
    );
} 