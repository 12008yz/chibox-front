import React from "react";
import { Link } from "react-router-dom";
import Title from "./Title";

interface GameListingProps {
  name: string;
  description?: string;
}

const GamesListing: React.FC<GameListingProps> = ({
  name,
  description,
}) => {
  const games = [
    {
      id: "1",
      title: "Crash",
      description: "Следи за графиком и забирай выигрыш вовремя!",
      link: "/crash",
      gradient: "from-red-500 to-orange-500",
      icon: "🚀"
    },
    {
      id: "2",
      title: "leaderboard",
      description: "Орел или решка - проверь свою удачу!",
      link: "/leaderboard",
      gradient: "from-blue-500 to-cyan-500",
      icon: "🪙"
    },
    {
      id: "3",
      title: "Upgrade",
      description: "Улучшай свои предметы с шансом на успех!",
      link: "/upgrade",
      gradient: "from-purple-500 to-pink-500",
      icon: "⬆️"
    },
    {
      id: "4",
      title: "Slot",
      description: "Классические слоты с большими выигрышами!",
      link: "/slots",
      gradient: "from-green-500 to-emerald-500",
      icon: "🎰"
    },
  ];

  return (
    <div className="w-full flex flex-col gap-4 py-10 items-center">
      <div className="flex flex-col items-center justify-center max-w-[1600px]">
        <Title title={name} />
        {description && (
          <div className="text-gray-300 mb-8 text-center">{description}</div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-center w-full gap-8 md:flex-wrap">
          {games.map((game) => (
            <Link
              to={game.link}
              key={game.id}
              className="group transition-transform hover:scale-105"
            >
              <div className="flex flex-col items-center p-6 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 transition-all duration-300">
                {/* Игровое превью */}
                <div
                  className={`w-64 h-48 rounded-lg bg-gradient-to-br ${game.gradient} flex items-center justify-center mb-4 relative overflow-hidden`}
                >
                  <div className="text-6xl opacity-20 group-hover:opacity-30 transition-opacity">
                    {game.icon}
                  </div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                  {/* Play кнопка */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Информация об игре */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {game.title}
                  </h3>
                  <p className="text-sm text-gray-400 max-w-[240px]">
                    {game.description}
                  </p>

                  <div className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                    Играть
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GamesListing;
