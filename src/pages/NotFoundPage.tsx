import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ScrollToTopOnMount from '../components/ScrollToTopOnMount';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[60vh] text-white flex flex-col items-center justify-center px-4 py-16">
      <ScrollToTopOnMount />
      <p className="text-6xl sm:text-7xl font-bold text-orange-400/90 mb-2">404</p>
      <h1 className="text-xl sm:text-2xl font-semibold text-center mb-2">
        {t('not_found.title', { defaultValue: 'Страница не найдена' })}
      </h1>
      <p className="text-gray-400 text-center text-sm sm:text-base max-w-md mb-8">
        {t('not_found.description', {
          defaultValue: 'Проверьте адрес или вернитесь на главную.',
        })}
      </p>
      <Link
        to="/"
        className="px-6 py-3 rounded-lg bg-orange-500 hover:bg-orange-400 text-white font-medium transition-colors"
      >
        {t('not_found.home', { defaultValue: 'На главную' })}
      </Link>
    </div>
  );
};

export default NotFoundPage;
