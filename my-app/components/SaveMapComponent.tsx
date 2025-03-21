'use client';

import { useEffect, useRef, useState } from 'react';
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
    const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);

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
            .accuracy-circle {
                stroke: #4080ff;
                stroke-width: 1;
                fill: #4080ff;
                fill-opacity: 0.1;
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
                zoom: 17, // 더 확대된 줌 레벨
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

            // 현재 위치 정확도 표시용 layer
            const accuracyLayer = L.layerGroup().addTo(mapRef.current);

            // 현재 위치의 정확도 정보 가져오기
            if (navigator.geolocation) {
                // 위치 정보 옵션 - 정확도 높이기
                const geoOptions = {
                    enableHighAccuracy: true, // 높은 정확도 요청
                    timeout: 10000,          // 10초 타임아웃
                    maximumAge: 0            // 캐시된 위치 정보 사용 안 함
                };

                navigator.geolocation.getCurrentPosition(
                    (geoPosition) => {
                        console.log('현재 위치(SaveMap):', geoPosition.coords.latitude, geoPosition.coords.longitude);
                        const accuracy = geoPosition.coords.accuracy;
                        console.log('위치 정확도(SaveMap):', accuracy, 'meters');

                        setLocationAccuracy(accuracy);

                        // 정확도 반경 표시 (미터 단위)
                        if (mapRef.current) {
                            accuracyLayer.clearLayers();
                            const latLng = L.latLng(geoPosition.coords.latitude, geoPosition.coords.longitude);

                            // 정확도 원 추가
                            const circle = L.circle(latLng, {
                                radius: accuracy,
                                className: 'accuracy-circle'
                            }).addTo(accuracyLayer);

                            // 사용자에게 정확도 정보 표시
                            const accuracyInfo = L.tooltip()
                                .setLatLng(latLng)
                                .setContent(`위치 정확도: ${Math.round(accuracy)}m`)
                                .openOn(mapRef.current);

                            // 5초 후 툴팁 제거
                            setTimeout(() => {
                                mapRef.current?.closeTooltip(accuracyInfo);
                            }, 5000);
                        }
                    },
                    (error) => {
                        console.error("현재 위치 정확도 가져오기 실패:", error);
                    },
                    geoOptions
                );
            }
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

    // 정확도 정보 표시
    return (
        <div className="relative w-full h-full">
            <div id="map" className="w-full h-full" />
            {locationAccuracy !== null && (
                <div className="absolute bottom-2 left-2 bg-white/80 dark:bg-black/80 px-2 py-1 rounded text-xs z-[1000]">
                    위치 정확도: 약 {Math.round(locationAccuracy)}m
                </div>
            )}
        </div>
    );
} 