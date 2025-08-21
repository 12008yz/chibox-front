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
        const response = await fetch('/api/v1/live-drops?limit=12'); // Уменьшили лимит для горизонтального отображения
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
        // Создаем Map для более эффективной дедупликации
        const existingDropIds = new Set(prevDrops.map(drop => drop.id));

        // Фильтруем только действительно новые падения
        const newDrops = liveDrops.filter(drop => {
          if (!drop.id) {
            console.warn('LiveDrop без ID, игнорируем:', drop);
            return false;
          }

          // Дополнительная проверка - если дроп очень старый (более 5 минут), игнорируем
          const dropTime = new Date(drop.dropTime).getTime();
          const now = Date.now();
          if (now - dropTime > 5 * 60 * 1000) {
            console.log('LiveDrop слишком старый, игнорируем:', drop.id);
            return false;
          }

          return !existingDropIds.has(drop.id);
        });

        // Если нет новых падений, возвращаем предыдущее состояние
        if (newDrops.length === 0) {
          return prevDrops;
        }

        // Объединяем только новые падения с существующими и ограничиваем до 12 для горизонтального просмотра
        const combined = [...newDrops, ...prevDrops].slice(0, 12);

        console.log(`LiveDrops: Добавлено ${newDrops.length} новых падений, всего: ${combined.length}`);
        return combined;
      });
    }
  }, [liveDrops]);

  if (isLoading) {
    return (
      <div className="w-full bg-[#19172D] py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Живые падения</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-400">Загрузка...</span>
            </div>
          </div>
        </div>

        {/* Горизонтальная загрузка */}
        <div className="flex gap-6 overflow-hidden px-6 py-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex-shrink-0 bg-[#151225] rounded-lg p-4 animate-pulse" style={{ width: '160px', height: '176px', margin: '4px' }}>
              <div className="w-8 h-8 bg-gray-600 rounded-full mx-auto mb-3"></div>
              <div className="w-20 h-20 bg-gray-600 rounded-lg mx-auto mb-2"></div>
              <div className="h-3 bg-gray-600 rounded w-full mb-1"></div>
              <div className="h-2 bg-gray-600 rounded w-3/4 mx-auto"></div>
            </div>
          ))}
          {/* Отступ в конце */}
          <div className="flex-shrink-0 w-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#19172D] py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
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
      </div>

      {allDrops.length === 0 ? (
        <div className="text-center py-12">
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
        <div className="relative overflow-hidden py-2">
          {/* Градиентные края для эффекта затухания */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#19172D] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#19172D] to-transparent z-10 pointer-events-none"></div>

          {/* Горизонтальный скролл контейнер */}
          <div
            className="flex gap-6 overflow-x-auto pb-4 scroll-smooth live-drops-scroll px-6 live-drop-container"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#374151 transparent',
              isolation: 'isolate',
              zIndex: 100,
              position: 'relative'
            }}
          >
            {allDrops.map((drop, index) => (
              <div
                key={drop.id}
                className="flex-shrink-0 animate-slideInLeft"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'backwards'
                }}
              >
                <LiveDropItem drop={drop} />
              </div>
            ))}
            {/* Добавляем отступ в конце для правильного отображения последнего элемента */}
            <div className="flex-shrink-0 w-4"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveDrops;