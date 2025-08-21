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

 

  const [message, setMessage] = useState('');
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [isProcessingResult, setIsProcessingResult] = useState(false);
  const [animatingCells, setAnimatingCells] = useState<number[]>([]);
  const [finalBoard, setFinalBoard] = useState<(string | null)[] | null>(null);

  const { data: currentGameData, refetch: refetchCurrentGame } = useGetCurrentTicTacToeGameQuery(undefined, {
    skip: !isOpen,
  });

  const [createGame, { isLoading: isCreatingGame }] = useCreateTicTacToeGameMutation();
  const [makeMove, { isLoading: isMoving }] = useMakeTicTacToeMoveMutation();

  const game = currentGameData?.game;
  const canPlay = currentGameData?.canPlay ?? true;

  useEffect(() => {
    if (isOpen) {
      refetchCurrentGame();
      setShowResult(false);
      setGameResult(null);
      setMessage('');
      setIsProcessingResult(false);
      setAnimatingCells([]);
      setFinalBoard(null);

      // Если игры нет, автоматически создаем новую
      if (!currentGameData?.game) {
        setTimeout(() => {
          handleStartNewGame();
        }, 500);
      }
    }
  }, [isOpen, refetchCurrentGame]);

  // Проверяем, завершена ли игра при обновлении данных
  useEffect(() => {
    if (game && game.game_state?.status === 'finished' && !showResult && !isProcessingResult) {

      // Сохраняем финальную доску
      setFinalBoard(game.game_state.board);
      setIsProcessingResult(true);

      // Добавляем задержку для всех результатов при загрузке
      setTimeout(() => {
        setGameResult(game.result);
        setShowResult(true);
        setIsProcessingResult(false);

        // Если победа, вызываем callback
        if (game.result === 'win' && onRewardReceived) {
          setTimeout(() => {
            onRewardReceived();
          }, 3000);
        }
      }, 1500); // Задержка 1.5 секунды для всех результатов при загрузке
    }
  }, [game, showResult, isProcessingResult, onRewardReceived]);

  const handleStartNewGame = async () => {
    setShowResult(false);
    setGameResult(null);
    setIsProcessingResult(false);
    setAnimatingCells([]);
    setFinalBoard(null);
    try {
      const result = await createGame().unwrap();
      if (result.success) {
        setMessage('');
        refetchCurrentGame();
      }
    } catch (error: any) {
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
    setAnimatingCells([position]);

    try {
      const result = await makeMove({ position }).unwrap();
      if (result.success) {
        setMessage(result.message || '');
        refetchCurrentGame();

        // Если игра завершена, показываем результат
        if (result.game?.game_state?.status === 'finished') {

          // Сохраняем финальную доску
          setFinalBoard(result.game.game_state.board);
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
      setTimeout(() => setAnimatingCells([]), 600);
    }
  };

  const getCellContent = (index: number) => {
    // Если показываем результат и есть сохраненная финальная доска
    if (showResult && finalBoard) {
      const cell = finalBoard[index];
      if (cell === 'X') return '✖️';
      if (cell === 'O') return '⭕';
      return '';
    }

    // Обычный режим игры
    if (!game) {
      return '';
    }
    if (!game.game_state) {
      return '';
    }
    if (!game.game_state.board) {
      return '';
    }

    const cell = game.game_state.board[index];

    if (cell === 'X') return '✖️';
    if (cell === 'O') return '⭕';
    if (cell === null) return '';

    return '';
  };

  const getCellStyle = (index: number) => {
    const baseStyle = "w-24 h-24 border-4 border-gray-600 bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex items-center justify-center text-3xl font-bold cursor-pointer rounded-lg shadow-lg transform hover:scale-105";

    if (!game || !game.game_state) {
      return baseStyle + " cursor-not-allowed opacity-90";
    }

    if (game.game_state.board[index] !== null || showResult) {
      return baseStyle + " cursor-not-allowed opacity-90";
    }

    if (game.game_state.currentPlayer !== 'player' || game.game_state.status !== 'playing') {
      return baseStyle + " cursor-not-allowed";
    }

    if (selectedCell === index) {
      return baseStyle + " bg-gradient-to-br from-blue-600 to-blue-700 scale-95";
    }

    if (animatingCells.includes(index)) {
      return baseStyle + " animate-pulse";
    }

    return baseStyle + " hover:border-blue-500";
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
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm"
      style={{ zIndex: 9999 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-lg w-full mx-4 border-2 border-gray-700 shadow-2xl transform transition-all duration-300"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Крестики-нолики</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl hover:rotate-90 transition-all duration-300"
          >
            ✕
          </button>
        </div>

        {!canPlay ? (
          <div className="text-center">
            <div className="text-6xl mb-6">😴</div>
            <p className="text-red-400 mb-4 text-lg">У вас закончились попытки на сегодня!</p>
            <p className="text-gray-400 mb-8">Приходите завтра за новыми попытками.</p>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-500 transition-all duration-300 transform hover:scale-105"
            >
              Закрыть
            </button>
          </div>
        ) : showResult && gameResult === 'win' ? (
          <div className="text-center">
            {/* Экран победы */}
            <div className="mb-8">
              <div className="animate-bounce">
                <div className="text-8xl mb-6">🎉</div>
                <h3 className="text-3xl font-bold text-green-400 mb-4">Поздравляем!</h3>
                <p className="text-white mb-6 text-lg">Вы выиграли и получили бонусный кейс!</p>
              </div>
            </div>

            {/* Финальная доска с результатами */}
            {game && game.game_state && (
              <div className="mb-8">
                <p className="text-gray-300 mb-4 text-sm">Финальная доска:</p>
                <div className="grid grid-cols-3 gap-3 mx-auto w-fit mb-6">
                  {Array.from({ length: 9 }, (_, index) => (
                    <div
                      key={index}
                      className="w-20 h-20 border-2 border-gray-600 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-2xl font-bold rounded-lg"
                    >
                      {getCellContent(index)}
                    </div>
                  ))}
                </div>

                <div className="text-sm text-gray-400">
                  <p>🎮 Вы играли ✖️ и выиграли!</p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              {game?.attempts_left && game.attempts_left > 0 && (
                <button
                  onClick={handleStartNewGame}
                  disabled={isCreatingGame}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-500 hover:to-green-400 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 font-semibold"
                >
                  {isCreatingGame ? 'Создание...' : 'Играть еще'}
                </button>
              )}

              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-500 hover:to-purple-400 transition-all duration-300 transform hover:scale-105 font-semibold"
              >
                Забрать приз
              </button>
            </div>

            {game?.attempts_left !== undefined && (
              <p className="text-sm text-gray-400 mt-6 bg-gray-800 rounded-lg p-3">
                Осталось попыток: <span className="text-yellow-400 font-semibold">{game.attempts_left}</span>
              </p>
            )}
          </div>
        ) : isProcessingResult ? (
          <div className="text-center">
            {/* Экран ожидания во время обработки результата */}
            <div className="mb-8">
              <div className="text-6xl mb-6 animate-spin">⏳</div>
              <p className="text-white text-lg">Обрабатываем результат...</p>
            </div>
          </div>
        ) : (!game || !game.game_state) && !showResult ? (
          <div className="text-center">
            <div className="text-6xl mb-6">🎮</div>
            <div className="animate-pulse">
              <p className="text-white text-lg">Создаем новую игру...</p>
            </div>
          </div>
        ) : (
          <div>
            {/* Игровое поле */}
            <div className="grid grid-cols-3 gap-4 mb-8 mx-auto w-fit">
              {Array.from({ length: 9 }, (_, index) => (
                <button
                  key={index}
                  onClick={() => handleCellClick(index)}
                  className={getCellStyle(index)}
                  disabled={isMoving || !game || game.game_state.currentPlayer !== 'player' || game.game_state.status !== 'playing' || isProcessingResult || showResult}
                >
                  <span className="transform transition-all duration-300 hover:scale-110">
                    {getCellContent(index)}
                  </span>
                </button>
              ))}
            </div>

            {/* Результат игры под полем (поражение/ничья) */}
            {showResult && gameResult !== 'win' && (
              <div className="mb-6 text-center">
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 rounded-xl p-6">
                  {gameResult === 'lose' && (
                    <div>
                      <div className="text-6xl mb-4">😞</div>
                      <h3 className="text-2xl font-bold text-red-400 mb-2">Поражение</h3>
                      <p className="text-white mb-4">В этот раз не повезло, но не сдавайтесь!</p>
                      <p className="text-sm text-gray-400">🤖 Бот играл ⭕ и выиграл</p>
                    </div>
                  )}
                  {gameResult === 'draw' && (
                    <div>
                      <div className="text-6xl mb-4">🤝</div>
                      <h3 className="text-2xl font-bold text-yellow-400 mb-2">Ничья</h3>
                      <p className="text-white mb-4">Хорошая игра! Попробуйте переиграть!</p>
                      <p className="text-sm text-gray-400">🤝 Ничья - никто не выиграл</p>
                    </div>
                  )}

                  <div className="flex gap-4 mt-6">
                    {game?.attempts_left && game.attempts_left > 0 && (
                      <button
                        onClick={handleStartNewGame}
                        disabled={isCreatingGame}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-500 hover:to-green-400 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 font-semibold"
                      >
                        {isCreatingGame ? 'Создание...' : 'Играть еще'}
                      </button>
                    )}

                    <button
                      onClick={onClose}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-500 transition-all duration-300 transform hover:scale-105 font-semibold"
                    >
                      Закрыть
                    </button>
                  </div>
                </div>

                {game?.attempts_left !== undefined && (
                  <p className="text-sm text-gray-400 mt-4 bg-gray-800 rounded-lg p-3">
                    Осталось попыток: <span className="text-yellow-400 font-semibold">{game.attempts_left}</span>
                  </p>
                )}
              </div>
            )}

            {/* Статус игры (только во время игры) */}
            {!showResult && (
              <div className="text-center mb-6">
                <p className="text-xl font-semibold text-white mb-4 bg-gray-800 rounded-xl p-4">
                  {isProcessingResult ? '⏳ Обрабатываем результат...' : getStatusMessage()}
                </p>

                <div className="flex justify-between text-sm text-gray-400 bg-gray-800 rounded-lg p-3">
                  <span>Попыток осталось: <span className="text-yellow-400 font-semibold">{game?.attempts_left || 0}</span></span>
                  <span>Вы играете: <span className="text-blue-400 font-semibold">✖️</span></span>
                </div>
              </div>
            )}

            {/* Сообщения */}
            {message && !isProcessingResult && !showResult && (
              <div className="mb-6 p-4 bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 rounded-xl text-center">
                <p className="text-white">{message}</p>
              </div>
            )}

            {/* Инструкция (только во время игры) */}
            {!isProcessingResult && !showResult && (
              <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 rounded-xl">
                <p className="text-sm text-gray-300 text-center">
                  <span className="font-semibold text-blue-400">Цель:</span> Соберите 3 символа в ряд (по горизонтали, вертикали или диагонали), чтобы выиграть!
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
