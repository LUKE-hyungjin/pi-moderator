'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SetupDBPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const supabase = createClient();

    const SQL_CREATE_TABLES = `
-- 사용자 테이블 생성
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  username TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_admin BOOLEAN NOT NULL DEFAULT false,
  points INTEGER NOT NULL DEFAULT 0,
  last_login_date TIMESTAMP WITH TIME ZONE,
  pi_uid TEXT
);

-- 마커 테이블 생성
CREATE TABLE IF NOT EXISTS public.markers (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  fee_percentage INTEGER NOT NULL DEFAULT 0,
  rating DOUBLE PRECISION NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  image_url TEXT,
  type TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id),
  phone TEXT
);

-- 리뷰 테이블 생성
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY,
  marker_id UUID NOT NULL REFERENCES public.markers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 마커와 리뷰 테이블에 인덱스 생성
CREATE INDEX IF NOT EXISTS markers_created_by_idx ON public.markers(created_by);
CREATE INDEX IF NOT EXISTS reviews_marker_id_idx ON public.reviews(marker_id);
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS users_pi_uid_idx ON public.users(pi_uid);

-- RLS 정책 설정
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능하도록 설정
CREATE POLICY "모든 사용자가 users 읽기 가능" ON public.users FOR SELECT USING (true);
CREATE POLICY "모든 사용자가 markers 읽기 가능" ON public.markers FOR SELECT USING (true);
CREATE POLICY "모든 사용자가 reviews 읽기 가능" ON public.reviews FOR SELECT USING (true);

-- 인증된 사용자만 데이터 생성 가능하도록 설정
CREATE POLICY "인증된 사용자만 users 생성 가능" ON public.users FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "인증된 사용자만 markers 생성 가능" ON public.markers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "인증된 사용자만 reviews 생성 가능" ON public.reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 자신의 데이터만 수정/삭제 가능하도록 설정 (생략 가능)
-- CREATE POLICY "자신의 users만 수정 가능" ON public.users FOR UPDATE USING (auth.uid()::text = id::text);
-- CREATE POLICY "자신의 markers만 수정 가능" ON public.markers FOR UPDATE USING (auth.uid()::text = created_by::text);
-- CREATE POLICY "자신의 reviews만 수정 가능" ON public.reviews FOR UPDATE USING (auth.uid()::text = user_id::text);
`;

    // Supabase에서 직접 SQL 실행은 어렵기 때문에 설명만 제공합니다.
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">파이코인 데이터베이스 설정</h1>

            {error && <div className="bg-red-100 text-red-800 p-4 mb-4 rounded">{error}</div>}
            {success && <div className="bg-green-100 text-green-800 p-4 mb-4 rounded">{success}</div>}

            <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">데이터베이스 테이블 생성 방법</h2>
                <p className="mb-4">
                    "relation 'public.users' does not exist" 오류는 Supabase에 필요한 테이블이 아직 생성되지 않았다는 의미입니다.
                    다음 단계를 따라 필요한 테이블을 생성해주세요:
                </p>

                <ol className="list-decimal list-inside space-y-2 mb-6">
                    <li>Supabase 대시보드에 로그인합니다.</li>
                    <li>왼쪽 메뉴에서 'SQL 에디터'를 클릭합니다.</li>
                    <li>새 쿼리를 생성하고 아래의 SQL을 붙여넣습니다.</li>
                    <li>'실행' 버튼을 클릭하여 SQL을 실행합니다.</li>
                </ol>

                <div className="bg-zinc-800 text-gray-200 p-4 rounded-md overflow-auto max-h-96 mb-6">
                    <pre className="text-xs whitespace-pre-wrap">{SQL_CREATE_TABLES}</pre>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                    위 SQL은 필요한 모든 테이블(users, markers, reviews)을 생성하고 관계를 설정합니다.
                </p>
            </div>

            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">다음 단계</h2>
                <p>테이블을 성공적으로 생성한 후, <a href="/picoin" className="text-blue-500 hover:underline">테스트 페이지</a>로 이동하여 데이터를 추가해보세요.</p>
            </div>
        </div>
    );
} 