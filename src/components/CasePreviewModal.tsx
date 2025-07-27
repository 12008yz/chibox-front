import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCaseItemsQuery } from '../features/cases/casesApi';
import { CaseTemplate } from '../types/api';
import Monetary from './Monetary';

interface CasePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: CaseTemplate;
}

const CasePreviewModal: React.FC<CasePreviewModalProps> = ({
  isOpen,
  onClose,
  caseData
}) => {
  const navigate = useNavigate();
  const { data: itemsData, isLoading, error } = useGetCaseItemsQuery(
    caseData.id,
    { skip: !isOpen }
  );

  const handleOpenCase = () => {
    onClose();
    navigate(`/case/${caseData.id}`);
  };

  // Дефолтные изображения кейсов CS2
  const defaultCaseImages = [
    'https://bitskins.com/blog/content/images/2023/12/what_cs2_cases_have_knives--2-.jpg',
    'https://bitskins.com/blog/content/images/2024/04/cheapest-cs2-cases.jpg',
    'https://cs2pulse.com/wp-content/uploads/2023/11/CS2-Case-Opening-Guide-6.png',
    'https://skinsmonkey.com/blog/wp-content/uploads/sites/2/htgcs2c.jpg',
    'https://files.bo3.gg/uploads/image/28483/image/webp-3fbd14fff1cf0a506fba0427d5ab423c.webp',
    'https://egamersworld.com/cdn-cgi/image/width=690,quality=75,format=webp/uploads/blog/z/zh/zhnsdbzy0n_1743504605002.webp'
  ];

  // Выбираем случайное изображение кейса на основе названия для стабильности
  const defaultCaseImage = useMemo(() => {
    const hash = caseData.name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return defaultCaseImages[Math.abs(hash) % defaultCaseImages.length];
  }, [caseData.name]);

  if (!isOpen) return null;

  const items = itemsData?.data || [];

  // Определяем изображение кейса
  const caseImageUrl = caseData.image_url && caseData.image_url.trim() !== ''
    ? caseData.image_url
    : defaultCaseImage;

  // Функция для определения цвета редкости
  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'mil-spec':
      case 'consumer':
        return 'text-blue-400 border-blue-400';
      case 'restricted':
        return 'text-purple-400 border-purple-400';
      case 'classified':
        return 'text-pink-400 border-pink-400';
      case 'covert':
        return 'text-red-400 border-red-400';
      case 'special':
      case 'extraordinary':
        return 'text-yellow-400 border-yellow-400';
      default:
        return 'text-gray-400 border-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-[#1a1629] rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Заголовок модального окна */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <img
              src={caseImageUrl}
              alt={caseData.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div>
              <h2 className="text-2xl font-bold text-white">{caseData.name}</h2>
              <p className="text-green-400 font-semibold">
                {parseFloat(caseData.price) === 0 || isNaN(parseFloat(caseData.price)) ? (
                  <span>Бесплатный кейс</span>
                ) : (
                  <Monetary value={parseFloat(caseData.price)} />
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Содержимое кейса */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="spinner" />
              <p className="text-white ml-4">Загрузка предметов...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400">Ошибка загрузки предметов</p>
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {items.map((item: any, index: number) => (
                <div
                  key={item.id || index}
                  className={`bg-gray-800 rounded-lg p-4 border-2 ${getRarityColor(item.rarity)} hover:scale-105 transition-transform`}
                >
                  <div className="aspect-square mb-3 bg-gray-700 rounded flex items-center justify-center overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-500 text-xs text-center">
                        Нет изображения
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <h3 className="text-white font-semibold text-sm mb-1 overflow-hidden"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: '1.2em',
                          maxHeight: '2.4em'
                        }}>
                      {item.name}
                    </h3>

                    {item.rarity && (
                      <p className={`text-xs mb-2 ${getRarityColor(item.rarity).split(' ')[0]}`}>
                        {item.rarity}
                      </p>
                    )}

                    <p className="text-green-400 font-bold text-sm">
                      <Monetary value={parseFloat(item.price || '0')} />
                    </p>

                    {item.drop_weight && (
                      <p className="text-gray-400 text-xs mt-1">
                        Шанс: {item.drop_weight}%
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">Предметы не найдены</p>
            </div>
          )}
        </div>

        {/* Футер с кнопками */}
        <div className="p-6 border-t border-gray-700 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Закрыть
          </button>
          <button
            onClick={handleOpenCase}
            className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Открыть кейс
          </button>
        </div>
      </div>
    </div>
  );
};

export default CasePreviewModal;
