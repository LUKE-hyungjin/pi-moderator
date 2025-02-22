import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Pi Moderator - Home" },
    { name: "description", content: "파이코인 커뮤니티의 중심, Pi Moderator에서 모든 정보를 확인하세요!" },
  ];
};

export default function Index() {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* 히어로 섹션 */}
        <section className="text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
            파이코인의 모든 것, Pi Moderator
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            안전하고 신뢰할 수 있는 파이코인 정보와 서비스를 제공합니다
          </p>
        </section>

        {/* 미션 섹션 */}
        <section className="bg-[rgba(255,255,255,0.05)] rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-6 text-center">우리의 미션</h2>
          <p className="text-gray-300 mb-6 text-center">
            Pi Moderator는 파이코인 커뮤니티의 성장과 발전을 위해 시작되었습니다.
            우리는 투명하고 신뢰할 수 있는 정보 제공을 통해 파이코인 생태계의 건전한 발전을 도모합니다.
          </p>
        </section>

        {/* 서비스 섹션 */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-[rgba(255,255,255,0.05)] rounded-xl p-6">
            <h3 className="text-2xl font-bold mb-4 text-blue-400">교육 서비스</h3>
            <p className="text-gray-300 mb-4">
              파이코인 초보자를 위한 상세한 가이드부터
              고급 사용자를 위한 심화 정보까지 제공합니다.
            </p>
            <Link to="/map?type=education" className="text-blue-400 hover:text-blue-300">
              교육 찾기 →
            </Link>
          </div>

          <div className="bg-[rgba(255,255,255,0.05)] rounded-xl p-6">
            <h3 className="text-2xl font-bold mb-4 text-red-400">중개 서비스</h3>
            <p className="text-gray-300 mb-4">
              안전하고 신뢰할 수 있는 파이코인 거래 중개 서비스를
              제공합니다.
            </p>
            <Link to="/map?type=relay" className="text-red-400 hover:text-red-300">
              거래소 찾기 →
            </Link>
          </div>

          <div className="bg-[rgba(255,255,255,0.05)] rounded-xl p-6">
            <h3 className="text-2xl font-bold mb-4 text-green-400">세무 서비스</h3>
            <p className="text-gray-300 mb-4">
              파이코인 거래와 관련된 세무 상담 및
              신고 서비스를 제공합니다.
            </p>
            <Link to="/map?type=tax" className="text-green-400 hover:text-green-300">
              세무사 찾기 →
            </Link>
          </div>

          <div className="bg-[rgba(255,255,255,0.05)] rounded-xl p-6">
            <h3 className="text-2xl font-bold mb-4 text-yellow-400">최신 정보</h3>
            <p className="text-gray-300 mb-4">
              파이코인 메인넷, KYC, 마이닝 등
              최신 소식을 빠르게 전달합니다.
            </p>
            <Link to="/pi" className="text-pink-400 hover:text-yellow-300">
              소식 보기 →
            </Link>
          </div>
        </section>

        {/* CTA 섹션 */}
        <section className="text-center bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-4">파이코인의 미래를 함께 만들어가요</h2>
          <p className="text-gray-300 mb-6">
            Pi Moderator와 함께라면 파이코인의 가치는 더욱 빛날 수 있습니다.
          </p>
          <Link
            to="/user"
            className="inline-block bg-purple-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-purple-600 transition-colors duration-200"
          >
            시작하기
          </Link>
        </section>
      </div>
    </div>
  );
}