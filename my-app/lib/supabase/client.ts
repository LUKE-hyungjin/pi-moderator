'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

// 클라이언트 컴포넌트에서 사용할 Supabase 클라이언트 인스턴스
export const createClient = () =>
    createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ); 