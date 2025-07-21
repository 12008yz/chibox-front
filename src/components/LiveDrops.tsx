import React, { useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { LiveDropData } from '../types/socket';
import LiveDropItem from './LiveDropItem';

const LiveDrops: React.FC = () => {
  const { liveDrops, isConnected } = useSocket();
  const [allDrops, setAllDrops] = useState<LiveDropData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем исторические данные при монтировании компонента
  useEffect(() => {
    const fetchInitialDrops = async () => {
      try {
        const response = await fetch('/api/v1/getLiveDrops?limit=20');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setAllDrops(data.data.drops);
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки живых падений:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialDrops();
  }, []);

  // Объединяем новые live drops с историческими данными
  useEffect(() => {
    if (liveDrops.length > 0) {
      setAllDrops(prevDrops => {
        // Создаем новый массив, исключая дубликаты
        const newDropIds = new Set(liveDrops.map(drop => drop.id));
        const filteredPrevDrops = prevDrops.filter(drop => !newDropIds.has(drop.id));

        // Объединяем и ограничиваем до 50 падений
        const combined = [...liveDrops, ...filteredPrevDrops].slice(0, 50);
        return combined;
      });
    }
  }, [liveDrops]);

  if (isLoading) {
    return (
      <div className="bg-[#19172D] rounded-lg p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Живые падения</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">Загрузка...</span>
          </div>
        </div>

        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-[#151225] rounded-lg p-3 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-600 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-600 rounded w-1/4"></div>
                </div>
                <div className="w-12 h-12 bg-gray-600 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-600 rounded w-20"></div>
                  <div className="h-3 bg-gray-600 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#19172D] rounded-lg p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Живые падения</h2>
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected
                ? 'bg-green-500 animate-pulse'
                : 'bg-red-500'
            }`}
          ></div>
          <span className="text-sm text-gray-400">
            {isConnected ? 'Онлайн' : 'Не подключено'}
          </span>
        </div>
      </div>

      {allDrops.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-gray-400">Пока нет падений</p>
          <p className="text-sm text-gray-500 mt-2">
            Первые падения появятся здесь в реальном времени
          </p>
        </div>
      ) : (
        <div
          className="space-y-3 max-h-96 overflow-y-auto"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#374151 #151225'
          }}
        >
          {allDrops.map((drop) => (
            <LiveDropItem key={drop.id} drop={drop} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveDrops;
