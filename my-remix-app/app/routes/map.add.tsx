import { Form, useNavigate } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { supabase } from "~/lib/supabase.server";

// loader 함수 추가
export const loader: LoaderFunction = async () => {
    return json({});  // 빈 객체를 반환하더라도 loader가 필요함
};

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const latitude = parseFloat(formData.get("latitude") as string);
    const longitude = parseFloat(formData.get("longitude") as string);

    const { error } = await supabase
        .from('markers')
        .insert([
            { name, latitude, longitude }
        ]);

    if (error) {
        console.error('Error inserting marker:', error);
        return json({ error: '마커 추가 중 오류가 발생했습니다.' }, { status: 500 });
    }

    return redirect("/map");
}

export default function AddMarker() {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="max-w-lg mx-auto">
                <h2 className="text-3xl font-bold mb-6">새로운 마커 추가</h2>
                <Form method="post" className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">
                            이름
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="latitude" className="block text-sm font-medium mb-1">
                            위도
                        </label>
                        <input
                            type="number"
                            step="any"
                            id="latitude"
                            name="latitude"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="longitude" className="block text-sm font-medium mb-1">
                            경도
                        </label>
                        <input
                            type="number"
                            step="any"
                            id="longitude"
                            name="longitude"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                        >
                            추가하기
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/map")}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                        >
                            취소
                        </button>
                    </div>
                </Form>
            </div>
        </div>
    );
}