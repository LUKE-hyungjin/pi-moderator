import { ClientOnly } from "remix-utils/client-only";
import { Link, useLoaderData } from "@remix-run/react";
import { Map } from "~/components/map.client";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { MarkerData } from "~/components/map.client";
import { supabase } from "~/lib/supabase.server";

export const loader: LoaderFunction = async () => {
    const { data: markers, error } = await supabase
        .from('markers')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error loading markers:', error);
        return json({ markers: [] });
    }

    const formattedMarkers: MarkerData[] = markers.map(marker => ({
        position: [marker.latitude, marker.longitude] as [number, number],
        name: marker.name
    }));

    return json({ markers: formattedMarkers });
};

export default function MapRoute() {
    const { markers } = useLoaderData<{ markers: MarkerData[] }>();

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold">지도</h2>
                    <Link
                        to="/map/add"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                        마커 추가
                    </Link>
                </div>
                <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6">
                    <ClientOnly fallback={<div>지도를 불러오는 중...</div>}>
                        {() => <Map markers={markers} />}
                    </ClientOnly>
                </div>
            </div>
        </div>
    );
}