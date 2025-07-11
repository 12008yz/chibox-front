import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#151225] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            ChiBox Casino
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Добро пожаловать в лучшее онлайн казино!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-[#19172D] rounded-lg p-6 border border-gray-700/50">
              <h3 className="text-2xl font-bold mb-4">Кейсы</h3>
              <p className="text-gray-400">Открывайте кейсы и получайте ценные призы</p>
            </div>

            <div className="bg-[#19172D] rounded-lg p-6 border border-gray-700/50">
              <h3 className="text-2xl font-bold mb-4">Игры</h3>
              <p className="text-gray-400">Играйте в Crash, Coin Flip и другие игры</p>
            </div>

            <div className="bg-[#19172D] rounded-lg p-6 border border-gray-700/50">
              <h3 className="text-2xl font-bold mb-4">Маркет</h3>
              <p className="text-gray-400">Покупайте и продавайте предметы</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
