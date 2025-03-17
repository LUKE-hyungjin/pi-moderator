-- 사용자 테이블 생성
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  username TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_admin BOOLEAN NOT NULL DEFAULT false,
  points INTEGER NOT NULL DEFAULT 0,
  last_login_date TIMESTAMP WITH TIME ZONE
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