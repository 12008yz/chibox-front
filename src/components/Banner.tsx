import React from 'react';
import { Link } from 'react-router-dom';

interface BannerProps {
  left: {
    image: string;
    title: string;
    description: string;
    link: string;
  };
  right: React.ReactNode;
}

const Banner: React.FC<BannerProps> = ({ left, right }) => {
  return (
    <div
      className="w-screen max-w-[1920px] h-[460px] bg-no-repeat hidden md:flex bg-cover"
      style={{ backgroundImage: `url(${left.image})` }}
    >
      <div className="flex items-center justify-center w-full">
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
                      Перейти на страницу →
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
