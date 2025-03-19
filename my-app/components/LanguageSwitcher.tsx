'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, ChevronDown } from 'lucide-react';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const handleLocaleChange = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1.5 hover:bg-white/10 transition-colors px-2.5">
                    <Globe className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium">{locale === 'ko' ? '한국어' : 'English'}</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-900 border border-zinc-700 text-white min-w-32 shadow-lg z-150">
                <DropdownMenuItem
                    onClick={() => handleLocaleChange('ko')}
                    className={`${locale === 'ko' ? 'bg-purple-500/20 text-purple-300' : 'hover:bg-white/10'} cursor-pointer transition-colors`}
                >
                    <span className="mr-2">🇰🇷</span> 한국어
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => handleLocaleChange('en')}
                    className={`${locale === 'en' ? 'bg-purple-500/20 text-purple-300' : 'hover:bg-white/10'} cursor-pointer transition-colors`}
                >
                    <span className="mr-2">🇺🇸</span> English
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
