import { Form, useNavigate } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { supabase } from "~/lib/supabase.server";
import type { MarkerType } from "~/components/map.client";

export const loader: LoaderFunction = async () => {
    return json({});
};

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();

    // 기본 정보
    const name = formData.get("name") as string;
    const latitude = parseFloat(formData.get("latitude") as string);
    const longitude = parseFloat(formData.get("longitude") as string);
    const address = formData.get("address") as string;
    const imageFile = formData.get("image") as File;
    const feePercentage = parseFloat(formData.get("feePercentage") as string);
    const description = formData.get("description") as string;
    const type = formData.get("type") as MarkerType;

    let imageUrl = '';

    // 이미지 업로드
    if (imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
            .from('marker-images')
            .upload(fileName, imageFile, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Error uploading image:', uploadError);
            return json({ error: '이미지 업로드 중 오류가 발생했습니다.' }, { status: 500 });
        }

        // 업로드된 이미지의 공개 URL 가져오기
        const { data: { publicUrl } } = supabase.storage
            .from('marker-images')
            .getPublicUrl(fileName);

        imageUrl = publicUrl;
    }

    // 마커 정보 저장
    const { error: markerError } = await supabase
        .from('markers')
        .insert([
            {
                name,
                latitude,
                longitude,
                address,
                image_url: imageUrl, // 이미지 URL 저장
                fee_percentage: feePercentage,
                rating: 0,
                description,
                type
            }
        ]);

    if (markerError) {
        console.error('Error inserting marker:', markerError);
        return json({ error: '장소 추가 중 오류가 발생했습니다.' }, { status: 500 });
    }

    return redirect("/map");
}

export default function AddMarker() {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-6">새로운 장소 추가</h2>
                <Form method="post" className="space-y-6" encType="multipart/form-data">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">
                            장소명
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
                        <label htmlFor="type" className="block text-sm font-medium mb-1">
                            카테고리
                        </label>
                        <select
                            id="type"
                            name="type"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="education">교육</option>
                            <option value="relay">중계</option>
                            <option value="tax">세무</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                    </div>

                    <div>
                        <label htmlFor="address" className="block text-sm font-medium mb-1">
                            주소
                        </label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="image" className="block text-sm font-medium mb-1">
                            대표 이미지
                        </label>
                        <input
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            JPG, PNG, GIF 형식의 이미지를 업로드해주세요.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="feePercentage" className="block text-sm font-medium mb-1">
                            1파이당 수수료 (%)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            id="feePercentage"
                            name="feePercentage"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-1">
                            상세 설명
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={6}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                        >
                            추가하기
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/user")}
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