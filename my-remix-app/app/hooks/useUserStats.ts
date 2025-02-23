import { useState, useEffect } from "react";
import { supabase } from "~/lib/supabase.client";

export function useUserStats() {
    const [totalUsers, setTotalUsers] = useState<number>(0);
    const [todayUsers, setTodayUsers] = useState<number>(0);

    useEffect(() => {
        const fetchUserStats = async () => {
            try {
                const { count: total } = await supabase
                    .from('users')
                    .select('*', { count: 'exact', head: true });

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const { count: today_users } = await supabase
                    .from('users')
                    .select('*', { count: 'exact', head: true })
                    .gte('last_login_date', today.toISOString());

                setTotalUsers(total || 0);
                setTodayUsers(today_users || 0);
            } catch (error) {
                console.error('Failed to fetch user stats:', error);
            }
        };

        fetchUserStats();
    }, []);

    return { totalUsers, todayUsers };
} 