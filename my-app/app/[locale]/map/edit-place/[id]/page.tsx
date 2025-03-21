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

// SuneditorComponent를 클라이언트 사이드에서만 렌더링하기 위한 동적 임포트
const SuneditorComponent = dynamic(() => import('@/components/SuneditorComponent').then(mod => mod.default), {
    ssr: false,
    loading: () => (
        <div className="h-[500px] bg-zinc-800 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
    )
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
    const [position, setPosition] = useState<[number, number]>([37.5665, 126.9780]); // 서울 중심 좌표 (초기값)
    const [auth, setAuth] = useState<AuthResult | null>(null);
    const [placeData, setPlaceData] = useState<PlaceData | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // params에서 ID 값 가져오기
    const placeId = params.id;

    // 폼 상태 관리
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [type, setType] = useState<MarkerType>('education');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const typeT = useTranslations('Map.place.type');

    // 현재 위치 가져오기
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // 장소 데이터가 아직 로드되지 않았을 때만 현재 위치 사용
                    if (!placeData) {
                        setPosition([position.coords.latitude, position.coords.longitude]);
                    }
                },
                (error) => {
                    console.error("현재 위치를 가져오는데 실패했습니다:", error);
                    // 기본 위치(서울 중심)로 유지
                }
            );
        }
    }, [placeData]);

    // 인증 상태 확인 및 장소 데이터 로드
    useEffect(() => {
        // 로그인 확인
        const savedAuth = localStorage.getItem('pi_auth');
        if (savedAuth) {
            try {
                const authData = JSON.parse(savedAuth);
                setAuth(authData);
                fetchPlaceData(placeId, authData.user.uid);
            } catch (error) {
                console.error("저장된 인증 정보 파싱 오류:", error);
                router.push('/user'); // 인증 정보가 잘못된 경우 사용자 페이지로 리디렉션
            }
        } else {
            // 인증 정보가 없으면 사용자 페이지로 리디렉션
            router.push('/user');
        }
    }, [placeId, router]);

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

    // 장소 삭제 처리
    const handleDelete = async () => {
        if (!window.confirm(t('delete_confirm'))) return;

        setIsSubmitting(true);
        setFormError('');

        try {
            if (!placeData || !auth) {
                router.push('/user');
                return;
            }

            // 이미지 파일이 있다면 스토리지에서 삭제
            if (placeData.image_url) {
                // URL에서 파일 이름 추출
                const fileName = placeData.image_url.split('/').pop();
                if (fileName) {
                    await supabase.storage
                        .from('marker-images')
                        .remove([fileName]);
                }
            }

            // 마커 데이터 삭제
            const { error } = await supabase
                .from('markers')
                .delete()
                .eq('id', placeData.id);

            if (error) {
                console.error('장소 삭제 오류:', error);
                setFormError('장소 삭제 중 오류가 발생했습니다.');
                return;
            }

            // 삭제 성공 시 사용자 페이지로 이동
            router.push('/user');
        } catch (error) {
            console.error('장소 삭제 오류:', error);
            setFormError('장소 삭제 중 오류가 발생했습니다.');
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
                                {t('place.form.type')}
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                <div
                                    className={`flex flex-col items-center p-3 rounded-lg border-2 cursor-not-allowed transition-colors duration-150 ${type === 'education'
                                        ? 'border-blue-500 bg-blue-50/10 dark:bg-blue-900/30 dark:border-blue-400'
                                        : 'border-gray-700 dark:border-gray-700 opacity-50'
                                        }`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-gray-300">
                                        {typeT('education')}
                                    </span>
                                </div>

                                <div
                                    className={`flex flex-col items-center p-3 rounded-lg border-2 cursor-not-allowed transition-colors duration-150 ${type === 'exchange'
                                        ? 'border-pink-500 bg-pink-50/10 dark:bg-pink-900/30 dark:border-pink-400'
                                        : 'border-gray-700 dark:border-gray-700 opacity-50'
                                        }`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600 dark:text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-gray-300">
                                        {typeT('exchange')}
                                    </span>
                                </div>

                                <div
                                    className={`flex flex-col items-center p-3 rounded-lg border-2 cursor-not-allowed transition-colors duration-150 ${type === 'tax'
                                        ? 'border-green-500 bg-green-50/10 dark:bg-green-900/30 dark:border-green-400'
                                        : 'border-gray-700 dark:border-gray-700 opacity-50'
                                        }`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-gray-300">
                                        {typeT('tax')}
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                {t('type_warning')}
                            </p>
                        </div>

                        {/* 장소 설명 입력 필드 */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium mb-1 text-gray-200">
                                {t('place.form.description')}
                            </label>
                            <div className="bg-zinc-800 rounded-lg overflow-hidden">
                                <SuneditorComponent
                                    key={type}
                                    setContents={description}
                                    onChange={(value) => setDescription(value)}
                                    height="100%"
                                    placeholder={t('place.form.description_placeholder')}
                                    onError={() => {
                                        console.error('에디터 로드 실패');
                                    }}
                                />
                            </div>
                            <input
                                type="hidden"
                                name="description"
                                value={description}
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
                                type="button"
                                onClick={handleDelete}
                                disabled={isSubmitting}
                                className="bg-red-500 hover:bg-red-600 text-white px-8"
                            >
                                {t('delete')}
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