function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} 환경변수가 설정되지 않았습니다.`);
    }
    return value;
}

export const ENV = {
    SUPABASE_URL: requireEnv("SUPABASE_URL"),
    SUPABASE_ANON_KEY: requireEnv("SUPABASE_ANON_KEY"),
    PI_API_URL: requireEnv("PI_API_URL"),
    PI_API_KEY: requireEnv("PI_API_KEY"),
}; 