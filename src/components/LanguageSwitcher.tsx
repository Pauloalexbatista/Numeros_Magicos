'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000`;
    router.refresh();
  };

  return (
    <select
      value={locale}
      onChange={changeLanguage}
      className="bg-transparent text-xs font-medium border border-border rounded-md px-1.5 py-1 focus:outline-none transition-colors"
      style={{ color: 'var(--text-tertiary)' }}
    >
      <option value="pt" className="bg-surface-0">PT</option>
      <option value="en" className="bg-surface-0">EN</option>
      <option value="es" className="bg-surface-0">ES</option>
      <option value="fr" className="bg-surface-0">FR</option>
    </select>
  );
}
