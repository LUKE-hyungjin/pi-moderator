import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import { useRef, useEffect } from 'react';

const defaultPosition: LatLngTuple = [37.5665, 126.9780]; // 서울 좌표 (기본값)

// 마커 타입별 아이콘 정의
const markerIcons = {
    education: new L.Icon({
        iconUrl: '/marker-icon-2x-blue.png',
        shadowUrl: '/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
        className: 'leaflet-marker-icon-preload'
    }),
    relay: new L.Icon({
        iconUrl: '/marker-icon-2x-red.png',
        shadowUrl: '/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }),
    tax: new L.Icon({
        iconUrl: '/marker-icon-2x-green.png',
        shadowUrl: '/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    })
};

export type MarkerType = 'education' | 'relay' | 'tax';

export interface MarkerData {
    id: string;
    position: LatLngTuple;
    name: string;
    address: string;
    phone: string;
    description: string;
    created_at: string;
    image_url: string;
    type: MarkerType;
}

export interface MapProps {
    markers: MarkerData[];
    onMarkerClick?: (marker: MarkerData) => void;
    selectedType: string;
}

export function Map({ markers, onMarkerClick, selectedType }: MapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const markerLayerRef = useRef<L.LayerGroup | null>(null);

    // 사용자 위치 가져오기
    useEffect(() => {
        if (!mapRef.current) return;

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    mapRef.current?.setView([latitude, longitude], 13);
                },
                () => {
                    // 위치 권한이 거부되거나 오류 발생시 기본 위치(서울) 사용
                    mapRef.current?.setView(defaultPosition, 13);
                }
            );
        } else {
            // 위치 정보를 지원하지 않는 브라우저는 기본 위치 사용
            mapRef.current?.setView(defaultPosition, 13);
        }
    }, []);

    // 지도 초기화
    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map('map', {
                zoom: 3,
                maxZoom: 18,
                minZoom: 2,
                center: defaultPosition,
                zoomControl: true,
                attributionControl: false,
                dragging: true,
                scrollWheelZoom: true,
                doubleClickZoom: true,
                worldCopyJump: false,
                maxBounds: [[-60, -180], [85, 180]],
                maxBoundsViscosity: 1.0,
                preferCanvas: true  // Canvas 렌더링 사용
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                tileSize: 512,
                zoomOffset: -1,
                crossOrigin: true,
                keepBuffer: 2,
                noWrap: true
            }).addTo(mapRef.current);

            // 레이어 그룹 초기화
            markerLayerRef.current = L.layerGroup().addTo(mapRef.current);

            // 디바운스된 마커 업데이트 함수
            const updateVisibleMarkers = debounce(() => {
                if (!mapRef.current || !markerLayerRef.current) return;

                const zoom = mapRef.current.getZoom();
                if (zoom <= 6) {
                    markerLayerRef.current.clearLayers();
                    return;
                }

                const bounds = mapRef.current.getBounds();
                markerLayerRef.current.clearLayers();

                // 화면에 보이는 마커만 필터링
                const visibleMarkers = markers.filter(marker =>
                    (selectedType === 'all' || marker.type === selectedType) &&
                    bounds.contains(L.latLng(marker.position[0], marker.position[1]))
                );

                markerLayerRef.current.clearLayers();

                // 마커 일괄 추가
                const fragment = document.createDocumentFragment();
                visibleMarkers.forEach(marker => {
                    const markerInstance = L.marker(marker.position, {
                        icon: markerIcons[marker.type]
                    })
                        .on('click', () => onMarkerClick?.(marker));
                    markerLayerRef.current!.addLayer(markerInstance);
                });
            }, 100);

            // 이벤트 리스너 등록
            mapRef.current.on('moveend zoomend', updateVisibleMarkers);
        }
    }, []);

    // 마커 아이콘 프리로딩
    useEffect(() => {
        const preloadImages = () => {
            Object.values(markerIcons).forEach(icon => {
                const img = new Image();
                img.src = icon.options.iconUrl;
            });
        };
        preloadImages();
    }, []);

    // 마커 데이터나 선택된 타입이 변경될 때 업데이트
    useEffect(() => {
        if (!mapRef.current || !markerLayerRef.current) return;

        const updateMarkers = () => {
            const zoom = mapRef.current!.getZoom();
            if (zoom <= 6) return;

            const bounds = mapRef.current!.getBounds();
            markerLayerRef.current!.clearLayers();

            markers
                .filter(marker =>
                    (selectedType === 'all' || marker.type === selectedType) &&
                    bounds.contains(L.latLng(marker.position[0], marker.position[1]))
                )
                .slice(0, 1000)
                .forEach(marker => {
                    const markerInstance = L.marker(marker.position, {
                        icon: markerIcons[marker.type]
                    })
                        .on('click', () => onMarkerClick?.(marker));
                    markerLayerRef.current!.addLayer(markerInstance);
                });
        };

        // 지연 실행으로 렌더링 부하 감소
        requestAnimationFrame(updateMarkers);

        return () => {
            if (mapRef.current) {
                mapRef.current.off('moveend zoomend');
            }
        };
    }, [markers, selectedType, onMarkerClick]);

    return (
        <div id="map" style={{ width: '100%', height: '100%' }}></div>
    );
}

// 디바운스 함수
function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}