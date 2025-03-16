import { useTranslations } from 'next-intl';
import { Link as I18bLink } from '@/i18n/routing';
import { Button } from "@/components/ui/button"

export default function Home() {
  const t = useTranslations();

  return (
    <main>
      <h1>{t('Home.title')}</h1>
      <p>{t('Home.description')}</p>
      <I18bLink href="/about">About Page</I18bLink>;
      <div>
        <Button>Click me</Button>
      </div>
    </main>
  );
}