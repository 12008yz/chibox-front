// Менеджер звуков для приложения
class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private activeClones: Set<HTMLAudioElement> = new Set(); // Отслеживаем все активные клоны
  private soundsEnabled: boolean = true;
  private volume: number = 0.35;
  private audioContext: AudioContext | null = null;
  private unlocked: boolean = false;
  private lastPlayTime: Map<string, number> = new Map(); // Отслеживаем время последнего воспроизведения
  private minPlayInterval: number = 500; // Минимальная задержка между воспроизведениями в мс
 
  // Загружаем  звуки
  private soundPaths = {
    click: '/sounds/click.mp3',
    upgrade: '/sounds/upgrade.mp3',
    notification: '/sounds/notifications.mp3',
    openCase: '/sounds/openCase fromInvintory.mp3',
    gameOver: '/sounds/gameOver.mp3',
    win: '/sounds/torzhestvo.mp3',
    lose: '/sounds/losing-lose.mp3',
    horrorLose: '/sounds/horror-loose.mp3',
    looseUpgrade: '/sounds/loose_upgrade.wav',
    process: '/sounds/PPP.mp3',
    endProcess: '/sounds/end PPP.mp3',
    change: '/sounds/+-.mp3',
    draw: '/sounds/ничья.mp3',
    modal: '/sounds/модальное окно.mp3',
    sellItem: '/sounds/продажа предмета.mp3',
    uiClick: '/sounds/клик.mp3',
    bonusGame: '/sounds/bonus-game.wav',
  };

  constructor() {
    this.preloadSounds();
    this.initAudioContext();
    this.setupUnlockListeners();
  }

  // Инициализация AudioContext для разблокировки звуков
  private initAudioContext() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    } catch (error) {
    }
  }

  // Настройка слушателей для разблокировки звуков при первом взаимодействии
  private setupUnlockListeners() {
    const unlockAudio = () => {
      if (this.unlocked) return;

      // Разблокируем AudioContext
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
        });
      }

      // Воспроизводим только ОДИН тихий звук для разблокировки (вместо всех)
      // Это предотвращает одновременное воспроизведение всех звуков
      const firstSound = this.sounds.values().next().value;
      if (firstSound) {
        const originalVolume = firstSound.volume;
        firstSound.volume = 0;
        const playPromise = firstSound.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              firstSound.pause();
              firstSound.currentTime = 0;
              firstSound.volume = originalVolume;
            })
            .catch(() => {
              // Игнорируем ошибки при разблокировке
            });
        }
      }

      this.unlocked = true;

      // Удаляем слушатели после разблокировки
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };

    // Добавляем слушатели на различные события
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });
  }

  // Предзагрузка всех звуков
  private preloadSounds() {
    let loadedCount = 0;

    Object.entries(this.soundPaths).forEach(([key, path]) => {
      try {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.volume = this.volume;

        // Обработчик успешной загрузки
        audio.addEventListener('canplaythrough', () => {
          loadedCount++;
        }, { once: true });

        // Обработчик ошибки загрузки
        audio.addEventListener('error', () => {
        }, { once: true });

        audio.src = path;
        this.sounds.set(key, audio);
      } catch (error) {
      }
    });
  }

  // Установка состояния звуков
  setSoundsEnabled(enabled: boolean) {
    this.soundsEnabled = enabled;

    if (!enabled) {
      this.stopAll();
    }
  }

  // Проверка состояния звуков
  getSoundsEnabled(): boolean {
    return this.soundsEnabled;
  }

  // Установка громкости (0.0 - 1.0)
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));

    this.sounds.forEach(audio => {
      audio.volume = this.volume;
    });
  }

  // Получение текущей громкости
  getVolume(): number {
    return this.volume;
  }

  // Воспроизведение звука
  play(soundKey: string, loop: boolean = false, ignoreThrottle: boolean = false) {
    if (!this.soundsEnabled) {
      return;
    }

    const sound = this.sounds.get(soundKey);
    if (!sound) {
      return;
    }

    // Защита от множественного воспроизведения (можно отключить через ignoreThrottle)
    if (!ignoreThrottle) {
      const now = Date.now();
      const lastPlay = this.lastPlayTime.get(soundKey) || 0;
      if (now - lastPlay < this.minPlayInterval) {
        return;
      }
      this.lastPlayTime.set(soundKey, now);
    }

    try {
      // Клонируем звук для множественного одновременного воспроизведения
      const clone = sound.cloneNode() as HTMLAudioElement;
      clone.volume = this.volume;
      clone.loop = loop;

      // Добавляем клон в Set для отслеживания
      this.activeClones.add(clone);

      // Удаляем клон из Set когда он закончится (если не зациклен)
      if (!loop) {
        clone.addEventListener('ended', () => {
          this.activeClones.delete(clone);
        }, { once: true });
      }

      const playPromise = clone.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
          })
          .catch(error => {
            // Если не удалось воспроизвести, удаляем из активных
            this.activeClones.delete(clone);

            if (error.name === 'NotAllowedError') {
              if (!this.unlocked) {
              }
            } else if (error.name === 'NotSupportedError') {
            } else {
            }
          });
      }
    } catch (error) {
    }
  }

  // Остановка всех звуков
  stopAll() {

    // Останавливаем оригинальные звуки
    this.sounds.forEach((sound) => {
      try {
        sound.pause();
        sound.currentTime = 0;
      } catch (error) {
      }
    });

    // Останавливаем все активные клоны
    this.activeClones.forEach((clone) => {
      try {
        clone.pause();
        clone.currentTime = 0;
      } catch (error) {
      }
    });

    // Очищаем Set активных клонов
    this.activeClones.clear();
  }

  // Остановка конкретного звука (для зацикленных звуков)
  stop(soundKey: string) {

    // Останавливаем оригинальный звук если он играет
    const sound = this.sounds.get(soundKey);
    if (sound) {
      try {
        sound.pause();
        sound.currentTime = 0;
      } catch (error) {
      }
    }

    // Останавливаем все клоны этого звука
    this.activeClones.forEach((clone) => {
      try {
        // Проверяем если клон соответствует soundKey (можно сравнить по src)
        if (sound && clone.src === sound.src) {
          clone.pause();
          clone.currentTime = 0;
          this.activeClones.delete(clone);
        }
      } catch (error) {
      }
    });

  }

  // Проверка статуса загрузки звуков
  getLoadedSounds(): string[] {
    const loaded: string[] = [];
    this.sounds.forEach((audio, key) => {
      if (audio.readyState >= 3) { // HAVE_FUTURE_DATA или HAVE_ENOUGH_DATA
        loaded.push(key);
      }
    });
    return loaded;
  }

  // Проверка доступности звука
  isSoundLoaded(soundKey: string): boolean {
    const sound = this.sounds.get(soundKey);
    return sound ? sound.readyState >= 3 : false;
  }
}

// Создаем единственный экземпляр
export const soundManager = new SoundManager();

// Хук для использования в React компонентах
export const useSound = () => {
  return soundManager;
};

// Экспортируем для отладки в консоли
if (typeof window !== 'undefined') {
  (window as any).soundManager = soundManager;
 
}
