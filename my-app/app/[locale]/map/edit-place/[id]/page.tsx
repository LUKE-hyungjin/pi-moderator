'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

// 동적 지도 컴포넌트 로드 (서버 컴포넌트에서는 leaflet 사용 불가)
const SaveMapComponent = dynamic(() => import('@/components/SaveMapComponent'), {
    ssr: false,
    loading: () => <div className="h-[400px] bg-zinc-800 rounded-lg flex items-center justify-center">지도 로딩 중...</div>
});

// 마커 타입 정의
type MarkerType = 'education' | 'exchange' | 'tax';

// Pi Network 인증 타입
interface PiUser {
    uid: string;
    username: string;
}

interface AuthResult {
    accessToken: string;
    user: PiUser;
}

// 장소 데이터 인터페이스
interface PlaceData {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address: string;
    phone: string;
    description: string;
    type: string;
    image_url?: string;
    created_by: string;
}

export default function EditPlacePage({ params }: { params: { id: string } }) {
    const t = useTranslations('Map');
    const router = useRouter();
    const supabase = createClient();
    const [position, setPosition] = useState<[number, number]>([37.5665, 126.9780]); // 서울 중심 좌표
    const [auth, setAuth] = useState<AuthResult | null>(null);
    const [placeData, setPlaceData] = useState<PlaceData | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // 폼 상태 관리
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [type, setType] = useState<MarkerType>('education');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    // 인증 상태 확인 및 장소 데이터 로드
    useEffect(() => {
        // 로그인 확인
        const savedAuth = localStorage.getItem('pi_auth');
        if (savedAuth) {
            try {
                const authData = JSON.parse(savedAuth);
                setAuth(authData);
                fetchPlaceData(params.id, authData.user.uid);
            } catch (error) {
                console.error("저장된 인증 정보 파싱 오류:", error);
                router.push('/user'); // 인증 정보가 잘못된 경우 사용자 페이지로 리디렉션
            }
        } else {
            // 인증 정보가 없으면 사용자 페이지로 리디렉션
            router.push('/user');
        }
    }, [params.id, router]);

    // 장소 데이터 조회
    const fetchPlaceData = async (placeId: string, userId: string) => {
        try {
            const { data, error } = await supabase
                .from('markers')
                .select('*')
                .eq('id', placeId)
                .single();

            if (error) {
                console.error('장소 조회 오류:', error);
                router.push('/user');
                return;
            }

            if (!data) {
                console.error('장소를 찾을 수 없습니다.');
                router.push('/user');
                return;
            }

            // 본인이 등록한 장소인지 확인
            if (data.created_by !== userId) {
                console.error('접근 권한이 없습니다.');
                router.push('/user');
                return;
            }

            setPlaceData(data);
            setName(data.name);
            setAddress(data.address);
            setPhone(data.phone || '');
            setType(data.type as MarkerType);
            setDescription(data.description);
            setPosition([data.latitude, data.longitude]);

            if (data.image_url) {
                setImagePreview(data.image_url);
            }

        } catch (error) {
            console.error('장소 데이터 로드 오류:', error);
            router.push('/user');
        }
    };

    // 지도 클릭 이벤트 핸들러
    const handleMapClick = async (newPosition: [number, number]) => {
        setPosition(newPosition);

        // 선택한 위치의 주소 가져오기
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPosition[0]}&lon=${newPosition[1]}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            setAddress(data.display_name);
        } catch (error) {
            console.error("Error fetching address:", error);
        }
    };

    // 이미지 파일 변경 처리
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);

            // 이미지 미리보기
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target && typeof event.target.result === 'string') {
                    setImagePreview(event.target.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // 폼 제출 처리
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError('');

        try {
            if (!name || !address || !description) {
                setFormError('필수 입력 필드를 모두 채워주세요.');
                return;
            }

            if (!placeData) {
                setFormError('장소 데이터를 찾을 수 없습니다.');
                return;
            }

            // 인증 데이터 확인
            if (!auth) {
                setFormError('로그인이 필요합니다.');
                router.push('/user');
                return;
            }

            const userId = auth.user.uid;

            // 이미지 업로드 처리
            let imageUrl = placeData.image_url || '';
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;

                const { error: uploadError, data: uploadData } = await supabase.storage
                    .from('marker-images')
                    .upload(fileName, imageFile, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    console.error('이미지 업로드 오류:', uploadError);
                    setFormError('이미지 업로드 중 오류가 발생했습니다.');
                    return;
                }

                // 업로드된 이미지의 공개 URL 가져오기
                const { data: { publicUrl } } = supabase.storage
                    .from('marker-images')
                    .getPublicUrl(fileName);

                imageUrl = publicUrl;
            }

            // 마커 정보 업데이트
            const { error: markerError } = await supabase
                .from('markers')
                .update({
                    name,
                    latitude: position[0],
                    longitude: position[1],
                    address,
                    phone: phone || '',
                    image_url: imageUrl,
                    description
                })
                .eq('id', placeData.id);

            if (markerError) {
                console.error('마커 수정 오류:', markerError);
                setFormError('장소 수정 중 오류가 발생했습니다.');
                return;
            }

            // 성공 시 사용자 페이지로 이동
            router.push('/user');

        } catch (error) {
            console.error('폼 제출 오류:', error);
            setFormError('폼 제출 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 로딩 중 UI
    if (!placeData) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="flex justify-center items-center h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto bg-zinc-900 rounded-lg overflow-hidden shadow-lg">
                <div className="p-6">
                    <h1 className="text-3xl font-bold mb-8 text-white">{t('edit_place_title')}</h1>

                    {formError && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-md">
                            <p className="text-red-300">{formError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                        {/* 장소 이름 입력 필드 */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-200">
                                {t('place.form.name')}
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder={t('place.form.name_placeholder')}
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                            />
                        </div>

                        {/* 주소 입력 필드 */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium mb-1 text-gray-200">
                                {t('place.form.address')}
                            </label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                                placeholder={t('place.form.address_placeholder')}
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                            />
                        </div>

                        {/* 지도 */}
                        <div className="h-[400px] bg-zinc-800 rounded-lg overflow-hidden relative z-0">
                            <SaveMapComponent
                                position={position}
                                onPositionSelect={handleMapClick}
                            />
                        </div>

                        {/* 위도/경도 hidden 필드 */}
                        <input type="hidden" name="latitude" value={position[0]} />
                        <input type="hidden" name="longitude" value={position[1]} />

                        {/* 전화번호 입력 필드 */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium mb-1 text-gray-200">
                                {t('place.form.phone')}
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder={t('place.form.phone_placeholder')}
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                            />
                        </div>

                        {/* 이미지 업로드 필드 */}
                        <div>
                            <label htmlFor="image" className="block text-sm font-medium mb-1 text-gray-200">
                                {t('place.form.image')}
                            </label>
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                {imagePreview && (
                                    <div className="w-32 h-32 rounded-md overflow-hidden bg-zinc-800 flex-shrink-0">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        id="image"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-500 file:text-white hover:file:bg-blue-600 text-gray-400"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        {t('place.form.image_description')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 장소 유형 - 읽기 전용 표시 */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-200">
                                {t('place.type')}
                            </label>
                            <div className="bg-zinc-800 px-4 py-3 rounded-md border border-zinc-700 text-white">
                                {type === 'education' && t('type_education')}
                                {type === 'exchange' && t('type_exchange')}
                                {type === 'tax' && t('type_tax')}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                {t('type_warning')}
                            </p>
                        </div>

                        {/* 장소 설명 입력 필드 */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium mb-1 text-gray-200">
                                {t('place.description')}
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                rows={8}
                                placeholder={t('place.description_edit_placeholder')}
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                            />
                        </div>

                        {/* 제출 및 취소 버튼 */}
                        <div className="flex gap-4 justify-end">
                            <Button
                                type="button"
                                onClick={() => router.push('/user')}
                                className="bg-zinc-700 hover:bg-zinc-600 text-white px-8"
                            >
                                {t('cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-8"
                            >
                                {isSubmitting ? t('submitting') : t('save')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 