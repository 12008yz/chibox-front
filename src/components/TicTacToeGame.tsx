import React, { useState, useEffect } from 'react';
import {
  useCreateTicTacToeGameMutation,
  useGetCurrentTicTacToeGameQuery,
  useMakeTicTacToeMoveMutation
} from '../features/user/userApi';

interface TicTacToeGameProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardReceived?: () => void;
}

const TicTacToeGame: React.FC<TicTacToeGameProps> = ({ isOpen, onClose, onRewardReceived }) => {
  console.log('TicTacToeGame: Компонент рендерится с пропсами:', { isOpen, hasOnClose: !!onClose, hasOnRewardReceived: !!onRewardReceived });

  if (isOpen) {
    console.log('TicTacToeGame: ИГРА ДОЛЖНА БЫТЬ ОТКРЫТА!');
  }

  const [message, setMessage] = useState('');
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [isProcessingResult, setIsProcessingResult] = useState(false);

  const { data: currentGameData, refetch: refetchCurrentGame } = useGetCurrentTicTacToeGameQuery(undefined, {
    skip: !isOpen,
  });

  const [createGame, { isLoading: isCreatingGame }] = useCreateTicTacToeGameMutation();
  const [makeMove, { isLoading: isMoving }] = useMakeTicTacToeMoveMutation();

  const game = currentGameData?.game;
  const canPlay = currentGameData?.canPlay ?? true;

  console.log('TicTacToeGame: Данные игры:', {
    currentGameData,
    game,
    canPlay,
    hasGame: !!game,
    gameState: game?.game_state
  });

  useEffect(() => {
    if (isOpen) {
      refetchCurrentGame();
      setShowResult(false);
      setGameResult(null);
      setMessage('');
      setIsProcessingResult(false);
    }
  }, [isOpen, refetchCurrentGame]);

  // Проверяем, завершена ли игра при обновлении данных
  useEffect(() => {
    if (game && game.game_state?.status === 'finished' && !showResult && !isProcessingResult) {
      console.log('TicTacToeGame: Обнаружена завершенная игра при загрузке данных', {
        result: game.result,
        winner: game.game_state.winner
      });

      setIsProcessingResult(true);

      // Добавляем задержку для всех результатов при загрузке
      setTimeout(() => {
        setGameResult(game.result);
        setShowResult(true);
        setIsProcessingResult(false);

        // Если победа, вызываем callback
        if (game.result === 'win' && onRewardReceived) {
          console.log('TicTacToeGame: Победа при загрузке! Вызываем onRewardReceived через 3 секунды...');
          setTimeout(() => {
            console.log('TicTacToeGame: Вызываем onRewardReceived сейчас (из загрузки)!');
            onRewardReceived();
          }, 3000);
        }
      }, 1500); // Задержка 1.5 секунды для всех результатов при загрузке
    }
  }, [game, showResult, isProcessingResult, onRewardReceived]);



  const handleStartNewGame = async () => {
    console.log('TicTacToeGame: Начинаем создание новой игры...');
    setShowResult(false);
    setGameResult(null);
    setIsProcessingResult(false);
    try {
      console.log('TicTacToeGame: Вызываем createGame()...');
      const result = await createGame().unwrap();
      console.log('TicTacToeGame: Результат создания игры:', result);
      if (result.success) {
        console.log('TicTacToeGame: Игра успешно создана');
        setMessage('');
        refetchCurrentGame();
      }
    } catch (error: any) {
      console.error('TicTacToeGame: Ошибка при создании игры:', error);
      setMessage(error?.data?.error || 'Ошибка при создании игры');
    }
  };

  const handleCellClick = async (position: number) => {
    if (!game || game.game_state.status !== 'playing' || game.game_state.currentPlayer !== 'player') {
      return;
    }

    if (game.game_state.board[position] !== null) {
      return;
    }

    setSelectedCell(position);

    try {
      const result = await makeMove({ position }).unwrap();
      if (result.success) {
        setMessage(result.message || '');
        refetchCurrentGame();

        // Если игра завершена, показываем результат
        if (result.game?.game_state?.status === 'finished') {
          console.log('TicTacToeGame: Игра завершена!', {
            result: result.game.result,
            gameState: result.game.game_state,
            winner: result.game.game_state.winner
          });

          setIsProcessingResult(true);

          // Добавляем задержку для всех результатов
          setTimeout(() => {
            setGameResult(result.game.result);
            setShowResult(true);
            setIsProcessingResult(false);

            // Если победа, вызываем callback через дополнительное время
            if (result.game?.result === 'win' && onRewardReceived) {
              console.log('TicTacToeGame: Победа! Вызываем onRewardReceived через 3 секунды...');
              setTimeout(() => {
                console.log('TicTacToeGame: Вызываем onRewardReceived сейчас!');
                onRewardReceived();
              }, 3000); // Показываем результат 3 секунды
            } else if (result.game?.result === 'win') {
              console.log('TicTacToeGame: Победа, но onRewardReceived не передан');
            } else {
              console.log('TicTacToeGame: Результат не является победой:', result.game?.result);
            }
          }, 1500); // Задержка 1.5 секунды для всех результатов
        }
      }
    } catch (error: any) {
      setMessage(error?.data?.error || 'Ошибка при совершении хода');
    } finally {
      setSelectedCell(null);
    }
  };

  const getCellContent = (index: number) => {
    if (!game) return '';
    const cell = game.game_state.board[index];
    if (cell === 'X') return '✖️';
    if (cell === 'O') return '⭕';
    return '';
  };

  const getCellStyle = (index: number) => {
    const baseStyle = "w-20 h-20 border-2 border-gray-600 bg-gray-800 hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center text-2xl font-bold cursor-pointer";

    if (!game || game.game_state.board[index] !== null) {
      return baseStyle + " cursor-not-allowed opacity-75";
    }

    if (game.game_state.currentPlayer !== 'player' || game.game_state.status !== 'playing') {
      return baseStyle + " cursor-not-allowed";
    }

    if (selectedCell === index) {
      return baseStyle + " bg-blue-600";
    }

    return baseStyle;
  };

  const getStatusMessage = () => {
    if (!game) return '';

    if (game.game_state.status === 'finished') {
      if (game.game_state.winner === 'player') {
        return '🎉 Вы выиграли!';
      } else if (game.game_state.winner === 'bot') {
        return '😞 Вы проиграли';
      } else {
        return '🤝 Ничья';
      }
    }

    if (game.game_state.currentPlayer === 'player') {
      return '🎮 Ваш ход';
    } else {
      return '🤖 Ход бота...';
    }
  };

  if (!isOpen) {
    console.log('TicTacToeGame: Не открыт, возвращаем null');
    return null;
  }
  console.log('TicTacToeGame: Рендерим компонент игры');

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      style={{ zIndex: 9999 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          console.log('TicTacToeGame: Клик по фону, закрываем игру');
          onClose();
        }
      }}
    >
      <div
        className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Крестики-нолики</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {!canPlay ? (
          <div className="text-center">
            <p className="text-red-400 mb-4">У вас закончились попытки на сегодня!</p>
            <p className="text-gray-400 mb-6">Приходите завтра за новыми попытками.</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Закрыть
            </button>
          </div>
        ) : showResult ? (
          <div className="text-center">
            {/* Результат игры */}
            <div className="mb-6">
              {gameResult === 'win' && (
                <div>
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-green-400 mb-2">Поздравляем!</h3>
                  <p className="text-white mb-4">Вы выиграли и получили бонусный кейс!</p>
                </div>
              )}
              {gameResult === 'lose' && (
                <div>
                  <div className="text-6xl mb-4">😞</div>
                  <h3 className="text-2xl font-bold text-red-400 mb-2">Поражение</h3>
                  <p className="text-white mb-4">В этот раз не повезло, попробуйте еще раз!</p>
                </div>
              )}
              {gameResult === 'draw' && (
                <div>
                  <div className="text-6xl mb-4">🤝</div>
                  <h3 className="text-2xl font-bold text-yellow-400 mb-2">Ничья</h3>
                  <p className="text-white mb-4">Хорошая игра! Попробуйте еще раз!</p>
                </div>
              )}
            </div>

            {/* Финальная доска с результатами */}
            {game && game.game_state && (
              <div className="mb-6">
                <p className="text-gray-300 mb-3 text-sm">Финальная доска:</p>
                <div className="grid grid-cols-3 gap-2 mx-auto w-fit mb-4">
                  {Array.from({ length: 9 }, (_, index) => (
                    <div
                      key={index}
                      className="w-16 h-16 border-2 border-gray-600 bg-gray-800 flex items-center justify-center text-xl font-bold"
                    >
                      {getCellContent(index)}
                    </div>
                  ))}
                </div>

                {/* Информация о результате */}
                <div className="text-sm text-gray-400">
                  {game.game_state.winner === 'player' && (
                    <p>🎮 Вы играли ✖️ и выиграли!</p>
                  )}
                  {game.game_state.winner === 'bot' && (
                    <p>🤖 Бот играл ⭕ и выиграл</p>
                  )}
                  {game.game_state.winner === 'draw' && (
                    <p>🤝 Ничья - никто не выиграл</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {game?.attempts_left && game.attempts_left > 0 && (
                <button
                  onClick={handleStartNewGame}
                  disabled={isCreatingGame}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isCreatingGame ? 'Создание...' : 'Играть еще'}
                </button>
              )}

              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Закрыть
              </button>
            </div>

            {game?.attempts_left !== undefined && (
              <p className="text-sm text-gray-400 mt-4">
                Осталось попыток: {game.attempts_left}
              </p>
            )}
          </div>
        ) : isProcessingResult ? (
          <div className="text-center">
            {/* Экран ожидания во время обработки результата */}
            <div className="mb-6">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-white">Обрабатываем результат...</p>
            </div>
          </div>
        ) : !game || !game.game_state ? (
          <div className="text-center">
            <p className="text-gray-300 mb-6">
              Добро пожаловать в крестики-нолики! Выиграйте у бота, чтобы получить бонусный кейс.
            </p>
            <p className="text-yellow-400 mb-4">У вас есть 3 попытки в день</p>
            <button
              onClick={handleStartNewGame}
              disabled={isCreatingGame}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isCreatingGame ? 'Создание игры...' : 'Начать игру'}
            </button>
          </div>
        ) : (
          <div>
            {/* Игровое поле */}
            <div className="grid grid-cols-3 gap-2 mb-6 mx-auto w-fit">
              {Array.from({ length: 9 }, (_, index) => (
                <button
                  key={index}
                  onClick={() => handleCellClick(index)}
                  className={getCellStyle(index)}
                  disabled={isMoving || game.game_state.currentPlayer !== 'player' || game.game_state.status !== 'playing' || isProcessingResult}
                >
                  {getCellContent(index)}
                </button>
              ))}
            </div>

            {/* Статус игры */}
            <div className="text-center mb-4">
              <p className="text-lg font-semibold text-white mb-2">
                {isProcessingResult ? '⏳ Обрабатываем результат...' : getStatusMessage()}
              </p>

              <div className="flex justify-between text-sm text-gray-400">
                <span>Попыток осталось: {game.attempts_left}</span>
                <span>Вы играете: ✖️</span>
              </div>
            </div>

            {/* Сообщения */}
            {message && !isProcessingResult && (
              <div className="mb-4 p-3 bg-gray-800 border border-gray-600 rounded text-center">
                <p className="text-white">{message}</p>
              </div>
            )}

            {/* Кнопки управления */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isProcessingResult}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                Закрыть
              </button>
            </div>

            {/* Инструкция */}
            {!isProcessingResult && (
              <div className="mt-4 p-3 bg-gray-800 border border-gray-600 rounded">
                <p className="text-xs text-gray-400 text-center">
                  Соберите 3 символа в ряд (по горизонтали, вертикали или диагонали), чтобы выиграть!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicTacToeGame;
