import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';

const defaultPosition: LatLngTuple = [37.5665, 126.9780]; // 서울 좌표

export interface MarkerData {
    position: LatLngTuple;
    name: string;
}

interface MapProps {
    markers: MarkerData[];
}

export function Map({ markers }: MapProps) {
    return (
        <div className="relative">
            <MapContainer
                center={defaultPosition}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: "600px", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {markers.map((marker, index) => (
                    <Marker key={index} position={marker.position}>
                        <Popup>
                            {marker.name}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}