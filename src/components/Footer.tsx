import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useGetGlobalStatisticsQuery } from '../features/user/userApi';
import { Package, Users, RefreshCw, Swords, Clock } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();
  const { data: statsData, isLoading } = useGetGlobalStatisticsQuery(undefined, {
    pollingInterval: 300000, // Обновляем каждые 5 минут
  });

  // Отладка: выводим данные статистики в консоль
  console.log('Footer Statistics Data:', statsData);

  // Форматируем числа с разделителями
  const formatNumber = (num: number) => {
    return num.toLocaleString('ru-RU');
  };

  const stats = [
    {
      icon: <Package className="w-8 h-8 md:w-10 md:h-10 text-orange-400" />,
      label: t('footer.stats.cases_opened'),
      value: isLoading ? '...' : formatNumber(statsData?.data?.totalCasesOpened || 0)
    },
    {
      icon: <Users className="w-8 h-8 md:w-10 md:h-10 text-orange-400" />,
      label: t('footer.stats.users'),
      value: isLoading ? '...' : formatNumber(statsData?.data?.totalUsers || 0)
    },
    {
      icon: <RefreshCw className="w-8 h-8 md:w-10 md:h-10 text-orange-400" />,
      label: t('footer.stats.upgrades'),
      value: isLoading ? '...' : formatNumber(statsData?.data?.totalUpgrades || 0)
    },
    {
      icon: <Swords className="w-8 h-8 md:w-10 md:h-10 text-orange-400" />,
      label: t('footer.stats.games_played'),
      value: isLoading ? '...' : formatNumber(statsData?.data?.totalGamesPlayed || 0)
    },
  ];

  const links = {
    company: [
      { name: t('footer.links.about'), path: '/about' },
      { name: 'Каталог услуг', path: '/services' },
      { name: t('footer.links.contacts'), path: '/contacts' },
      { name: t('footer.links.faq'), path: '/faq' },
    ],
    legal: [
      { name: t('footer.links.terms'), path: '/terms' },
      { name: t('footer.links.privacy'), path: '/privacy' },
      { name: t('footer.links.responsible_gaming'), path: '/responsible-gaming' },
      { name: 'Реквизиты', path: '/requisites' },
    ],
  };

  const socialLinks = [
    {
      name: 'Telegram',
      url: 'https://t.me/chibox_official',
      icon: (
        <svg width="20" height="20" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-telegram">
          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z"/>
        </svg>
      )
    },
    {
      name: 'VK',
      url: 'https://vk.com/chibox_game',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="20" height="20" viewBox="-2.5 0 32 32" version="1.1">
          <path d="M16.563 15.75c-0.5-0.188-0.5-0.906-0.531-1.406-0.125-1.781 0.5-4.5-0.25-5.656-0.531-0.688-3.094-0.625-4.656-0.531-0.438 0.063-0.969 0.156-1.344 0.344s-0.75 0.5-0.75 0.781c0 0.406 0.938 0.344 1.281 0.875 0.375 0.563 0.375 1.781 0.375 2.781 0 1.156-0.188 2.688-0.656 2.75-0.719 0.031-1.125-0.688-1.5-1.219-0.75-1.031-1.5-2.313-2.063-3.563-0.281-0.656-0.438-1.375-0.844-1.656-0.625-0.438-1.75-0.469-2.844-0.438-1 0.031-2.438-0.094-2.719 0.5-0.219 0.656 0.25 1.281 0.5 1.813 1.281 2.781 2.656 5.219 4.344 7.531 1.563 2.156 3.031 3.875 5.906 4.781 0.813 0.25 4.375 0.969 5.094 0 0.25-0.375 0.188-1.219 0.313-1.844s0.281-1.25 0.875-1.281c0.5-0.031 0.781 0.406 1.094 0.719 0.344 0.344 0.625 0.625 0.875 0.938 0.594 0.594 1.219 1.406 1.969 1.719 1.031 0.438 2.625 0.313 4.125 0.25 1.219-0.031 2.094-0.281 2.188-1 0.063-0.563-0.563-1.375-0.938-1.844-0.938-1.156-1.375-1.5-2.438-2.563-0.469-0.469-1.063-0.969-1.063-1.531-0.031-0.344 0.25-0.656 0.5-1 1.094-1.625 2.188-2.781 3.188-4.469 0.281-0.5 0.938-1.656 0.688-2.219-0.281-0.625-1.844-0.438-2.813-0.438-1.25 0-2.875-0.094-3.188 0.156-0.594 0.406-0.844 1.063-1.125 1.688-0.625 1.438-1.469 2.906-2.344 4-0.313 0.375-0.906 1.156-1.25 1.031z"/>
        </svg>
      )
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white mt-20">
      {/* Stats Section */}
      <div className="container mx-auto px-4 py-12 border-b border-gray-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl bg-gray-800/80 border border-gray-700/50 hover:border-orange-500/50 transition-colors duration-300"
            >
              <div className="flex justify-center mb-2">{stat.icon}</div>
              <div className="text-2xl md:text-3xl font-bold text-orange-400 mb-1">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="/images/logo.png"
                alt="ChiBox Logo"
                className="w-16 h-16 md:w-20 md:h-20 object-contain"
              />
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-orange-400">
                  ChiBox
                </h3>
                <p className="text-xs md:text-sm text-gray-400">
                  {t('footer.tagline')}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              {t('footer.description')}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-orange-500 flex items-center justify-center transition-colors duration-300 text-white"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-orange-400">
              {t('footer.sections.company')}
            </h4>
            <ul className="space-y-3">
              {links.company.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-orange-400 transition-colors duration-300 text-sm md:text-base"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-orange-400">
              {t('footer.sections.legal')}
            </h4>
            <ul className="space-y-3">
              {links.legal.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-orange-400 transition-colors duration-300 text-sm md:text-base"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-orange-400">
              {t('footer.sections.support')}
            </h4>
            <div className="space-y-4">
              <p className="text-sm text-gray-400 mb-4">
                Свяжитесь с нами
              </p>

              {/* Email Contacts */}
              <div className="space-y-2 mb-4">
                <a
                  href="mailto:support@chibox-game.ru"
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-orange-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className="text-xs">support@chibox-game.ru</span>
                </a>
                <a
                  href="mailto:help@chibox-game.ru"
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-orange-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className="text-xs">help@chibox-game.ru</span>
                </a>
              </div>

              <a
                href="https://t.me/chibox_official"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-orange-500/20 hover:border-orange-500/50 border border-transparent transition-all"
              >
                <div className="text-white">
                  <svg width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-telegram">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Telegram</div>
                  <div className="text-xs text-gray-400">@chibox_official</div>
                </div>
              </a>

              <a
                href="https://vk.com/chibox_game"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-orange-500/20 hover:border-orange-500/50 border border-transparent transition-all"
              >
                <div className="text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="24" height="24" viewBox="-2.5 0 32 32" version="1.1">
                    <path d="M16.563 15.75c-0.5-0.188-0.5-0.906-0.531-1.406-0.125-1.781 0.5-4.5-0.25-5.656-0.531-0.688-3.094-0.625-4.656-0.531-0.438 0.063-0.969 0.156-1.344 0.344s-0.75 0.5-0.75 0.781c0 0.406 0.938 0.344 1.281 0.875 0.375 0.563 0.375 1.781 0.375 2.781 0 1.156-0.188 2.688-0.656 2.75-0.719 0.031-1.125-0.688-1.5-1.219-0.75-1.031-1.5-2.313-2.063-3.563-0.281-0.656-0.438-1.375-0.844-1.656-0.625-0.438-1.75-0.469-2.844-0.438-1 0.031-2.438-0.094-2.719 0.5-0.219 0.656 0.25 1.281 0.5 1.813 1.281 2.781 2.656 5.219 4.344 7.531 1.563 2.156 3.031 3.875 5.906 4.781 0.813 0.25 4.375 0.969 5.094 0 0.25-0.375 0.188-1.219 0.313-1.844s0.281-1.25 0.875-1.281c0.5-0.031 0.781 0.406 1.094 0.719 0.344 0.344 0.625 0.625 0.875 0.938 0.594 0.594 1.219 1.406 1.969 1.719 1.031 0.438 2.625 0.313 4.125 0.25 1.219-0.031 2.094-0.281 2.188-1 0.063-0.563-0.563-1.375-0.938-1.844-0.938-1.156-1.375-1.5-2.438-2.563-0.469-0.469-1.063-0.969-1.063-1.531-0.031-0.344 0.25-0.656 0.5-1 1.094-1.625 2.188-2.781 3.188-4.469 0.281-0.5 0.938-1.656 0.688-2.219-0.281-0.625-1.844-0.438-2.813-0.438-1.25 0-2.875-0.094-3.188 0.156-0.594 0.406-0.844 1.063-1.125 1.688-0.625 1.438-1.469 2.906-2.344 4-0.313 0.375-0.906 1.156-1.25 1.031z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-sm text-white">VK</div>
                  <div className="text-xs text-gray-400">chibox_game</div>
                </div>
              </a>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="w-5 h-5 text-orange-400" />
                  <div className="text-xs">
                    <div className="font-bold text-white">24/7</div>
                    <div>Поддержка онлайн</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chi Coin Image Section */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <img
              src="/images/chiCoinFull.png"
              alt="ChiCoin"
              className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-contain animate-spin-slow"
            />
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-orange-400">
                {t('footer.chi_coin_title')}
              </h3>
              <p className="text-gray-400 text-sm md:text-base max-w-md">
                {t('footer.chi_coin_description')}
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* Bottom Bar */}
      <div className="bg-black/50 border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-400">
                © 2024-2025 ChiBox. {t('footer.rights_reserved')}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Самозанятый Чикасов Денис Владимирович, ИНН 711204279301, г. Богородицк
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
              <span>{t('footer.age_restriction')}</span>
            </div>
          </div>
        </div>
      </div>


    </footer>
  );
};

export default Footer;
