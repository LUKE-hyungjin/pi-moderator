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
    const bounds: L.LatLngBoundsLiteral = [
        [-60, -180], // 남서쪽 경계 (남극 제외)
        [85, 180]    // 북동쪽 경계
    ];

    const mapOptions = {
        center: position,
        zoom: 13,
        maxBounds: bounds,
        minZoom: 2,
        maxZoom: 18,
        boundsOptions: { padding: [50, 50] as [number, number] }
    };

    return (
        <MapContainer
            {...mapOptions}
            className="h-full"
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