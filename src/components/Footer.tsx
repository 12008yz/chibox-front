import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t } = useTranslation();

  const stats = [
    { icon: '📦', label: t('footer.stats.cases_opened'), value: '1,234,567' },
    { icon: '👥', label: t('footer.stats.users'), value: '89,234' },
    { icon: '🔄', label: t('footer.stats.upgrades'), value: '456,789' },
    { icon: '⚔️', label: t('footer.stats.games_played'), value: '2,345,678' },
  ];

  const links = {
    company: [
      { name: t('footer.links.about'), path: '/about' },
      { name: t('footer.links.contacts'), path: '/contacts' },
      { name: t('footer.links.faq'), path: '/faq' },
    ],
    legal: [
      { name: t('footer.links.terms'), path: '/terms' },
      { name: t('footer.links.privacy'), path: '/privacy' },
      { name: t('footer.links.responsible_gaming'), path: '/responsible-gaming' },
    ],
  };

  const socialLinks = [
    { icon: '📱', name: 'Telegram', url: '#' },
    { icon: '🐦', name: 'Twitter', url: '#' },
    { icon: '📺', name: 'YouTube', url: '#' },
    { icon: '💬', name: 'Discord', url: '#' },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white mt-20">
      {/* Stats Section */}
      <div className="container mx-auto px-4 py-12 border-b border-gray-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 hover:border-orange-500/50 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="text-3xl md:text-4xl mb-2">{stat.icon}</div>
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
                src="/images/chiCoin.png"
                alt="ChiCoin"
                className="w-16 h-16 md:w-20 md:h-20 animate-pulse"
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
                  className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-orange-500 flex items-center justify-center transition-all duration-300 hover:transform hover:scale-110"
                  aria-label={social.name}
                >
                  <span className="text-xl">{social.icon}</span>
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
              <div>
                <p className="text-sm text-gray-400 mb-2">
                  {t('footer.email_label')}
                </p>
                <a
                  href="mailto:support@chibox.com"
                  className="text-orange-400 hover:text-orange-300 transition-colors duration-300 text-sm md:text-base"
                >
                  support@chibox.com
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">
                  {t('footer.working_hours')}
                </p>
                <p className="text-sm text-white">24/7</p>
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
              src="/images/chiCoin.png"
              alt="ChiCoin"
              className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 animate-spin-slow drop-shadow-2xl"
            />
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
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
            <p className="text-sm text-gray-400 text-center md:text-left">
              © 2024-2025 ChiBox. {t('footer.rights_reserved')}
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
              <span>{t('footer.age_restriction')}</span>
              <span>•</span>
              <span>{t('footer.licensed')}</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
