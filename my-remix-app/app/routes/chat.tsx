import type { MetaFunction } from '@remix-run/node';
import { ClientOnly } from 'remix-utils/client-only';
import { useTranslation } from '~/hooks/useTranslation';
import { useLanguage } from '~/contexts/LanguageContext';
import { translateToString } from '~/i18n/translations';

export const meta: MetaFunction = () => {
  return [
    { title: "Pi-Moderator 채팅" },
    { name: "description", content: "Pi-Moderator 실시간 채팅" },
  ];
};

export default function ChatRoute() {
  const { language } = useLanguage();
  const { t } = useTranslation(language);

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6 text-white">실시간 채팅</h1>
      
      <ClientOnly fallback={<div className="text-white">채팅 로딩 중...</div>}>
        {() => {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const Chat = require('~/components/Chat').default;
          return <Chat />;
        }}
      </ClientOnly>
      
      <div className="mt-8 p-4 bg-[#1a1a1a] rounded-lg text-gray-300 text-sm">
        <h3 className="font-bold text-white mb-2">채팅 이용 안내</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>최대 접속자 수는 300명입니다.</li>
          <li>실시간 채팅은 임시 사용자명을 생성하여 참여할 수 있습니다.</li>
          <li>장시간 활동이 없을 경우 자동으로 접속이 종료됩니다.</li>
          <li>부적절한 언어 사용 시 관리자에 의해 이용이 제한될 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
}