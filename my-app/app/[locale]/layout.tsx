import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getTotalUsers, getTodayUsers } from '@/lib/supabase/actions';
import { ThemeProvider } from '@/components/ThemeProvider';

type Params = Promise<{ locale: never }>;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { locale } = await params; // next js 15버전부터 Params 사용시 비동기로 변경됨
  // https://nextjs.org/docs/messages/sync-dynamic-apis

  // 들어오는 `로케일`이 유효한지 확인하세요.
  if (!routing.locales.includes(locale)) {
    notFound();
  }

  // 클라이언트에게 모든 메시지 제공
  const messages = await getMessages();

  // Supabase에서 사용자 통계 조회
  const totalUsers = await getTotalUsers();
  const todayUsers = await getTodayUsers();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head />
      <body className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
          enableColorScheme={true}
        >
          <NextIntlClientProvider messages={messages}>
            <Navbar />
            <main className="flex-grow flex flex-col">
              {children}
            </main>
            <Footer totalUsers={totalUsers} todayUsers={todayUsers} />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}