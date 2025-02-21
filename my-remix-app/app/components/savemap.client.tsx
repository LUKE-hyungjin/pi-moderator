import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import type { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";

interface SaveMapProps {
    position: [number, number];
    onMapClick: (e: { latlng: LatLng }) => void;
}

function MapEvents({ onMapClick }: { onMapClick: (e: { latlng: LatLng }) => void }) {
    useMapEvents({
        click: onMapClick,
    });
    return null;
}

export default function SaveMap({ position, onMapClick }: SaveMapProps) {
    // 전세계 영역의 경계 설정
    const bounds = [
        [-85, -180],  // 남서쪽 경계
        [85, 180]     // 북동쪽 경계
    ] as [[number, number], [number, number]];

    return (
        <MapContainer
            center={position}
            zoom={13}
            className="h-full"
            maxBounds={bounds}
            minZoom={2}    // 전세계가 보이는 줌 레벨
            maxZoom={18}   // 상세 거리가 보이는 줌 레벨
            boundsOptions={{ padding: [50, 50] }}
        >
            <MapEvents onMapClick={onMapClick} />
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                bounds={bounds}
            />
            <Marker position={position} />
        </MapContainer>
    );
}