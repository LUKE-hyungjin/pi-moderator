import { Form, useNavigate } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { ClientOnly } from "remix-utils/client-only";
import { supabase } from "~/lib/supabase.server";
import type { MarkerType } from "~/components/map.client";
import { useState, useEffect } from "react";
import Sunediter from "~/components/sunediter.client";
import type { LatLng } from "leaflet";
import SaveMap from "~/components/savemap.client";

export const loader: LoaderFunction = async () => {
    return json({});
};

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    // 폼 데이터에서 인증 정보 가져오기
    const authDataStr = formData.get("authData") as string;
    if (!authDataStr) {
        return json({ error: '사용자 인증이 필요합니다.' }, { status: 401 });
    }

    const authData = JSON.parse(authDataStr);
    const userId = authData.user.uid;
    // 기본 정보
    const name = formData.get("name") as string;
    const latitude = parseFloat(formData.get("latitude") as string);
    const longitude = parseFloat(formData.get("longitude") as string);
    const address = formData.get("address") as string;
    const phone = formData.get("phone") as string;
    const imageFile = formData.get("image") as File;
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
                phone,
                image_url: imageUrl,
                rating: 0,
                description,
                type,
                created_by: userId
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
    const [address, setAddress] = useState("");
    const [authData, setAuthData] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [type, setType] = useState<MarkerType>('education');
    const [position, setPosition] = useState<[number, number]>([37.5665, 126.9780]); // 서울 중심 좌표

    // 카테고리별 템플릿 정의
    const templates = {
        education: `
            <div class="template-content">
                <h3 style="font-size: 1.5em; color: #2563eb; margin-bottom: 1em;">교육 정보</h3>
                <div class="info-section" style="margin-bottom: 1em;">
                    <p><strong>📚 교육 유형:</strong> [오프라인/온라인/하이브리드 중 선택]</p>
                    <p><strong>👥 수용 인원:</strong> [숫자로 입력]</p>
                    <p><strong>📝 교육 과정 소개:</strong></p>
                    <p><strong>👨‍🏫 강사 정보:</strong></p>
                    <p><strong>💰 교육 요금:</strong></p>
                    <p><strong>📅 교육 일정:</strong></p>
                </div>
                <div>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 1em; background-color: #1e1e1e; ">
                        <thead>
                            <tr>
                                <th style="border: 1px solid #333; padding: 8px; background-color: #000000;"><span style="color: #000000;">순서</span></th>
                                <th style="border: 1px solid #333; padding: 8px; background-color: #000000;"><span style="color: #000000;">시간</span></th>
                                <th style="border: 1px solid #333; padding: 8px; background-color: #000000;"><span style="color: #000000;">주요내용</span></th>
                                <th style="border: 1px solid #333; padding: 8px; background-color: #000000;"><span style="color: #000000;">담당자</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="border: 1px solid #333; padding: 8px; color: #e0e0e0; background-color: #1e1e1e;">1</td>
                                <td style="border: 1px solid #333; padding: 8px; color: #e0e0e0; background-color: #1e1e1e;">[시간]</td>
                                <td style="border: 1px solid #333; padding: 8px; color: #e0e0e0; background-color: #1e1e1e;">[내용]</td>
                                <td style="border: 1px solid #333; padding: 8px; color: #e0e0e0; background-color: #1e1e1e;">[담당자]</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #333; padding: 8px; color: #e0e0e0; background-color: #1e1e1e;">2</td>
                                <td style="border: 1px solid #333; padding: 8px; color: #e0e0e0; background-color: #1e1e1e;">[시간]</td>
                                <td style="border: 1px solid #333; padding: 8px; color: #e0e0e0; background-color: #1e1e1e;">[내용]</td>
                                <td style="border: 1px solid #333; padding: 8px; color: #e0e0e0; background-color: #1e1e1e;">[담당자]</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div>
                    <p><strong>ℹ️ 기타 안내사항:</strong></p>
                </div>
            </div>
        `,
        relay: `
            <div class="template-content">
                <h3 style="font-size: 1.5em; color: #2563eb; margin-bottom: 1em;">중계 서비스 정보</h3>
                <div class="info-section" style="margin-bottom: 1em;">
                    <p><strong>🔄 중계 방식:</strong> [직접 중계/대행 중 선택]</p>
                    <p><strong>⏰ 운영 시간:</strong> [예: 09:00-18:00]</p>
                    <p><strong>📍 서비스 지역:</strong></p>
                    <p><strong>💰 중계 수수료:</strong></p>
                    <p><strong>📋 특이사항:</strong></p>
                </div>
            </div>
        `,
        tax: `
            <div class="template-content">
                <h3 style="font-size: 1.5em; color: #2563eb; margin-bottom: 1em;">세무 서비스 정보</h3>
                <div class="info-section" style="margin-bottom: 1em;">
                    <p><strong>💼 세무 서비스:</strong> [개인/법인/모두 중 선택]</p>
                    <p><strong>📊 전문 분야:</strong></p>
                    <p><strong>💵 서비스 요금:</strong></p>
                    <p><strong>🕒 상담 가능 시간:</strong></p>
                    <p><strong>📜 자격증 및 경력:</strong></p>
                </div>
            </div>
        `
    };

    useEffect(() => {
        const savedAuth = localStorage.getItem('pi_auth');
        if (savedAuth) {
            setAuthData(savedAuth);
        }
    }, []);

    // 카테고리 변경 시 템플릿 업데이트
    useEffect(() => {
        setDescription(templates[type]);
    }, [type]);

    const handleMapClick = async (e: { latlng: LatLng }) => {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);

        // 선택한 위치의 주소 가져오기
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            setAddress(data.display_name);
        } catch (error) {
            console.error("Error fetching address:", error);
        }
    };

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-6">새로운 장소 추가</h2>
                <Form method="post" className="space-y-6" encType="multipart/form-data">
                    <input
                        type="hidden"
                        name="authData"
                        value={authData || ''}
                    />

                    {/* 장소 이름 입력 필드 */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">
                            장소 이름
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* 선택된 주소 표시 */}
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium mb-1">
                            선택된 주소
                        </label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* 지도 */}
                    <div className="h-[400px] bg-gray-100 rounded-lg overflow-hidden">
                        <ClientOnly fallback={<div>지도를 불러오는 중...</div>}>
                            {() => <SaveMap position={position} onMapClick={handleMapClick} />}
                        </ClientOnly>
                    </div>

                    {/* 위도/경도 hidden 필드 */}
                    <input type="hidden" name="latitude" value={position[0]} />
                    <input type="hidden" name="longitude" value={position[1]} />
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-1">
                            전화번호
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            placeholder="+1 (234) 567-8900"
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
                        <label htmlFor="type" className="block text-sm font-medium mb-1">
                            카테고리
                        </label>
                        <select
                            id="type"
                            name="type"
                            value={type}
                            onChange={(e) => setType(e.target.value as MarkerType)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="education">교육</option>
                            <option value="relay">중계</option>
                            <option value="tax">세무</option>
                        </select>
                        <p className="mt-1 text-sm text-gray-500">
                            카테고리 변경 시 기존 작성된 내용이 사라집니다.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-1">
                            상세 정보
                        </label>
                        <ClientOnly fallback={<div className="h-[300px] bg-gray-100 animate-pulse rounded-lg" />}>
                            {() => (
                                <>
                                    <Sunediter
                                        setContents={description}
                                        onChange={(value) => setDescription(value)}
                                        defaultValue={description}
                                    />
                                    <input
                                        type="hidden"
                                        name="description"
                                        value={description}
                                    />
                                </>
                            )}
                        </ClientOnly>
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
            </div >
        </div >
    );
}