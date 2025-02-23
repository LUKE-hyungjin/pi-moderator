import type { FooterProps } from "~/types";

export function Footer({ totalUsers, todayUsers }: FooterProps) {
    return (
        <footer className="bg-[#1a1a1a] text-white py-6">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-6">
                        <a
                            href="mailto:pi.moderator.official@gmail.com"
                            className="flex items-center space-x-2 hover:text-purple-400"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>E-mail</span>
                        </a>
                    </div>
                    <div className="flex flex-col items-center md:w-1/3">
                        <span>총 이용자: {totalUsers.toLocaleString()}명</span>
                        <span>오늘 접속자: {todayUsers.toLocaleString()}명</span>
                    </div>
                    <div className="flex items-center justify-end space-x-6 md:w-1/3">
                        <select
                            // value={language}
                            // onChange={(e) => setLanguage(e.target.value as 'ko' | 'en')}
                            className="bg-[#333] text-white px-3 py-1.5 rounded-md text-sm border border-[#444] 
                                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                                    hover:bg-[#444] transition-colors duration-200"
                        >
                            <option value="ko">한국어</option>
                            <option value="en">English</option>
                        </select>
                        <div className="flex flex-col items-center text-sm text-gray-400">© 2024 Pi-Moderator. All rights reserved.</div>
                    </div>
                </div>
            </div>
        </footer>
    );
} 