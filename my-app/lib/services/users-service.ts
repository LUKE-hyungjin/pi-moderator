'use client';

import { createClient } from '../supabase/client';
import type { User, InsertUser, UpdateUser } from '../supabase/types';

// 모든 사용자 가져오기 (관리자 전용)
export async function getAllUsers(): Promise<User[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('사용자 조회 오류:', error);
        throw new Error('사용자 목록을 가져오는 중 오류가 발생했습니다.');
    }

    return data || [];
}

// 특정 사용자 정보 가져오기
export async function getUserById(id: string): Promise<User | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`사용자 ID ${id} 조회 오류:`, error);
        throw new Error('사용자 정보를 가져오는 중 오류가 발생했습니다.');
    }

    return data;
}

// 현재 로그인한 사용자 정보 가져오기
export async function getCurrentUser(): Promise<User | null> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('현재 사용자 조회 오류:', error);
        return null;
    }

    return data;
}

// 새 사용자 생성 (회원가입 후 자동 호출)
export async function createUser(user: InsertUser): Promise<User> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('users')
        .insert(user)
        .select()
        .single();

    if (error) {
        console.error('사용자 생성 오류:', error);
        throw new Error('사용자를 생성하는 중 오류가 발생했습니다.');
    }

    return data;
}

// 사용자 정보 업데이트
export async function updateUser(id: string, user: UpdateUser): Promise<User> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('users')
        .update(user)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error(`사용자 ID ${id} 업데이트 오류:`, error);
        throw new Error('사용자 정보를 업데이트하는 중 오류가 발생했습니다.');
    }

    return data;
}

// 포인트 추가/차감
export async function updateUserPoints(id: string, pointsToAdd: number): Promise<User> {
    const supabase = createClient();

    // 현재 사용자 정보 가져오기
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('points')
        .eq('id', id)
        .single();

    if (userError) {
        console.error(`사용자 ID ${id} 포인트 조회 오류:`, userError);
        throw new Error('사용자 포인트 정보를 가져오는 중 오류가 발생했습니다.');
    }

    const currentPoints = userData?.points || 0;
    const newPoints = currentPoints + pointsToAdd;

    // 포인트 업데이트
    const { data, error } = await supabase
        .from('users')
        .update({ points: newPoints })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error(`사용자 ID ${id} 포인트 업데이트 오류:`, error);
        throw new Error('사용자 포인트를 업데이트하는 중 오류가 발생했습니다.');
    }

    return data;
}

// 로그인 날짜 업데이트
export async function updateLastLoginDate(id: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
        .from('users')
        .update({ last_login_date: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        console.error(`사용자 ID ${id} 로그인 날짜 업데이트 오류:`, error);
    }
} 