import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('chibox-language', languageCode);
    setIsOpen(false);
  };

  // Вычисление позиции dropdown
  const calculateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setDropdownPosition({
        top: rect.bottom + scrollTop + 8,
        right: window.innerWidth - rect.right
      });
    }
  };

  // Открытие/закрытие dropdown
  const toggleDropdown = () => {
    if (!isOpen) {
      calculateDropdownPosition();
    }
    setIsOpen(!isOpen);
  };

  // Закрытие dropdown при клике вне области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Перерасчет позиции при скролле или изменении размера окна
  useEffect(() => {
    if (isOpen) {
      const handleReposition = () => {
        calculateDropdownPosition();
      };

      window.addEventListener('scroll', handleReposition);
      window.addEventListener('resize', handleReposition);

      return () => {
        window.removeEventListener('scroll', handleReposition);
        window.removeEventListener('resize', handleReposition);
      };
    }
  }, [isOpen]);

  const dropdownPortal = isOpen && createPortal(
    <div
      ref={dropdownRef}
      className="fixed w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-[10000] max-h-64 overflow-y-auto backdrop-blur-sm"
      style={{
        top: `${dropdownPosition.top}px`,
        right: `${dropdownPosition.right}px`,
      }}
    >
      {languages.map((language, index) => (
        <button
          key={language.code}
          onClick={() => handleLanguageChange(language.code)}
          className={`w-full flex items-center gap-3 px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors duration-200 ${
            index === 0 ? 'rounded-t-lg' : ''
          } ${
            index === languages.length - 1 ? 'rounded-b-lg' : ''
          } ${
            currentLanguage.code === language.code ? 'bg-gray-700 text-cyan-400' : ''
          }`}
        >
          <span>{language.flag}</span>
          <span className="text-sm">{language.name}</span>
          {currentLanguage.code === language.code && (
            <span className="ml-auto text-cyan-400">✓</span>
          )}
        </button>
      ))}
    </div>,
    document.body
  );

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={toggleDropdown}
          className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
        >
          <span>{currentLanguage.flag}</span>
          <span className="hidden md:inline text-sm">{currentLanguage.name}</span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      {dropdownPortal}
    </>
  );
};

export default LanguageSwitcher;
