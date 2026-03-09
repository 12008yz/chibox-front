import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCreateTicTacToeGameMutation,
  useGetCurrentTicTacToeGameQuery,
  useMakeTicTacToeMoveMutation
} from '../features/user/userApi';
import { soundManager } from '../utils/soundManager';
import { TicTacToeIcon, CancelIcon, ProcessingIcon, GamepadIcon, LostIcon } from './icons';
import { X as XIcon, Lock } from 'lucide-react';

interface TicTacToeGameProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardReceived?: () => void;
}

const TicTacToeGame: React.FC<TicTacToeGameProps> = ({ isOpen, onClose, onRewardReceived }) => {



  const { t } = useTranslation();
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
  const hasSubscription = currentGameData?.has_subscription ?? true;
  const hasWonToday = currentGameData?.has_won_today ?? false;

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

        // Воспроизводим звуки результата
        if (game.result === 'win') {
          soundManager.play('win');
          setTimeout(() => {
            if (onRewardReceived) {
              onRewardReceived();
            }
            onClose();
          }, 2000);
        } else if (game.result === 'lose') {
          soundManager.play('gameOver');
        } else if (game.result === 'draw') {
          soundManager.play('draw');
        }
      }, 1500); // Задержка 1.5 секунды для всех результатов при загрузке
    }
  }, [game, showResult, isProcessingResult, onRewardReceived, onClose]);

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

    // Звук клика по клетке
    soundManager.play('click');

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

            // Звуки результата
            if (result.game?.result === 'win') {
              soundManager.play('win');
              setTimeout(() => {
                if (onRewardReceived) {
                  onRewardReceived();
                }
                onClose();
              }, 2000);
            } else if (result.game?.result === 'lose') {
              soundManager.play('gameOver');
            } else if (result.game?.result === 'draw') {
              soundManager.play('draw');
            }
          }, 1500); // Задержка 1.5 секунды для всех результатов
        }
      }
    } catch (error: any) {
      setMessage(error?.data?.error || t('tic_tac_toe_game.move_error'));
    } finally {
      setSelectedCell(null);
      setTimeout(() => setAnimatingCells([]), 600);
    }
  };

  const getCellContent = (index: number) => {
    // Если показываем результат и есть сохраненная финальная доска
    if (showResult && finalBoard) {
      const cell = finalBoard[index];
      if (cell === 'X') return <XIcon className="w-12 h-12 text-red-400" strokeWidth={3} />;
      if (cell === 'O') return <TicTacToeIcon className="w-12 h-12 text-blue-400" strokeWidth={3} />;
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

    if (cell === 'X') return <XIcon className="w-12 h-12 text-red-400" strokeWidth={3} />;
    if (cell === 'O') return <TicTacToeIcon className="w-12 h-12 text-blue-400" strokeWidth={3} />;
    if (cell === null) return '';

    return '';
  };

  const getCellStyle = (index: number) => {
    const baseStyle = "w-24 h-24 border-4 border-gray-600 bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 transition-colors duration-200 flex items-center justify-center text-3xl font-bold cursor-pointer rounded-lg shadow-lg";

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
      return baseStyle + " from-blue-600 to-blue-700";
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
        return t('tic_tac_toe_game.you_won');
      } else if (game.game_state.winner === 'bot') {
        return t('tic_tac_toe_game.you_lost');
      } else {
        return t('tic_tac_toe_game.draw');
      }
    }

    if (game.game_state.currentPlayer === 'player') {
      return t('tic_tac_toe_game.your_turn');
    } else {
      return t('tic_tac_toe_game.bot_turn');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      data-no-click-sound
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center"
      style={{ zIndex: 9999 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        data-no-click-sound
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-lg w-full mx-4 border-2 border-gray-700 shadow-2xl transform transition-all duration-300"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{t('tic_tac_toe_game.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:rotate-90 transition-all duration-300"
          >
            <CancelIcon className="w-6 h-6" />
          </button>
        </div>

        {/* «Ждём завтра» если уже выиграли сегодня */}
        {hasWonToday ? (
          <div className="text-center">
            <img loading="lazy" src="/images/caseWin.webp"
              alt="Bonus Case"
              className="w-32 h-32 mx-auto mb-6 object-contain"
            />
            <p className="text-green-400 mb-4 text-2xl font-bold">Вы победили!</p>
            <p className="text-gray-400 mb-8 text-lg">Вы герой сегодняшнего дня! Ждём вас завтра</p>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-500 transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              {t('tic_tac_toe_game.close')}
            </button>
          </div>
        ) : !canPlay ? (
          <div className="text-center">
            {!hasSubscription ? (
              <>
                <div className="mb-6 flex justify-center">
                  <Lock className="w-16 h-16 text-yellow-400" />
                </div>
                <p className="text-yellow-400 mb-4 text-lg font-bold">{t('tic_tac_toe_game.no_subscription_title') || 'Требуется статус'}</p>
                <p className="text-gray-400 mb-8">
                  {currentGameData?.free_attempts_info?.reason ||
                   t('tic_tac_toe_game.no_subscription_message') ||
                   'Приобретите статус для доступа к бонусной игре'}
                </p>
                {/* Дополнительная информация о бесплатных попытках */}
                {currentGameData?.free_attempts_info && (
                  <div className="text-sm text-gray-500 mb-4">
                    <p>Использовано бесплатных попыток: {currentGameData.free_attempts_info.claim_count} из 2</p>
                    {currentGameData.free_attempts_info.first_claim_date && (
                      <p>Первая попытка: {new Date(currentGameData.free_attempts_info.first_claim_date).toLocaleString('ru-RU')}</p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-6xl mb-6">😴</div>
                <p className="text-red-400 mb-4 text-lg">{t('tic_tac_toe_game.no_attempts_left')}</p>
                <p className="text-gray-400 mb-8">{t('tic_tac_toe_game.come_back_tomorrow')}</p>
              </>
            )}
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-500 transition-all duration-300 transform hover:scale-105"
            >
              {t('tic_tac_toe_game.close')}
            </button>
          </div>
        ) : showResult && gameResult === 'win' ? (
          <div className="text-center">
            {/* Экран победы */}
            <div className="mb-8">
              <div className="animate-bounce">
                <img loading="lazy" src="/images/caseWin.webp"
                  alt="Bonus Case"
                  className="w-48 h-48 mx-auto mb-6 object-contain"
                />
                <h3 className="text-3xl font-bold text-green-400 mb-4">{t('tic_tac_toe_game.congratulations')}</h3>
                <p className="text-white mb-6 text-lg">{t('tic_tac_toe_game.won_bonus_case')}</p>
              </div>
            </div>

            {/* Финальная доска с результатами */}
            {game && game.game_state && (
              <div className="mb-8">
                <p className="text-gray-300 mb-4 text-sm">{t('tic_tac_toe_game.final_board')}</p>
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
                  <p>{t('tic_tac_toe_game.you_played_x_won')}</p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              {/* Кнопка "Играть снова" убрана, так как после победы играть в этот день больше нельзя */}

              <button
                onClick={() => {
                  // Вызываем callback для награды только при нажатии кнопки
                  if (onRewardReceived) {
                    onRewardReceived();
                  }
                  onClose();
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-500 hover:to-purple-400 transition-all duration-300 transform hover:scale-105 font-semibold"
              >
{t('tic_tac_toe_game.claim_prize')}
              </button>
            </div>

            {game?.attempts_left !== undefined && (
              <p className="text-sm text-gray-400 mt-6 bg-gray-800 rounded-lg p-3">
                {t('tic_tac_toe_game.attempts_left')} <span className="text-yellow-400 font-semibold">{game.attempts_left}</span>
              </p>
            )}
          </div>
        ) : isProcessingResult ? (
          <div className="text-center">
            {/* Экран ожидания во время обработки результата */}
            <div className="mb-8">
              <div className="mb-6 flex justify-center">
                <ProcessingIcon className="w-16 h-16 text-yellow-400 animate-spin" />
              </div>
              <p className="text-white text-lg">{t('tic_tac_toe_game.processing_result')}</p>
            </div>
          </div>
        ) : (!game || !game.game_state) && !showResult ? (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <GamepadIcon className="w-16 h-16 text-blue-400" />
            </div>
            <div className="animate-pulse">
              <p className="text-white text-lg">{t('tic_tac_toe_game.creating_game')}</p>
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
                      <div className="mb-4 flex justify-center">
                        <LostIcon className="w-16 h-16 text-red-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-red-400 mb-2">{t('tic_tac_toe_game.defeat')}</h3>
                      <p className="text-white mb-4">{t('tic_tac_toe_game.no_luck_this_time')}</p>
                      <p className="text-sm text-gray-400">{t('tic_tac_toe_game.bot_won')}</p>
                    </div>
                  )}
                  {gameResult === 'draw' && (
                    <div>
                      <h3 className="text-2xl font-bold text-yellow-400 mb-2">{t('tic_tac_toe_game.draw')}</h3>
                      <p className="text-white mb-4">{t('tic_tac_toe_game.good_game')}</p>
                    </div>
                  )}

                  <div className="flex gap-4 mt-6">
                    {game?.attempts_left && game.attempts_left > 0 && (
                      <button
                        onClick={handleStartNewGame}
                        disabled={isCreatingGame}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-500 hover:to-green-400 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 font-semibold"
                      >
                        {isCreatingGame ? t('tic_tac_toe_game.creating') : t('tic_tac_toe_game.play_again')}
                      </button>
                    )}

                    <button
                      onClick={onClose}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-500 transition-all duration-300 transform hover:scale-105 font-semibold"
                    >
        {t('tic_tac_toe_game.close')}
                    </button>
                  </div>
                </div>

                {game?.attempts_left !== undefined && (
                  <p className="text-sm text-gray-400 mt-4 bg-gray-800 rounded-lg p-3">
                    {t('tic_tac_toe_game.attempts_left')} <span className="text-yellow-400 font-semibold">{game.attempts_left}</span>
                  </p>
                )}
              </div>
            )}

            {/* Статус игры (только во время игры) */}
            {!showResult && (
              <div className="text-center mb-6">
                <p className="text-xl font-semibold text-white mb-4 bg-gray-800 rounded-xl p-4">
                  {isProcessingResult ? t('tic_tac_toe_game.processing_result_status') : getStatusMessage()}
                </p>

                <div className="flex justify-between text-sm text-gray-400 bg-gray-800 rounded-lg p-3">
                  <span>{t('tic_tac_toe_game.attempts_remaining')} <span className="text-yellow-400 font-semibold">{game?.attempts_left || 0}</span></span>
                  <span>{t('tic_tac_toe_game.you_play')} <span className="text-blue-400 font-semibold">✖️</span></span>
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
                  <span className="font-semibold text-blue-400">{t('tic_tac_toe_game.goal')}</span> {t('tic_tac_toe_game.goal_description')}
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
