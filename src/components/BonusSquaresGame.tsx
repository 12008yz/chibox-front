import { useState, useEffect } from 'react';
import { useGetBonusStatusQuery, usePlayBonusSquaresMutation } from '../features/user/userApi';
import Modal from './Modal';

interface BonusSquaresGameProps {
  isOpen: boolean;
  onClose: () => void;
}

const BonusSquaresGame: React.FC<BonusSquaresGameProps> = ({ isOpen, onClose }) => {
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [revealedSquares, setRevealedSquares] = useState<boolean[]>(new Array(9).fill(false));
  const [gameResult, setGameResult] = useState<string>('');

  const { data: bonusStatus, refetch: refetchBonusStatus } = useGetBonusStatusQuery();
  const [playBonusSquares, { isLoading: isPlaying }] = usePlayBonusSquaresMutation();

  // Сброс состояния при открытии модалки
  useEffect(() => {
    if (isOpen) {
      setSelectedSquare(null);
      setGameStarted(false);
      setGameEnded(false);
      setRevealedSquares(new Array(9).fill(false));
      setGameResult('');
      refetchBonusStatus();
    }
  }, [isOpen, refetchBonusStatus]);

  const handleSquareClick = (index: number) => {
    if (gameEnded || isPlaying || revealedSquares[index]) return;

    setSelectedSquare(index);
    setGameStarted(true);
  };

  const handlePlayGame = async () => {
    if (selectedSquare === null) return;

    try {
      const result = await playBonusSquares({
        chosenCell: selectedSquare
      }).unwrap();

      // Показываем результат
      setGameResult(result.message || 'Игра завершена!');

      // Открываем выбранную клетку
      const newRevealedSquares = [...revealedSquares];
      newRevealedSquares[selectedSquare] = true;
      setRevealedSquares(newRevealedSquares);

      setGameEnded(true);

      // Обновляем статус бонуса
      refetchBonusStatus();

      // Автоматически закрываем через 3 секунды
      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Ошибка при игре в бонусные квадраты:', error);
      setGameResult('Произошла ошибка при игре. Попробуйте позже.');
      setGameEnded(true);
    }
  };

  const isAvailable = bonusStatus?.data?.is_available;
  const timeUntilNext = bonusStatus?.data?.time_until_next_seconds;

  const formatTimeLeft = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Бонусная игра">
      <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full mx-4">
        {/* Заголовок */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🎁</div>
          <h2 className="text-xl font-bold text-white mb-2">Бонусная игра</h2>
          <p className="text-gray-400 text-sm">
            Выберите один из 9 квадратов и получите награду!
          </p>
        </div>

        {!isAvailable ? (
          // Бонус недоступен
          <div className="text-center">
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
              <div className="text-red-400 mb-2">⏰ Бонус пока недоступен</div>
              {timeUntilNext && (
                <div className="text-gray-300 text-sm">
                  Следующий бонус через: {formatTimeLeft(timeUntilNext)}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Закрыть
            </button>
          </div>
        ) : (
          // Игра доступна
          <>
            {/* Сетка квадратов */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {Array.from({ length: 9 }, (_, index) => (
                <button
                  key={index}
                  onClick={() => handleSquareClick(index)}
                  disabled={gameEnded || isPlaying}
                  className={`
                    aspect-square flex items-center justify-center rounded-lg border-2 transition-all duration-200
                    ${selectedSquare === index
                      ? 'border-yellow-500 bg-yellow-500/20'
                      : 'border-gray-600 bg-gray-800 hover:border-gray-500 hover:bg-gray-700'
                    }
                    ${gameEnded || isPlaying ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                    ${revealedSquares[index] ? 'border-green-500 bg-green-500/20' : ''}
                  `}
                >
                  {revealedSquares[index] ? (
                    <span className="text-2xl">🎁</span>
                  ) : (
                    <span className="text-2xl text-gray-500">?</span>
                  )}
                </button>
              ))}
            </div>

            {/* Инструкции или результат */}
            <div className="text-center mb-4">
              {!gameStarted && (
                <p className="text-gray-400 text-sm">
                  Кликните на любой квадрат, чтобы начать игру
                </p>
              )}

              {gameStarted && !gameEnded && selectedSquare !== null && (
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-blue-400 text-sm mb-2">
                    Выбран квадрат #{selectedSquare + 1}
                  </p>
                  <p className="text-gray-300 text-xs">
                    Нажмите "Играть", чтобы узнать свою награду!
                  </p>
                </div>
              )}

              {gameResult && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                  <p className="text-green-400 text-sm">{gameResult}</p>
                </div>
              )}
            </div>

            {/* Кнопки */}
            <div className="flex gap-3">
              {gameStarted && !gameEnded && (
                <button
                  onClick={handlePlayGame}
                  disabled={isPlaying || selectedSquare === null}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg font-medium hover:from-yellow-500 hover:to-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPlaying ? 'Играем...' : 'Играть!'}
                </button>
              )}

              <button
                onClick={onClose}
                className="flex-1 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                {gameEnded ? 'Готово' : 'Отмена'}
              </button>
            </div>

            {/* Информация о бонусах */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="text-xs text-gray-400 text-center space-y-1">
                <p>🎁 Возможные награды:</p>
                <p>• Бонусный кейс (с подпиской)</p>
                <p>• Случайный предмет (без подписки)</p>
                <p>• 3 дня подписки</p>
                <p>• Опыт за участие</p>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default BonusSquaresGame;
