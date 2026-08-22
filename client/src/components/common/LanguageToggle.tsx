import { useTranslation } from 'react-i18next';
import { GlobeIcon } from './icons';

const LanguageToggle = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage === 'rw' ? 'rw' : 'en';
  const nextLang = lang === 'en' ? 'rw' : 'en';
  const switchToLabel = nextLang === 'rw' ? t('languageToggle.kinyarwanda') : t('languageToggle.english');

  return (
    <button
      type="button"
      className="language-toggle"
      onClick={() => i18n.changeLanguage(nextLang)}
      title={switchToLabel}
      aria-label={switchToLabel}
    >
      <GlobeIcon />
      <span className="language-toggle-code">{lang.toUpperCase()}</span>
    </button>
  );
};

export default LanguageToggle;
