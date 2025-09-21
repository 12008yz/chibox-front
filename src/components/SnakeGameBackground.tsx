import React, { useEffect, useRef, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

interface SnakeGameBackgroundProps {
  className?: string;
}

const SnakeGameBackground: React.FC<SnakeGameBackgroundProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef({
    snake: [{ x: 10, y: 10 }] as Position[],
    food: { x: 15, y: 15 } as Position,
    direction: { x: 1, y: 0 } as Position,
    gridSize: 20,
    tileCount: { x: 0, y: 0 },
    lastTime: 0,
    gameSpeed: 150, // мс между движениями
    score: 0,
    isPaused: false
  });

  const generateFood = useCallback(() => {
    const state = gameStateRef.current;
    let newFood: Position;
    
    // Генерируем еду в случайном месте, не занятом змейкой
    do {
      newFood = {
        x: Math.floor(Math.random() * state.tileCount.x),
        y: Math.floor(Math.random() * state.tileCount.y)
      };
    } while (state.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    state.food = newFood;
  }, []);

  const resetGame = useCallback(() => {
    const state = gameStateRef.current;
    state.snake = [{ x: Math.floor(state.tileCount.x / 2), y: Math.floor(state.tileCount.y / 2) }];
    state.direction = { x: 1, y: 0 };
    state.score = 0;
    generateFood();
  }, [generateFood]);

  const updateGame = useCallback(() => {
    const state = gameStateRef.current;
    const head = { ...state.snake[0] };
    
    // Двигаем голову
    head.x += state.direction.x;
    head.y += state.direction.y;
    
    // Проверяем столкновения со стенами (проходим сквозь них)
    if (head.x < 0) head.x = state.tileCount.x - 1;
    if (head.x >= state.tileCount.x) head.x = 0;
    if (head.y < 0) head.y = state.tileCount.y - 1;
    if (head.y >= state.tileCount.y) head.y = 0;
    
    // Проверяем столкновение с собой
    if (state.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      resetGame();
      return;
    }
    
    state.snake.unshift(head);
    
    // Проверяем, съели ли еду
    if (head.x === state.food.x && head.y === state.food.y) {
      state.score++;
      generateFood();
    } else {
      state.snake.pop();
    }
    
    // Иногда меняем направление случайным образом для автономности
    if (Math.random() < 0.05) { // 5% шанс поворота
      const directions = [
        { x: 0, y: -1 }, // вверх
        { x: 1, y: 0 },  // вправо
        { x: 0, y: 1 },  // вниз
        { x: -1, y: 0 }  // влево
      ];
      
      // Избегаем поворота в обратную сторону
      const newDirection = directions[Math.floor(Math.random() * directions.length)];
      if (!(newDirection.x === -state.direction.x && newDirection.y === -state.direction.y)) {
        state.direction = newDirection;
      }
    }
  }, [resetGame, generateFood]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const state = gameStateRef.current;
    
    // Очищаем канвас
    ctx.fillStyle = 'rgba(21, 18, 37, 0.1)'; // Очень прозрачный фон
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Рисуем змейку с градиентом
    state.snake.forEach((segment, index) => {
      const alpha = Math.max(0.1, 0.4 - index * 0.02); // Затухающий хвост
      
      if (index === 0) {
        // Голова - немного ярче
        ctx.fillStyle = `rgba(34, 197, 94, ${alpha * 1.5})`;
      } else {
        // Тело
        ctx.fillStyle = `rgba(34, 197, 94, ${alpha})`;
      }
      
      const x = segment.x * state.gridSize;
      const y = segment.y * state.gridSize;
      
      // Рисуем округлые сегменты
      ctx.beginPath();
      ctx.roundRect(x + 1, y + 1, state.gridSize - 2, state.gridSize - 2, 4);
      ctx.fill();
    });
    
    // Рисуем еду (мерцающую)
    const foodAlpha = 0.3 + Math.sin(Date.now() * 0.005) * 0.1;
    ctx.fillStyle = `rgba(239, 68, 68, ${foodAlpha})`;
    ctx.beginPath();
    ctx.roundRect(
      state.food.x * state.gridSize + 2,
      state.food.y * state.gridSize + 2,
      state.gridSize - 4,
      state.gridSize - 4,
      6
    );
    ctx.fill();
    
    // Добавляем внутреннее свечение для еды
    ctx.fillStyle = `rgba(255, 255, 255, ${foodAlpha * 0.5})`;
    ctx.beginPath();
    ctx.roundRect(
      state.food.x * state.gridSize + 4,
      state.food.y * state.gridSize + 4,
      state.gridSize - 8,
      state.gridSize - 8,
      4
    );
    ctx.fill();
  }, []);

  const gameLoop = useCallback((currentTime: number) => {
    const state = gameStateRef.current;
    
    if (currentTime - state.lastTime >= state.gameSpeed) {
      updateGame();
      state.lastTime = currentTime;
    }
    
    draw();
    requestAnimationFrame(gameLoop);
  }, [updateGame, draw]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const container = canvas.parentElement;
    if (!container) return;
    
    const state = gameStateRef.current;
    
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    state.tileCount.x = Math.floor(canvas.width / state.gridSize);
    state.tileCount.y = Math.floor(canvas.height / state.gridSize);
    
    // Перепозиционируем змейку и еду если нужно
    if (state.snake[0].x >= state.tileCount.x || state.snake[0].y >= state.tileCount.y) {
      resetGame();
    } else {
      generateFood();
    }
  }, [resetGame, generateFood]);

  useEffect(() => {
    resizeCanvas();
    
    const handleResize = () => {
      resizeCanvas();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Запускаем игру
    requestAnimationFrame(gameLoop);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [resizeCanvas, gameLoop]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          pointerEvents: 'none',
          mixBlendMode: 'screen', // Режим наложения для лучшей интеграции
          opacity: 0.6
        }}
      />
      
      {/* Дополнительный градиентный слой для большей глубины */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-transparent to-emerald-900/5"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
};

export default SnakeGameBackground;