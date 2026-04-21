import React from 'react';

const RussianFlag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" className="w-6 h-4">
    <g fillRule="evenodd" strokeWidth="1pt">
      <path fill="#fff" d="M0 0h640v480H0z"/>
      <path fill="#0039a6" d="M0 160h640v320H0z"/>
      <path fill="#d52b1e" d="M0 320h640v160H0z"/>
    </g>
  </svg>
);

const LanguageSwitcher: React.FC = () => {
  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center gap-2 px-2 lg:px-3 py-2 bg-gray-800 text-white rounded-lg cursor-default"
        aria-label="Текущий язык: Русский"
      >
        <div className="flex items-center"><RussianFlag /></div>
        <span className="text-sm">RU</span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;
