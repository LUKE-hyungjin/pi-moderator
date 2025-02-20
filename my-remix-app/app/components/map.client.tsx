import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';
import L from 'leaflet';

const defaultPosition: LatLngTuple = [37.5665, 126.9780]; // 서울 좌표

// 마커 타입별 아이콘 정의
const markerIcons = {
    education: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }),
    relay: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }),
    tax: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
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
    feePercentage: number;
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
    const filteredMarkers = selectedType === 'all'
        ? markers
        : markers.filter((marker: MarkerData) => marker.type === selectedType);

    return (
        <div className="relative h-full w-full">
            <MapContainer
                center={defaultPosition}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filteredMarkers.map((marker: MarkerData, index: number) => (
                    <Marker
                        key={index}
                        position={marker.position}
                        icon={markerIcons[marker.type]}  // 여기에 icon prop 추가
                        eventHandlers={{
                            click: () => onMarkerClick?.(marker)
                        }}
                    >
                        <Popup>
                            <div className="w-64">
                                <h3 className="font-bold mb-2">{marker.name}</h3>
                                {marker.image_url ? (
                                    <img
                                        src={marker.image_url}
                                        alt={marker.name}
                                        className="w-full h-40 object-cover rounded-lg mb-2"
                                    />
                                ) : (
                                    <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                                        이미지 없음
                                    </div>
                                )}
                                <p className="text-sm mb-1">
                                    <span className="font-medium">카테고리:</span>{' '}
                                    {marker.type === 'education'
                                        ? '교육'
                                        : marker.type === 'relay'
                                            ? '중계'
                                            : '세무'}
                                </p>
                                <p className="text-sm mb-1">
                                    <span className="font-medium">주소:</span>{' '}
                                    {marker.address}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">수수료:</span>{' '}
                                    {marker.feePercentage}%
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}