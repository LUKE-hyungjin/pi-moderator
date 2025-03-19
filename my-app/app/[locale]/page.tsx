import { useTranslations } from 'next-intl';
import { Link as I18nLink } from '@/i18n/routing';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, Newspaper, Store, Receipt } from "lucide-react";

export default function Home() {
  const t = useTranslations('Home');

  const services = [
    {
      title: t('education_title'),
      description: t('education_description'),
      cta: t('education_cta'),
      icon: <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-500" />,
      href: '/education',
      color: 'blue'
    },
    {
      title: t('exchange_title'),
      description: t('exchange_description'),
      cta: t('exchange_cta'),
      icon: <Store className="h-8 w-8 text-pink-600 dark:text-pink-500" />,
      href: '/exchange',
      color: 'pink'
    },
    {
      title: t('support_title'),
      description: t('support_description'),
      cta: t('support_cta'),
      icon: <Receipt className="h-8 w-8 text-green-600 dark:text-green-500" />,
      href: '/tax',
      color: 'green'
    },
    {
      title: t('news_title'),
      description: t('news_description'),
      cta: t('news_cta'),
      icon: <Newspaper className="h-8 w-8 text-amber-600 dark:text-yellow-500" />,
      href: '/news',
      color: 'amber'
    }
  ];

  return (
    <main className="flex flex-col min-h-screen">
      {/* 히어로 섹션 */}
      <section className="pt-16 pb-20 text-center bg-gradient-to-b from-white to-gray-100 dark:from-black dark:to-zinc-900 text-gray-800 dark:text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            {t('description')}
          </p>
        </div>
      </section>

      {/* 미션 섹션 */}
      <section className="py-16 bg-white dark:bg-zinc-900 text-gray-800 dark:text-white">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-br from-gray-50 to-white dark:from-zinc-800 dark:to-zinc-900 border border-gray-200 dark:border-zinc-700 shadow-lg shadow-purple-200/50 dark:shadow-purple-900/20 text-gray-800 dark:text-white overflow-hidden">
            <CardHeader className="border-b border-gray-200/80 dark:border-zinc-700/50 pb-4">
              <CardTitle className="text-2xl md:text-3xl text-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                {t('mission_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-center text-gray-700 dark:text-gray-300 text-lg leading-relaxed">{t('mission_description')}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 서비스 섹션 */}
      <section className="py-16 bg-gray-50 dark:bg-black text-gray-800 dark:text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center">
            <span className="border-b-2 border-purple-500 pb-2">Pi Moderator Services</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card key={index} className={`group bg-white hover:bg-gray-50 dark:bg-gradient-to-br dark:from-zinc-800 dark:to-zinc-900 border border-gray-200 dark:border-zinc-700 hover:border-purple-200 dark:hover:border-zinc-500 shadow-lg hover:shadow-xl transition-all duration-300 text-gray-800 dark:text-white overflow-hidden`}>
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="p-2 rounded-xl bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 group-hover:border-gray-300 dark:group-hover:border-zinc-600 transition-colors">
                    {service.icon}
                  </div>
                  <div className="flex flex-col">
                    <CardTitle className={`text-xl text-${service.color}-600 dark:text-${service.color}-400 flex items-center gap-2`}>
                      {service.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 min-h-[80px] text-sm md:text-base">{service.description}</p>
                </CardContent>
                <CardFooter className="pt-0">
                  <I18nLink
                    href={service.href}
                    className={`inline-flex items-center text-${service.color}-600 dark:text-${service.color}-400 hover:text-${service.color}-800 dark:hover:text-${service.color}-300 transition-colors duration-300`}
                  >
                    {service.cta} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </I18nLink>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-indigo-900 text-gray-800 dark:text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('future_title')}</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-10 max-w-3xl mx-auto">{t('future_description')}</p>
          <I18nLink href="/user">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-6 h-auto rounded-full shadow-lg shadow-purple-300/50 dark:shadow-purple-900/50 transition-transform hover:scale-105">
              {t('start_button')}
            </Button>
          </I18nLink>
        </div>
      </section>
    </main>
  );
}