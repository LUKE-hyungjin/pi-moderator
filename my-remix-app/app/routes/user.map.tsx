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
import { useLanguage } from "~/contexts/LanguageContext";
import { useTranslation } from "~/hooks/useTranslation";
import { translateToString } from "~/i18n/translations";

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
    const { language } = useLanguage();
    const { t } = useTranslation(language);
    const [address, setAddress] = useState("");
    const [authData, setAuthData] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [type, setType] = useState<MarkerType>('education');
    const [position, setPosition] = useState<[number, number]>([37.5665, 126.9780]); // 서울 중심 좌표

    // 카테고리별 템플릿 정의
    const getTemplates = (t: any) => ({
        education: `
            <div class="template-content">
                <h3 style="font-size: 1.5em; color: #2563eb; margin-bottom: 1em;">${translateToString(t('template.education.title'))}</h3>
                <div class="info-section" style="margin-bottom: 1em;">
                    <p><strong>${translateToString(t('template.education.type'))}:</strong> ${translateToString(t('template.education.type.placeholder'))}</p>
                    <p><strong>${translateToString(t('template.education.capacity'))}:</strong> ${translateToString(t('template.education.capacity.placeholder'))}</p>
                    <p><strong>${translateToString(t('template.education.curriculum'))}:</strong></p>
                    <p><strong>${translateToString(t('template.education.instructor'))}:</strong></p>
                    <p><strong>${translateToString(t('template.education.fee'))}:</strong></p>
                    <p><strong>${translateToString(t('template.education.schedule'))}:</strong></p>
                </div>
                <div>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 1em; background-color: #1e1e1e;">
                        <thead>
                            <tr>
                                <th style="border: 1px solid #333; padding: 8px; background-color: #000000;"><span style="color: #000000;">${translateToString(t('template.education.table.order'))}</span></th>
                                <th style="border: 1px solid #333; padding: 8px; background-color: #000000;"><span style="color: #000000;">${translateToString(t('template.education.table.time'))}</span></th>
                                <th style="border: 1px solid #333; padding: 8px; background-color: #000000;"><span style="color: #000000;">${translateToString(t('template.education.table.content'))}</span></th>
                                <th style="border: 1px solid #333; padding: 8px; background-color: #000000;"><span style="color: #000000;">${translateToString(t('template.education.table.manager'))}</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="border: 1px solid #333; padding: 8px; color: #e0e0e0; background-color: #1e1e1e;">1</td>
                                <td style="border: 1px solid #333; padding: 8px; color: #e0e0e0; background-color: #1e1e1e;">[${translateToString(t('template.education.table.time'))}]</td>
                                <td style="border: 1px solid #333; padding: 8px; color: #e0e0e0; background-color: #1e1e1e;">[${translateToString(t('template.education.table.content'))}]</td>
                                <td style="border: 1px solid #333; padding: 8px; color: #e0e0e0; background-color: #1e1e1e;">[${translateToString(t('template.education.table.manager'))}]</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div>
                    <p><strong>${translateToString(t('template.education.other'))}:</strong></p>
                </div>
            </div>
        `,
        relay: `
            <div class="template-content">
                <h3 style="font-size: 1.5em; color: #2563eb; margin-bottom: 1em;">${translateToString(t('template.relay.title'))}</h3>
                <div class="info-section" style="margin-bottom: 1em;">
                    <p><strong>${translateToString(t('template.relay.method'))}:</strong> ${translateToString(t('template.relay.method.placeholder'))}</p>
                    <p><strong>${translateToString(t('template.relay.hours'))}:</strong> ${translateToString(t('template.relay.hours.placeholder'))}</p>
                    <p><strong>${translateToString(t('template.relay.area'))}:</strong></p>
                    <p><strong>${translateToString(t('template.relay.fee'))}:</strong></p>
                    <p><strong>${translateToString(t('template.relay.notes'))}:</strong></p>
                </div>
            </div>
        `,
        tax: `
            <div class="template-content">
                <h3 style="font-size: 1.5em; color: #2563eb; margin-bottom: 1em;">${translateToString(t('template.tax.title'))}</h3>
                <div class="info-section" style="margin-bottom: 1em;">
                    <p><strong>${translateToString(t('template.tax.service'))}:</strong> ${translateToString(t('template.tax.service.placeholder'))}</p>
                    <p><strong>${translateToString(t('template.tax.specialty'))}:</strong></p>
                    <p><strong>${translateToString(t('template.tax.fee'))}:</strong></p>
                    <p><strong>${translateToString(t('template.tax.hours'))}:</strong></p>
                    <p><strong>${translateToString(t('template.tax.credentials'))}:</strong></p>
                </div>
            </div>
        `
    });

    // 컴포넌트 내부에서 사용
    const templates = getTemplates(t);

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
                <h2 className="text-3xl font-bold mb-6">
                    {translateToString(t('user.map.place.form.title'))}
                </h2>
                <Form method="post" className="space-y-6" encType="multipart/form-data">
                    <input
                        type="hidden"
                        name="authData"
                        value={authData || ''}
                    />

                    {/* 장소 이름 입력 필드 */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">
                            {translateToString(t('user.map.place.form.name'))}
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            placeholder={translateToString(t('user.map.place.form.name.placeholder'))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* 선택된 주소 표시 */}
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium mb-1">
                            {translateToString(t('user.map.place.form.address'))}
                        </label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                            placeholder={translateToString(t('user.map.place.form.address.placeholder'))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* 지도 */}
                    <div className="h-[400px] bg-gray-100 rounded-lg overflow-hidden">
                        <ClientOnly fallback={<div>{translateToString(t('map.loading'))}</div>}>
                            {() => <SaveMap position={position} onMapClick={handleMapClick} />}
                        </ClientOnly>
                    </div>

                    {/* 위도/경도 hidden 필드 */}
                    <input type="hidden" name="latitude" value={position[0]} />
                    <input type="hidden" name="longitude" value={position[1]} />
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-1">
                            {translateToString(t('user.map.place.form.phone'))}
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            placeholder={translateToString(t('user.map.place.form.phone.placeholder'))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="image" className="block text-sm font-medium mb-1">
                            {translateToString(t('user.map.place.form.image'))}
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
                            {translateToString(t('user.map.place.form.image.description'))}
                        </p>
                    </div>

                    <div>
                        <label htmlFor="type" className="block text-sm font-medium mb-1">
                            {translateToString(t('user.map.place.form.type'))}
                        </label>
                        <select
                            id="type"
                            name="type"
                            value={type}
                            onChange={(e) => setType(e.target.value as MarkerType)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="education">{translateToString(t('user.map.place.type.education'))}</option>
                            <option value="relay">{translateToString(t('user.map.place.type.relay'))}</option>
                            <option value="tax">{translateToString(t('user.map.place.type.tax'))}</option>
                        </select>
                        <p className="mt-1 text-sm text-gray-500">
                            {translateToString(t('user.map.place.form.type.warning'))}
                        </p>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-1">
                            {translateToString(t('user.map.place.form.description'))}
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

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            {translateToString(t('user.map.place.form.cancel'))}
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            {translateToString(t('user.map.place.form.submit'))}
                        </button>
                    </div>
                </Form>
            </div >
        </div >
    );
}