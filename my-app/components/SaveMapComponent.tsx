'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 위치 타입
type PositionType = [number, number];

// 컴포넌트 Props 타입
interface SaveMapComponentProps {
    position: PositionType;
    onPositionSelect: (position: PositionType) => void;
}

export default function SaveMapComponent({ position, onPositionSelect }: SaveMapComponentProps) {
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Leaflet CSS가 잘 적용되도록 스타일 추가
        const style = document.createElement('style');
        style.textContent = `
            .leaflet-container {
                z-index: 10; /* Navbar보다 낮은 z-index 값 */
                width: 100%;
                height: 100%;
            }
            .leaflet-control-zoom {
                z-index: 15;
            }
            .leaflet-control-attribution {
                display: none;
            }
        `;
        document.head.appendChild(style);

        // Leaflet 기본 아이콘 설정
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: '/images/marker-icon-2x.png',
            iconUrl: '/images/marker-icon.png',
            shadowUrl: '/images/marker-shadow.png',
        });

        // 지도 인스턴스 생성
        if (!mapRef.current) {
            mapRef.current = L.map('map', {
                center: position,
                zoom: 13,
                layers: [
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    })
                ]
            });

            // 초기 마커 생성 (기본 마커 사용)
            markerRef.current = L.marker(position, { draggable: true })
                .addTo(mapRef.current);

            // 마커 드래그 이벤트 핸들러
            markerRef.current.on('dragend', function (this: L.Marker) {
                const newPosition = this.getLatLng();
                onPositionSelect([newPosition.lat, newPosition.lng]);
            });

            // 지도 클릭 이벤트 핸들러
            mapRef.current.on('click', function (e) {
                const { lat, lng } = e.latlng;
                if (markerRef.current) {
                    markerRef.current.setLatLng([lat, lng]);
                }
                onPositionSelect([lat, lng]);
            });
        }

        // 컴포넌트 언마운트 시 지도 제거
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // 위치 변경 시 마커 위치 업데이트
    useEffect(() => {
        if (markerRef.current && mapRef.current) {
            markerRef.current.setLatLng(position);
            mapRef.current.panTo(position);
        }
    }, [position]);

    return <div id="map" className="w-full h-full" />;
} 