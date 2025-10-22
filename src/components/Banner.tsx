import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface BannerLeftContent {
  image?: string;
  video?: string;
  title: string;
  description: string;
  link: string;
}

interface BannerProps {
  left: BannerLeftContent;
  right: React.ReactNode;
}

const Banner: React.FC<BannerProps> = ({ left, right }) => {
  const { t } = useTranslation();

  return (
    <div className="relative w-screen max-w-[1920px] h-[460px] hidden md:flex overflow-hidden">
      {/* Фоновое изображение или видео */}
      {left.video ? (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={left.video} type="video/mp4" />
        </video>
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${left.image})` }}
        />
      )}

      {/* Затемнение по бокам (градиент) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />

      {/* Контент */}
      <div className="relative flex items-center justify-center w-full z-10">
        <div className="flex max-w-7xl w-full items-center justify-between">
          {left.title !== 'hide' ? (
            <div className="w-72 h-56 notched bg-[#CF3464] flex items-center justify-center">
              <div className="w-[calc(100%-4px)] h-[calc(100%-4px)] notched bg-[#111112] hover:bg-opacity-95 transition-all flex flex-col items-start justify-center px-6">
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-white text-start">
                    {left?.title}
                  </span>
                  <span className="text-base text-[#dfddef] text-left">
                    {left?.description}
                  </span>
                  <Link to={left?.link}>
                    <div className="flex items-center gap-2 mt-2 text-[#70699b] hover:text-[#CF3464] transition-all">
                      {t('banner.go_to_page')}
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
          <div className="flex justify-start w-full">
            {right}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
