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

  const { data: currentGameData, refetch: refetchCurrentGame } = useGetCurrentTicTacToeGameQuery(undefined, {
    skip: !isOpen,
  });

  const [createGame, { isLoading: isCreatingGame }] = useCreateTicTacToeGameMutation();
  const [makeMove, { isLoading: isMoving }] = useMakeTicTacToeMoveMutation();

  const game = currentGameData?.data?.game;
  const canPlay = currentGameData?.data?.canPlay ?? true;

  useEffect(() => {
    if (isOpen) {
      refetchCurrentGame();
    }
  }, [isOpen, refetchCurrentGame]);

  const handleStartNewGame = async () => {
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

    try {
      const result = await makeMove({ position }).unwrap();
      if (result.success) {
        setMessage(result.message || '');
        refetchCurrentGame();

        if (result.data?.game?.result === 'win' && onRewardReceived) {
          onRewardReceived();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
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
        ) : !game ? (
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
                  disabled={isMoving || game.game_state.currentPlayer !== 'player' || game.game_state.status !== 'playing'}
                >
                  {getCellContent(index)}
                </button>
              ))}
            </div>

            {/* Статус игры */}
            <div className="text-center mb-4">
              <p className="text-lg font-semibold text-white mb-2">
                {getStatusMessage()}
              </p>

              <div className="flex justify-between text-sm text-gray-400">
                <span>Попыток осталось: {game.attempts_left}</span>
                <span>Вы играете: ✖️</span>
              </div>
            </div>

            {/* Сообщения */}
            {message && (
              <div className="mb-4 p-3 bg-gray-800 border border-gray-600 rounded text-center">
                <p className="text-white">{message}</p>
              </div>
            )}

            {/* Кнопки управления */}
            <div className="flex gap-3">
              {game.game_state.status === 'finished' && (
                <button
                  onClick={handleStartNewGame}
                  disabled={isCreatingGame || game.attempts_left <= 0}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isCreatingGame ? 'Создание...' : 'Новая игра'}
                </button>
              )}

              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Закрыть
              </button>
            </div>

            {/* Инструкция */}
            <div className="mt-4 p-3 bg-gray-800 border border-gray-600 rounded">
              <p className="text-xs text-gray-400 text-center">
                Соберите 3 символа в ряд (по горизонтали, вертикали или диагонали), чтобы выиграть!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicTacToeGame;
