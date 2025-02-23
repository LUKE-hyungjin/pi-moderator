import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { useLanguage } from "~/contexts/LanguageContext";
import { useTranslation } from "~/hooks/useTranslation";

export const meta: MetaFunction = () => {
  return [
    { title: "Pi Moderator - Home" },
    { name: "description", content: "파이코인 커뮤니티의 중심, Pi Moderator에서 모든 정보를 확인하세요!" },
  ];
};

export default function Index() {
  const { language } = useLanguage();
  const { t } = useTranslation(language);

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* 히어로 섹션 */}
        <section className="text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text leading-normal">
            {t('home.title')}
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            {t('home.subtitle')}
          </p>
        </section>

        {/* 미션 섹션 */}
        <section className="bg-[rgba(255,255,255,0.05)] rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-6 text-center">{t('home.mission.title')}</h2>
          <p className="text-gray-300 mb-6 text-center">
            {t('home.mission.description')}
          </p>
        </section>

        {/* 서비스 섹션 */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-[rgba(255,255,255,0.05)] rounded-xl p-6">
            <h3 className="text-2xl font-bold mb-4 text-blue-400">{t('home.service.education.title')}</h3>
            <p className="text-gray-300 mb-4">
              {t('home.service.education.description')}
            </p>
            <Link to="/map?type=education" className="text-blue-400 hover:text-blue-300">
              {t('home.service.education.link')}
            </Link>
          </div>

          <div className="bg-[rgba(255,255,255,0.05)] rounded-xl p-6">
            <h3 className="text-2xl font-bold mb-4 text-red-400">{t('home.service.relay.title')}</h3>
            <p className="text-gray-300 mb-4">
              {t('home.service.relay.description')}
            </p>
            <Link to="/map?type=relay" className="text-red-400 hover:text-red-300">
              {t('home.service.relay.link')}
            </Link>
          </div>

          <div className="bg-[rgba(255,255,255,0.05)] rounded-xl p-6">
            <h3 className="text-2xl font-bold mb-4 text-green-400">{t('home.service.tax.title')}</h3>
            <p className="text-gray-300 mb-4">
              {t('home.service.tax.description')}
            </p>
            <Link to="/map?type=tax" className="text-green-400 hover:text-green-300">
              {t('home.service.tax.link')}
            </Link>
          </div>

          <div className="bg-[rgba(255,255,255,0.05)] rounded-xl p-6">
            <h3 className="text-2xl font-bold mb-4 text-yellow-400">{t('home.service.news.title')}</h3>
            <p className="text-gray-300 mb-4">
              {t('home.service.news.description')}
            </p>
            <Link to="/pi" className="text-pink-400 hover:text-yellow-300">
              {t('home.service.news.link')}
            </Link>
          </div>
        </section>

        {/* CTA 섹션 */}
        <section className="text-center bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-4">{t('home.cta.title')}</h2>
          <p className="text-gray-300 mb-6">
            {t('home.cta.description')}
          </p>
          <Link
            to="/user"
            className="inline-block bg-purple-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-purple-600 transition-colors duration-200"
          >
            {t('home.cta.button')}
          </Link>
        </section>
      </div>
    </div>
  );
}