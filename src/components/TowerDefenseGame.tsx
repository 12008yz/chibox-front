import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  useGetTowerDefenseStatusQuery,
  useCreateTowerDefenseGameMutation,
  useCompleteTowerDefenseGameMutation,
  useGetUserInventoryQuery
} from '../features/user/userApi';
import { soundManager } from '../utils/soundManager';
import { X } from 'lucide-react';
import type { UserInventoryItem } from '../types/api';

// --- Константы карты и ассетов (логика из python-ml: 10x6, путь по середине) ---
const TILE_SIZE = 56;
const WALK_FRAMES = 20;
const EXPLOSION_VISUAL_FRAMES = 8; // короткая вспышка, не спрайт мутанта
// Кадр «во весь рост» — и для покоя, и для стрельбы (чтобы пушки сразу были видны целиком)
const TOWER_IDLE_FRAME = 25;
const TOWER_SHOOT_FRAME = 25;
const PROJECTILE_MS = 280;

const TILES_BASE = '/tower-defense/tiles';
const TILE_GROUND = (i: number) => `${TILES_BASE}/PNG/Top-Down Simple Summer_Ground ${String(i).padStart(2, '0')}.png`;
const TOWER_BASE = '/tower-defense/towers';
const TOWER_IDLE = `${TOWER_BASE}/PNG/${TOWER_IDLE_FRAME}.png`;
const TOWER_SHOOT = `${TOWER_BASE}/PNG/${TOWER_SHOOT_FRAME}.png`;
const ENEMY_WALK = (frame: number) =>
  `/tower-defense/enemies/PNG/1/1_enemies_1_walk_${String(frame).padStart(3, '0')}.png`;
// Смерть врага показываем короткой вспышкой (не спрайтом мутанта, чтобы не было «второго мутанта»)

type Position = { x: number; y: number };
type TowerState = { id: string; position: Position; range: number; damage: number };
type EnemyState = { id: string; pathIndex: number; hp: number; maxHp: number; isAlive: boolean };
type GameState = {
  width: number;
  height: number;
  path: Position[];
  towers: TowerState[];
  enemies: EnemyState[];
  currentWave: number;
  totalWaves: number;
  baseHp: number;
  baseMaxHp: number;
  gold: number;
  status: string;
  wavesCompleted: number;
  enemiesKilled: number;
  towersBuilt: number;
  reservedEnemies: number;
};

function getPathPosition(state: GameState, pathIndex: number): Position {
  const path = state.path || [];
  const idx = Math.min(Math.max(pathIndex, 0), path.length - 1);
  return path[idx] ?? { x: 0, y: 0 };
}

function manhattan(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function findTargetForTower(state: GameState, tower: TowerState): EnemyState | null {
  const inRange: EnemyState[] = [];
  for (const enemy of state.enemies || []) {
    if (!enemy.isAlive) continue;
    const pos = getPathPosition(state, enemy.pathIndex);
    if (manhattan(tower.position, pos) <= tower.range) inRange.push(enemy);
  }
  if (inRange.length === 0) return null;
  inRange.sort((a, b) => b.pathIndex - a.pathIndex);
  return inRange[0];
}

// Тайл земли по координатам (вариация для красоты)
function getGroundTileIndex(x: number, y: number, width: number): number {
  const n = (x + y * width) % 12;
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12][n];
}

interface TowerDefenseGameProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardReceived?: () => void;
}

const TowerDefenseGame: React.FC<TowerDefenseGameProps> = ({ isOpen, onClose, onRewardReceived }) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showItemSelection, setShowItemSelection] = useState(false);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | 'in_progress' | null>(null);
  const [rewardItem, setRewardItem] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [backendGameId, setBackendGameId] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [isStartingSession, setIsStartingSession] = useState(false);

  const [walkFrame, setWalkFrame] = useState(0);
  const [activeProjectiles, setActiveProjectiles] = useState<Array<{ from: Position; to: Position; towerId: string; enemyId: string }>>([]);
  const [activeExplosions, setActiveExplosions] = useState<Array<{ x: number; y: number; frame: number; id: string; key: string }>>([]);
  const [shootingTowerIds, setShootingTowerIds] = useState<Set<string>>(new Set());

  const prevStateRef = useRef<GameState | null>(null);
  const explosionTimersRef = useRef<ReturnType<typeof setInterval>[]>([]);
  const projectileTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const { data: statusData, refetch: refetchStatus } = useGetTowerDefenseStatusQuery(undefined, {
    skip: !isOpen,
  });

  const { data: inventoryData } = useGetUserInventoryQuery(
    { page: 1, limit: 100, status: 'inventory' },
    { skip: !showItemSelection }
  );

  const [createGame, { isLoading: isCreatingGame }] = useCreateTowerDefenseGameMutation();
  const [completeGame] = useCompleteTowerDefenseGameMutation();

  const status = statusData?.data;
  const attemptsLeft = status?.attemptsLeft ?? 0;

  const availableItems =
    inventoryData?.data?.items?.filter(
      (item: UserInventoryItem) => item.item_type === 'item' && item.status === 'inventory'
    ) || [];

  useEffect(() => {
    if (isOpen) {
      refetchStatus();
      setSelectedItemId(null);
      setShowItemSelection(false);
      setGameResult(null);
      setRewardItem(null);
      setSessionId(null);
      setGameState(null);
      setBackendGameId(null);
      setStartError(null);
      setIsStartingSession(false);
      prevStateRef.current = null;
      setActiveProjectiles([]);
      setActiveExplosions([]);
      setShootingTowerIds(new Set());
    }
  }, [isOpen, refetchStatus]);

  const handleStartGame = () => setShowItemSelection(true);
  const handleSelectItem = (itemId: string) => setSelectedItemId(itemId);

  const pythonMlUrl = import.meta.env.VITE_PYTHON_ML_URL || 'http://localhost:8000';

  const handleConfirmBet = async () => {
    if (!selectedItemId) return;
    setStartError(null);
    try {
      const result = await createGame({ inventoryItemId: selectedItemId }).unwrap();
      const game = result.success && result.data ? result.data.game : (result as any).game;
      const rewardItemFromApi = result.success && result.data ? result.data.rewardItem : (result as any).rewardItem;
      if (!game?.id) {
        setStartError('Игра создана, но ответ сервера неожиданный. Обновите страницу.');
        return;
      }
      setShowItemSelection(false);
      setRewardItem(rewardItemFromApi ?? null);
      setBackendGameId(game.id);
      setIsStartingSession(true);
      try {
        const resp = await fetch(`${pythonMlUrl}/tower-defense/session/start`, { method: 'POST' });
        if (!resp.ok) throw new Error('Сервер игры недоступен');
        const data = await resp.json();
        const state = data.state || data;
        const sid = state.sessionId ?? state.session_id;
        if (sid && state.width != null) {
          setSessionId(sid);
          setGameState(normalizeState(state));
        } else {
          setStartError('Не удалось запустить поле игры. Проверьте, что сервер python-ml запущен.');
        }
      } catch {
        setStartError('Не удалось подключиться к серверу игры (python-ml). Запустите его или попробуйте позже.');
      } finally {
        setIsStartingSession(false);
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.data?.error || err?.message || 'Не удалось начать игру. Попробуйте ещё раз.';
      setStartError(typeof msg === 'string' ? msg : 'Не удалось начать игру. Попробуйте ещё раз.');
    }
  };

  function normalizeState(raw: any): GameState {
    const path = raw.path || [];
    return {
      width: raw.width ?? 10,
      height: raw.height ?? 6,
      path: path.map((p: any) => ({ x: p.x ?? 0, y: p.y ?? 0 })),
      towers: (raw.towers || []).map((t: any) => ({
        id: t.id,
        position: t.position ?? { x: 0, y: 0 },
        range: t.range ?? 2,
        damage: t.damage ?? 10,
      })),
      enemies: (raw.enemies || []).map((e: any) => ({
        id: e.id,
        pathIndex: e.pathIndex ?? e.path_index ?? 0,
        hp: e.hp ?? 0,
        maxHp: e.maxHp ?? e.max_hp ?? 0,
        isAlive: e.isAlive ?? e.is_alive ?? true,
      })),
      currentWave: raw.currentWave ?? raw.current_wave ?? 1,
      totalWaves: raw.totalWaves ?? raw.total_waves ?? 3,
      baseHp: raw.baseHp ?? raw.base_hp ?? 20,
      baseMaxHp: raw.baseMaxHp ?? raw.base_max_hp ?? 20,
      status: raw.status ?? 'in_progress',
      wavesCompleted: raw.wavesCompleted ?? raw.waves_completed ?? 0,
      enemiesKilled: raw.enemiesKilled ?? raw.enemies_killed ?? 0,
      towersBuilt: raw.towersBuilt ?? raw.towers_built ?? 0,
      gold: raw.gold ?? 0,
      reservedEnemies: raw.reservedEnemies ?? raw.reserved_enemies ?? 0,
    };
  }

  const handleCompleteGame = async (gameId: string, won: boolean) => {
    try {
      const result = await completeGame({
        gameId,
        wavesCompleted: won ? 10 : 5,
        enemiesKilled: won ? 50 : 20,
        towersBuilt: won ? 8 : 4,
        result: won ? 'win' : 'lose',
      }).unwrap();
      const gameData = result.success && result.data ? result.data.game : (result as any).game;
      const rewardItemData = result.success && result.data ? result.data.rewardItem : (result as any).rewardItem;
      if (gameData?.result) {
        setGameResult(gameData.result);
        if (rewardItemData) setRewardItem(rewardItemData);
        if (gameData.result === 'win') {
          soundManager.play('win');
          setTimeout(() => {
            if (onRewardReceived) onRewardReceived();
            onClose();
          }, 3000);
        } else {
          soundManager.play('gameOver');
        }
        refetchStatus();
      }
    } catch {
      // finish failed
    }
  };

  const handlePlaceTower = useCallback(
    async (x: number, y: number) => {
      if (!sessionId) return;
      try {
        const resp = await fetch(
          `${pythonMlUrl}/tower-defense/session/${sessionId}/action`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ actionType: 'place_tower', x, y }),
          }
        );
        if (resp.ok) {
          const data = await resp.json();
          setGameState(normalizeState(data.state));
        }
      } catch {
        // ignore
      }
    },
    [sessionId, pythonMlUrl]
  );

  useEffect(() => {
    if (!gameState || gameState.status !== 'in_progress') return;
    const prev = prevStateRef.current;
    prevStateRef.current = gameState;

    const prevEnemies = prev?.enemies ?? [];
    const currEnemies = gameState.enemies ?? [];
    const prevCount = prevEnemies.length;
    const currCount = currEnemies.length;

    // Анимация смерти и снаряды — только когда кто-то реально умер (исчез из списка).
    // Иначе при каждом тике можно было ошибочно считать «умершим» того, кто просто сдвинулся.
    const someoneActuallyDied = prev && prevCount > currCount;

    if (prev && prev.path && someoneActuallyDied) {
      const newIds = new Set(currEnemies.map((ne) => ne.id));
      const justDied = prevEnemies.filter((pe) => pe.isAlive && !newIds.has(pe.id));
      const prevPath = prev.path;

      justDied.forEach((e) => {
        const idx = Math.min(Math.max(e.pathIndex, 0), prevPath.length - 1);
        const pos = prevPath[idx];
        if (!pos) return;
        const explosionId = `${e.id}-${pos.x}-${pos.y}-${Date.now()}`;
        const explosionFrameMs = 45;
        for (let f = 0; f < EXPLOSION_VISUAL_FRAMES; f++) {
          const t = setTimeout(() => {
            setActiveExplosions((ex) => {
              const next = ex.filter((x) => x.key !== explosionId);
              if (f < EXPLOSION_VISUAL_FRAMES - 1) next.push({ x: pos.x, y: pos.y, frame: f, id: e.id, key: explosionId });
              return next;
            });
          }, f * explosionFrameMs);
          explosionTimersRef.current.push(t);
        }
        const cleanup = setTimeout(() => {
          setActiveExplosions((ex) => ex.filter((x) => x.key !== explosionId));
        }, EXPLOSION_VISUAL_FRAMES * explosionFrameMs + 30);
        explosionTimersRef.current.push(cleanup);
      });
    }

    if (prev && prev.path && prevEnemies.length > 0) {
      const newProjectiles: Array<{ from: Position; to: Position; towerId: string; enemyId: string }> = [];
      const shootingIds = new Set<string>();
      for (const tower of prev.towers || []) {
        const target = findTargetForTower(prev, tower);
        if (target) {
          const toPos = getPathPosition(prev, target.pathIndex);
          newProjectiles.push({
            from: tower.position,
            to: toPos,
            towerId: tower.id,
            enemyId: target.id,
          });
          shootingIds.add(tower.id);
        }
      }
      if (newProjectiles.length > 0) {
        setShootingTowerIds(shootingIds);
        setActiveProjectiles(newProjectiles);
        newProjectiles.forEach((proj) => {
          const t = setTimeout(() => {
            setShootingTowerIds((s) => {
              const next = new Set(s);
              next.delete(proj.towerId);
              return next;
            });
            setActiveProjectiles((p) => p.filter((x) => x.towerId !== proj.towerId || x.enemyId !== proj.enemyId));
          }, PROJECTILE_MS);
          projectileTimersRef.current.push(t);
        });
      }
    }
  }, [gameState]);

  useEffect(() => {
    const t = setInterval(() => setWalkFrame((f) => (f + 1) % WALK_FRAMES), 120);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!sessionId || !gameState || gameState.status !== 'in_progress') return;
    let cancelled = false;
    const tick = async () => {
      try {
        const resp = await fetch(
          `${pythonMlUrl}/tower-defense/session/${sessionId}/action`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ actionType: 'advance', ticks: 1 }),
          }
        );
        if (resp.ok && !cancelled) {
          const data = await resp.json();
          setGameState(normalizeState(data.state));
          if (
            (data.state?.status === 'won' || data.state?.status === 'lost') &&
            backendGameId
          ) {
            void handleCompleteGame(backendGameId, data.state.status === 'won');
            return;
          }
        }
      } catch {
        // ignore
      }
      if (!cancelled) setTimeout(tick, 800);
    };
    const timer = setTimeout(tick, 800);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      projectileTimersRef.current.forEach(clearTimeout);
      explosionTimersRef.current.forEach(clearTimeout);
      projectileTimersRef.current = [];
      explosionTimersRef.current = [];
    };
  }, [sessionId, gameState?.status, backendGameId, pythonMlUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3">
      <div className="bg-[#1a1a2e] rounded-xl p-5 w-full max-w-4xl mx-auto max-h-[95vh] overflow-y-auto shadow-2xl border border-[#2d2d44]">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-white">Tower Defense</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded"
            aria-label="Закрыть"
          >
            <X size={22} />
          </button>
        </div>

        {showItemSelection ? (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Выберите предмет для ставки</h3>
            <p className="text-gray-400 text-sm mb-3">Если вы выиграете, вы получите предмет дороже вашей ставки!</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto mb-3">
              {availableItems.map((item: UserInventoryItem) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedItemId === item.id
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {item.item?.image_url && (
                    <img loading="lazy" src={item.item.image_url} alt={item.item.name} className="w-full h-20 object-contain mb-2" />
                  )}
                  <p className="text-sm text-white truncate">{item.item?.name}</p>
                  <p className="text-xs text-gray-400">{parseFloat(item.item?.price || '0').toFixed(2)} ₽</p>
                </button>
              ))}
            </div>
            {availableItems.length === 0 && (
              <p className="text-gray-400 text-center py-6">У вас нет предметов в инвентаре для ставки</p>
            )}
            {startError && <p className="text-red-400 text-sm mb-3" role="alert">{startError}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => setShowItemSelection(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmBet}
                disabled={!selectedItemId || isCreatingGame}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingGame ? 'Создание игры...' : 'Начать игру'}
              </button>
            </div>
          </div>
        ) : isStartingSession ? (
          <div className="py-12 text-center">
            <p className="text-white text-lg">Загрузка игры...</p>
            <p className="text-gray-400 text-sm mt-2">Подключение к серверу игры</p>
          </div>
        ) : gameState ? (
          <div>
            <div className="flex flex-wrap items-center gap-4 mb-3 py-2 px-3 rounded-lg bg-[#0f0f1a]/80 border border-[#2d2d44]">
              <span className="text-gray-400">Волна</span>
              <span className="text-white font-semibold">{gameState.currentWave} / {gameState.totalWaves}</span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400">Золото</span>
              <span className="text-amber-400 font-semibold">{gameState.gold}</span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400">База</span>
              <span className="text-amber-400 font-semibold">{gameState.baseHp} / {gameState.baseMaxHp}</span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400">Убито</span>
              <span className="text-white font-semibold">{gameState.enemiesKilled}</span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400">Башен</span>
              <span className="text-white font-semibold">{gameState.towersBuilt}</span>
              {gameState.reservedEnemies > 0 && (
                <>
                  <span className="text-gray-500">|</span>
                  <span className="text-gray-400">В пути</span>
                  <span className="text-purple-300 font-semibold">{gameState.reservedEnemies}</span>
                </>
              )}
            </div>
            <p className="text-gray-500 text-xs mb-2">Клик по пустой клетке (не по дороге) — поставить башню.</p>

            <div
              className="relative inline-block rounded-lg overflow-hidden border-2 border-[#2d2d44] shadow-inner bg-[#0f0f1a]"
              style={{ width: gameState.width * TILE_SIZE, height: gameState.height * TILE_SIZE }}
            >
              <div
                className="absolute inset-0 grid"
                style={{
                  gridTemplateColumns: `repeat(${gameState.width}, ${TILE_SIZE}px)`,
                  gridTemplateRows: `repeat(${gameState.height}, ${TILE_SIZE}px)`,
                }}
              >
                {Array.from({ length: gameState.height }).map((_, y) =>
                  Array.from({ length: gameState.width }).map((__, x) => {
                    const isPath = gameState.path?.some((p) => p.x === x && p.y === y);
                    const tower = gameState.towers?.find((t) => t.position.x === x && t.position.y === y);
                    const canPlace = !isPath && !tower && gameState.status === 'in_progress';
                    const groundTile = getGroundTileIndex(x, y, gameState.width);

                    return (
                      <button
                        key={`${x}-${y}`}
                        type="button"
                        onClick={() => canPlace && handlePlaceTower(x, y)}
                        disabled={!canPlace}
                        className="relative border border-[#1a1a2e] overflow-hidden p-0 block w-full h-full"
                        style={{ minWidth: TILE_SIZE, minHeight: TILE_SIZE }}
                        title={tower ? 'Башня' : canPlace ? `Поставить башню (${x},${y})` : isPath ? 'Дорога' : ''}
                      >
                        {isPath ? (
                          <div
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            style={{
                              background: 'linear-gradient(180deg, #a0826d 0%, #8b7355 50%, #6d5a47 100%)',
                              boxShadow: 'inset 0 0 0 2px #4a3c32, inset 0 1px 0 rgba(255,255,255,0.08)',
                            }}
                          />
                        ) : (
                          <img
                            src={TILE_GROUND(groundTile)}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                            loading="lazy"
                          />
                        )}
                        {tower && (
                          <img
                            src={shootingTowerIds.has(tower.id) ? TOWER_SHOOT : TOWER_IDLE}
                            alt="Башня"
                            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                            loading="lazy"
                          />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Враги поверх карты — плавное перемещение между клетками */}
              {(gameState.enemies || []).filter((e) => e.isAlive).map((enemy) => {
                const pos = getPathPosition(gameState, enemy.pathIndex);
                return (
                  <div
                    key={enemy.id}
                    className="absolute pointer-events-none"
                    style={{
                      left: pos.x * TILE_SIZE,
                      top: pos.y * TILE_SIZE,
                      width: TILE_SIZE,
                      height: TILE_SIZE,
                      zIndex: 10,
                      transition: 'left 0.35s ease-out, top 0.35s ease-out',
                    }}
                  >
                    <img
                      src={ENEMY_WALK(walkFrame)}
                      alt=""
                      className="w-full h-full object-contain drop-shadow-md"
                      loading="lazy"
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 rounded overflow-hidden"
                      style={{ margin: '0 4px' }}
                    >
                      <div
                        className="h-full bg-red-500 transition-all duration-300"
                        style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Снаряды — цель берём по текущей позиции мутанта, чтобы летели в него, а не «на клетку раньше» */}
              {activeProjectiles.map((proj, i) => {
                const targetEnemy = gameState.enemies?.find((e) => e.id === proj.enemyId);
                const to = targetEnemy ? getPathPosition(gameState, targetEnemy.pathIndex) : proj.to;
                return (
                  <Projectile
                    key={`${proj.towerId}-${proj.enemyId}-${i}`}
                    from={proj.from}
                    to={to}
                    tileSize={TILE_SIZE}
                    durationMs={PROJECTILE_MS}
                  />
                );
              })}

              {/* Взрывы (анимация смерти) */}
              {activeExplosions.map((ex) => {
                const progress = ex.frame / (EXPLOSION_VISUAL_FRAMES - 1);
                const scale = 0.4 + progress * 1.2;
                const opacity = 1 - progress * 0.9;
                return (
                  <div
                    key={ex.key}
                    className="absolute pointer-events-none flex items-center justify-center"
                    style={{
                      left: ex.x * TILE_SIZE,
                      top: ex.y * TILE_SIZE,
                      width: TILE_SIZE,
                      height: TILE_SIZE,
                      zIndex: 20,
                    }}
                  >
                    <div
                      className="rounded-full bg-amber-400 shadow-lg"
                      style={{
                        width: TILE_SIZE * 0.6,
                        height: TILE_SIZE * 0.6,
                        transform: `scale(${scale})`,
                        opacity,
                        boxShadow: `0 0 ${TILE_SIZE * 0.4}px ${TILE_SIZE * 0.15}px rgba(251, 191, 36, 0.6)`,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : gameResult ? (
          <div className="text-center py-6">
            <h3 className={`text-2xl font-bold mb-4 ${gameResult === 'win' ? 'text-green-400' : 'text-red-400'}`}>
              {gameResult === 'win' ? 'Победа!' : 'Поражение'}
            </h3>
            {gameResult === 'win' && rewardItem && (
              <div className="mb-4">
                <p className="text-white mb-2">Вы получили предмет-награду:</p>
                <div className="inline-block p-4 bg-purple-900/50 rounded-lg border border-purple-600">
                  {rewardItem.image_url && (
                    <img loading="lazy" src={rewardItem.image_url} alt={rewardItem.name} className="w-28 h-28 object-contain mx-auto mb-2" />
                  )}
                  <p className="text-white font-semibold">{rewardItem.name}</p>
                  <p className="text-green-400">{parseFloat(String(rewardItem.price)).toFixed(2)} ₽</p>
                </div>
              </div>
            )}
            {gameResult === 'lose' && <p className="text-gray-400">Предмет ставки потерян. Попробуйте снова!</p>}
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Статус игры</h3>
            {startError && <p className="text-red-400 text-sm mb-3" role="alert">{startError}</p>}
            <p className="text-gray-400 text-sm">Попыток осталось: {attemptsLeft >= 999999 ? '∞' : attemptsLeft}</p>
            <button
              onClick={handleStartGame}
              disabled={isCreatingGame}
              className="w-full mt-4 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingGame ? 'Создание игры...' : 'Начать новую игру'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

function Projectile({
  from,
  to,
  tileSize,
  durationMs,
}: {
  from: Position;
  to: Position;
  tileSize: number;
  durationMs: number;
}) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(elapsed / durationMs, 1);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [durationMs]);

  const x = from.x * tileSize + tileSize / 2 + (to.x - from.x) * tileSize * progress;
  const y = from.y * tileSize + tileSize / 2 + (to.y - from.y) * tileSize * progress;

  return (
    <div
      className="absolute pointer-events-none rounded-full bg-amber-400 shadow-lg border-2 border-amber-200"
      style={{
        width: 12,
        height: 12,
        left: x - 6,
        top: y - 6,
        zIndex: 15,
      }}
    />
  );
}

export default TowerDefenseGame;
