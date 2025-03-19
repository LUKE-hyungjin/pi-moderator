'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';


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

// SaveMapComponent를 클라이언트 사이드에서만 렌더링하기 위한 동적 임포트
const SaveMapComponent = dynamic(() => import('@/components/SaveMapComponent'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[400px] bg-zinc-900/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
    )
});

// SuneditorComponent를 클라이언트 사이드에서만 렌더링하기 위한 동적 임포트
const SuneditorComponent = dynamic(() => import('@/components/SuneditorComponent'), {
    ssr: false,
    loading: () => (
        <div className="h-[400px] bg-zinc-900/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
    )
});

export default function AddPlacePage() {
    const t = useTranslations('Map');
    const typeT = useTranslations('Map.place.type');
    const router = useRouter();
    const supabase = createClient();
    const [position, setPosition] = useState<[number, number]>([37.5665, 126.9780]); // 서울 중심 좌표
    const [auth, setAuth] = useState<AuthResult | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    // 폼 상태 관리
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [type, setType] = useState<MarkerType>('education');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    // localStorage에서 인증 정보 확인
    useEffect(() => {
        // 로그인 확인
        const savedAuth = localStorage.getItem('pi_auth');
        if (savedAuth) {
            try {
                setAuth(JSON.parse(savedAuth));
            } catch (error) {
                console.error("저장된 인증 정보 파싱 오류:", error);
                router.push('/user'); // 인증 정보가 잘못된 경우 사용자 페이지로 리디렉션
            }
        } else {
            // 인증 정보가 없으면 사용자 페이지로 리디렉션
            router.push('/user');
        }
    }, [router]);

    // 템플릿 정의 (각 카테고리별)
    const getTemplateForType = (type: MarkerType): string => {
        switch (type) {
            case 'education':
                return `
          <div class="template-content">
            <h3 style="font-size: 1.5em; color: #2563eb; margin-bottom: 1em;">교육 시설 정보</h3>
            <div class="info-section" style="margin-bottom: 1em;">
              <p><strong>교육 유형:</strong> 예) 파이코인 교육, 블록체인 이론 등</p>
              <p><strong>수용 인원:</strong> 예) 최대 20명</p>
              <p><strong>커리큘럼:</strong></p>
              <p><strong>강사진:</strong></p>
              <p><strong>교육비:</strong></p>
              <p><strong>교육 일정:</strong></p>
            </div>
            <div>
              <p><strong>기타 사항:</strong></p>
            </div>
          </div>
        `;
            case 'exchange':
                return `
          <div class="template-content">
            <h3 style="font-size: 1.5em; color: #2563eb; margin-bottom: 1em;">중계소 정보</h3>
            <div class="info-section" style="margin-bottom: 1em;">
              <p><strong>중계 방식:</strong> 예) 직접 중계, 온라인 등</p>
              <p><strong>운영 시간:</strong> 예) 평일 9시-18시</p>
              <p><strong>서비스 지역:</strong></p>
              <p><strong>수수료:</strong></p>
              <p><strong>참고 사항:</strong></p>
            </div>
          </div>
        `;
            case 'tax':
                return `
          <div class="template-content">
            <h3 style="font-size: 1.5em; color: #2563eb; margin-bottom: 1em;">세무 상담소 정보</h3>
            <div class="info-section" style="margin-bottom: 1em;">
              <p><strong>제공 서비스:</strong> 예) 파이코인 세무 상담, 세금 신고 대행 등</p>
              <p><strong>전문 분야:</strong></p>
              <p><strong>상담 비용:</strong></p>
              <p><strong>운영 시간:</strong></p>
              <p><strong>자격증:</strong></p>
            </div>
          </div>
        `;
        }
    };

    // 초기 템플릿 설정
    useEffect(() => {
        setDescription(getTemplateForType(type));
    }, []);

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

    // 타입 변경 시 설명 필드 업데이트
    const handleTypeChange = (newType: MarkerType) => {
        setType(newType);
        setDescription(getTemplateForType(newType));
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

            if (!imageFile) {
                setFormError('이미지를 업로드해주세요.');
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
            let imageUrl = '';
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

            // 마커 정보 저장
            const { error: markerError } = await supabase
                .from('markers')
                .insert([
                    {
                        id: crypto.randomUUID(),
                        name,
                        latitude: position[0],
                        longitude: position[1],
                        address,
                        phone: phone || '',
                        image_url: imageUrl,
                        rating: 0,
                        description,
                        type,
                        created_by: userId,
                        fee_percentage: 0 // 필수 필드라 기본값 설정
                    }
                ]);

            if (markerError) {
                console.error('마커 추가 오류:', markerError);
                setFormError('장소 추가 중 오류가 발생했습니다.');
                return;
            }

            // 성공 시 지도 페이지로 이동
            router.push('..');

        } catch (error) {
            console.error('폼 제출 오류:', error);
            setFormError('폼 제출 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!auth) {
        return (
            <div className="container mx-auto px-6 py-8 text-center">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold mb-6">로그인이 필요합니다</h2>
                    <p className="mb-6">이 페이지에 접근하려면 로그인이 필요합니다.</p>
                    <Button
                        onClick={() => router.push('/user')}
                        className="bg-blue-500 text-white hover:bg-blue-600"
                    >
                        사용자 페이지로 이동
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-6">
                    {t('place.form.title')}
                </h2>

                {formError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {formError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                    {/* 장소 이름 입력 필드 */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* 주소 입력 필드 */}
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium mb-1">
                            {t('place.form.address')}
                        </label>
                    </div>

                    {/* 지도 */}
                    <div className="h-[400px] bg-gray-100 rounded-lg overflow-hidden relative z-0">
                        <SaveMapComponent
                            position={position}
                            onPositionSelect={handleMapClick}
                        />
                    </div>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        placeholder={t('place.form.address_placeholder')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* 위도/경도 hidden 필드 */}
                    <input type="hidden" name="latitude" value={position[0]} />
                    <input type="hidden" name="longitude" value={position[1]} />

                    {/* 전화번호 입력 필드 */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-1">
                            {t('place.form.phone')}
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder={t('place.form.phone_placeholder')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* 이미지 업로드 필드 */}
                    <div>
                        <label htmlFor="image" className="block text-sm font-medium mb-1">
                            {t('place.form.image')}
                        </label>
                        <div className="relative w-full border-2 border-dashed border-blue-400 dark:border-blue-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150">
                            <input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setImageFile(file);
                                    }
                                }}
                                required
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center justify-center text-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-10 w-10 text-blue-500 dark:text-blue-400 mb-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                    {imageFile ? imageFile.name : t('place.form.image_placeholder')}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {t('place.form.image_formats')}
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {t('place.form.image_description')}
                        </p>
                    </div>

                    {/*  필드 */}
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium mb-2">
                            {t('place.form.type')}
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <div
                                className={`flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-colors duration-150 ${type === 'education'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400'
                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                onClick={() => handleTypeChange('education')}
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {typeT('education')}
                                </span>
                            </div>

                            <div
                                className={`flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-colors duration-150 ${type === 'exchange'
                                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30 dark:border-pink-400'
                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                onClick={() => handleTypeChange('exchange')}
                            >
                                <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600 dark:text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {typeT('exchange')}
                                </span>
                            </div>

                            <div
                                className={`flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-colors duration-150 ${type === 'tax'
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-400'
                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                onClick={() => handleTypeChange('tax')}
                            >
                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {typeT('tax')}
                                </span>
                            </div>
                        </div>
                        <input
                            type="hidden"
                            name="type"
                            value={type}
                        />
                    </div>

                    {/* 장소 설명 입력 필드 */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-1">
                            {t('place.form.description')}
                        </label>
                        <div className="h-[500px] bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                            <SuneditorComponent
                                setContents={description}
                                onChange={(value) => setDescription(value)}
                                height="500px"
                                placeholder={t('place.form.description_placeholder')}
                            />
                        </div>
                        <input
                            type="hidden"
                            name="description"
                            value={description}
                        />
                    </div>

                    {/* 버튼 영역 */}
                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="px-4 py-2"
                        >
                            {t('place.form.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600"
                        >
                            {isSubmitting ? '처리 중...' : t('place.form.submit')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
