import { useState, useEffect } from 'react';
import { useGetBonusStatusQuery, usePlayBonusSquaresMutation } from '../features/user/userApi';
import Modal from './Modal';

interface BonusSquaresGameProps {
  isOpen: boolean;
  onClose: () => void;
}

const BonusSquaresGame: React.FC<BonusSquaresGameProps> = ({ isOpen, onClose }) => {
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'selected' | 'playing' | 'finished'>('idle');
  const [revealedSquares, setRevealedSquares] = useState<boolean[]>(new Array(9).fill(false));
  const [gameResult, setGameResult] = useState<string>('');
  const [allPrizes, setAllPrizes] = useState<(string | null)[]>([]);
  const [wonPrize, setWonPrize] = useState<string | null>(null);
  const [showParticles, setShowParticles] = useState(false);

  const { data: bonusStatus, refetch: refetchBonusStatus } = useGetBonusStatusQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [playBonusSquares, { isLoading: isPlaying }] = usePlayBonusSquaresMutation();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedSquare(null);
      setGameState('idle');
      setRevealedSquares(new Array(9).fill(false));
      setGameResult('');
      setAllPrizes([]);
      setWonPrize(null);
      setShowParticles(false);
      refetchBonusStatus();
    }
  }, [isOpen, refetchBonusStatus]);

  const handleSquareClick = (index: number) => {
    if (gameState === 'playing' || gameState === 'finished' || isPlaying) return;

    setSelectedSquare(index);
    setGameState('selected');
  };

  const handlePlayGame = async () => {
    if (selectedSquare === null || gameState !== 'selected') return;

    setGameState('playing');

    try {
      const result = await playBonusSquares({
        chosenCell: selectedSquare
      }).unwrap();

      setGameResult(result.message || 'Игра завершена!');
      setAllPrizes(result.all_prizes || []);
      setWonPrize(result.won_prize || null);
      setRevealedSquares(new Array(9).fill(true));
      setGameState('finished');

      // Show particles for wins
      if (result.won_prize) {
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 2000);
      }

      refetchBonusStatus();
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Произошла ошибка';
      setGameResult(`Ошибка: ${errorMessage}`);
      setGameState('finished');
    }
  };

  const isAvailable = bonusStatus?.is_available;
  const timeUntilNext = bonusStatus?.time_until_next_seconds;

  const formatTimeLeft = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSquareContent = (index: number) => {
    if (!revealedSquares[index]) return '?';

    if (gameState === 'finished' && allPrizes.length > 0) {
      const prize = allPrizes[index];
      switch (prize) {
        case 'item': return '🎁';
        case 'sub_days': return '⭐';
        case null: return '✗';
        default: return '?';
      }
    }

    if (index === selectedSquare) {
      switch (wonPrize) {
        case 'item': return '🎁';
        case 'sub_days': return '⭐';
        case null: return '✗';
        default: return '?';
      }
    }

    return '?';
  };

  const getSquareClass = (index: number) => {
    const baseClass = 'w-16 h-16 flex items-center justify-center rounded-lg border-2 transition-all duration-300 text-2xl font-bold cursor-pointer';

    if (gameState === 'finished' && revealedSquares[index]) {
      if (index === selectedSquare) {
        return wonPrize ?
          `${baseClass} border-green-400 bg-green-500/20 scale-110 shadow-lg shadow-green-500/25` :
          `${baseClass} border-red-400 bg-red-500/20 scale-110`;
      }
      const prize = allPrizes[index];
      return prize ?
        `${baseClass} border-blue-400/50 bg-blue-500/10` :
        `${baseClass} border-gray-500/50 bg-gray-500/10`;
    }

    if (selectedSquare === index) {
      return `${baseClass} border-yellow-400 bg-yellow-500/20 scale-105 shadow-lg shadow-yellow-500/25`;
    }

    if (gameState === 'idle' || gameState === 'selected') {
      return `${baseClass} border-gray-600 bg-gray-800/50 hover:border-gray-400 hover:bg-gray-700/50 hover:scale-105`;
    }

    return `${baseClass} border-gray-600/50 bg-gray-800/30 cursor-not-allowed`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 rounded-2xl min-w-[400px]">
        {/* Particles Effect */}
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {Array.from({ length: 15 }, (_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 1}s`,
                  animationDuration: `${0.8 + Math.random() * 0.4}s`
                }}
              />
            ))}
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🎲</div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
            Кубики Удачи
          </h2>
        </div>

        {!isAvailable && gameState === 'idle' ? (
          // Bonus not available
          <div className="text-center space-y-6">
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
              <div className="text-4xl mb-3">⏰</div>
              <div className="text-red-400 mb-2 font-medium">Бонус недоступен</div>
              {timeUntilNext && (
                <div className="text-gray-300 text-sm">
                  <span className="font-mono text-yellow-400">{formatTimeLeft(timeUntilNext)}</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all duration-200"
            >
              Закрыть
            </button>
          </div>
        ) : (
          // Game available
          <div className="space-y-6">
            {/* Game Grid */}
            <div className="flex justify-center">
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 9 }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => handleSquareClick(index)}
                    disabled={gameState === 'playing' || gameState === 'finished'}
                    className={getSquareClass(index)}
                  >
                    {getSquareContent(index)}
                  </button>
                ))}
              </div>
            </div>

            {/* Game Status */}
            <div className="text-center min-h-[60px] flex items-center justify-center">
              {gameState === 'idle' && (
                <p className="text-gray-400">Выберите кубик</p>
              )}

              {gameState === 'selected' && (
                <p className="text-yellow-400">Кубик #{selectedSquare! + 1} выбран</p>
              )}

              {gameState === 'playing' && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <div className="animate-spin w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full" />
                  <span>Играем...</span>
                </div>
              )}

              {gameState === 'finished' && gameResult && (
                <div className="space-y-2">
                  <p className={`font-medium ${wonPrize ? 'text-green-400' : 'text-red-400'}`}>
                    {wonPrize ? '🎉 Поздравляем!' : '😔 В этот раз не повезло'}
                  </p>
                  {wonPrize && (
                    <p className="text-sm text-gray-300">{gameResult}</p>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {gameState === 'selected' && (
                <button
                  onClick={handlePlayGame}
                  disabled={isPlaying}
                  className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
                >
                  {isPlaying ? 'Играем...' : 'Играть!'}
                </button>
              )}

              <button
                onClick={onClose}
                className={`py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all duration-200 ${
                  gameState === 'selected' ? 'px-6' : 'flex-1'
                }`}
              >
                {gameState === 'finished' ? 'Готово' : 'Отмена'}
              </button>
            </div>

            {/* Rewards Info */}
            {gameState === 'idle' && (
              <div className="text-center pt-4 border-t border-gray-700/50">
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Возможные награды:</p>
                  <div className="flex justify-center gap-4 text-gray-400">
                    <span>🎁 Предметы</span>
                    <span>⭐ Подписка</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BonusSquaresGame;
