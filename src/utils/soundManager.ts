// Менеджер звуков для приложения
class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private activeClones: Set<HTMLAudioElement> = new Set(); // Отслеживаем все активные клоны
  private soundsEnabled: boolean = true;
  private volume: number = 0.5;
  private audioContext: AudioContext | null = null;
  private unlocked: boolean = false;
  private lastPlayTime: Map<string, number> = new Map(); // Отслеживаем время последнего воспроизведения
  private minPlayInterval: number = 100; // Минимальная задержка между воспроизведениями в мс

  // Загружаем звуки
  private soundPaths = {
    click: '/sounds/click.mp3',
    upgrade: '/sounds/upgrade.mp3',
    notification: '/sounds/notifications.mp3',
    openCase: '/sounds/openCase fromInvintory.mp3',
    slotSpin: '/sounds/slot.mp3',
    slotWin: '/sounds/slot win.mp3',
    slotLose: '/sounds/slot loose.mp3',
    gameOver: '/sounds/gameOver.mp3',
    win: '/sounds/torzhestvo.mp3',
    lose: '/sounds/losing-lose.mp3',
    horrorLose: '/sounds/horror-loose.mp3',
    process: '/sounds/PPP.mp3',
    endProcess: '/sounds/end PPP.mp3',
    change: '/sounds/+-.mp3',
    draw: '/sounds/ничья.mp3',
    modal: '/sounds/модальное окно.mp3',
    sellItem: '/sounds/продажа предмета.mp3',
    uiClick: '/sounds/клик.mp3',
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
        console.log('🔊 SoundManager: AudioContext создан');
      }
    } catch (error) {
      console.warn('🔇 SoundManager: Не удалось создать AudioContext', error);
    }
  }

  // Настройка слушателей для разблокировки звуков при первом взаимодействии
  private setupUnlockListeners() {
    const unlockAudio = () => {
      if (this.unlocked) return;

      // Разблокируем AudioContext
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
          console.log('🔊 SoundManager: AudioContext разблокирован');
        });
      }

      // Пробуем воспроизвести тихий звук для разблокировки
      this.sounds.forEach((audio) => {
        const originalVolume = audio.volume;
        audio.volume = 0.01;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              audio.pause();
              audio.currentTime = 0;
              audio.volume = originalVolume;
            })
            .catch(() => {
              // Игнорируем ошибки при разблокировке
            });
        }
      });

      this.unlocked = true;
      console.log('🔊 SoundManager: Звуки разблокированы через взаимодействие пользователя');

      // Удаляем слушатели после разблокировки
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };

    // Добавляем слушатели на различные события
    document.addEventListener('click', unlockAudio, { once: false });
    document.addEventListener('touchstart', unlockAudio, { once: false });
    document.addEventListener('keydown', unlockAudio, { once: false });
  }

  // Предзагрузка всех звуков
  private preloadSounds() {
    let loadedCount = 0;
    const totalSounds = Object.keys(this.soundPaths).length;

    Object.entries(this.soundPaths).forEach(([key, path]) => {
      try {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.volume = this.volume;

        // Обработчик успешной загрузки
        audio.addEventListener('canplaythrough', () => {
          loadedCount++;
          console.log(`🔊 SoundManager: Загружен звук "${key}" (${loadedCount}/${totalSounds})`);
          if (loadedCount === totalSounds) {
            console.log('🔊 SoundManager: Все звуки предзагружены');
          }
        }, { once: true });

        // Обработчик ошибки загрузки
        audio.addEventListener('error', (e) => {
          console.error(`🔇 SoundManager: Ошибка загрузки звука "${key}" из "${path}"`, e);
        }, { once: true });

        audio.src = path;
        this.sounds.set(key, audio);
      } catch (error) {
        console.error(`🔇 SoundManager: Исключение при создании аудио "${key}"`, error);
      }
    });
  }

  // Установка состояния звуков
  setSoundsEnabled(enabled: boolean) {
    this.soundsEnabled = enabled;
    console.log(`🔊 SoundManager: Звуки ${enabled ? 'включены' : 'выключены'}`);

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
    console.log(`🔊 SoundManager: Громкость установлена на ${Math.round(this.volume * 100)}%`);

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
      console.log(`🔇 SoundManager: Звуки отключены, пропускаем "${soundKey}"`);
      return;
    }

    const sound = this.sounds.get(soundKey);
    if (!sound) {
      console.warn(`🔇 SoundManager: Звук "${soundKey}" не найден`);
      console.log('🔊 SoundManager: Доступные звуки:', Array.from(this.sounds.keys()).join(', '));
      return;
    }

    // Защита от множественного воспроизведения (можно отключить через ignoreThrottle)
    if (!ignoreThrottle) {
      const now = Date.now();
      const lastPlay = this.lastPlayTime.get(soundKey) || 0;
      if (now - lastPlay < this.minPlayInterval) {
        console.log(`🔇 SoundManager: Пропускаем "${soundKey}" - слишком частое воспроизведение (${now - lastPlay}мс)`);
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
            console.log(`🔊 SoundManager: Воспроизведен звук "${soundKey}"${loop ? ' (зациклен)' : ''}`);
          })
          .catch(error => {
            // Если не удалось воспроизвести, удаляем из активных
            this.activeClones.delete(clone);

            if (error.name === 'NotAllowedError') {
              console.warn(`🔇 SoundManager: Браузер блокирует автовоспроизведение "${soundKey}". Требуется взаимодействие пользователя.`);
              if (!this.unlocked) {
                console.log('🔊 SoundManager: Кликните в любом месте страницы для разблокировки звуков');
              }
            } else if (error.name === 'NotSupportedError') {
              console.error(`🔇 SoundManager: Формат звука "${soundKey}" не поддерживается`, error);
            } else {
              console.error(`🔇 SoundManager: Ошибка воспроизведения "${soundKey}"`, error);
            }
          });
      }
    } catch (error) {
      console.error(`🔇 SoundManager: Исключение при воспроизведении "${soundKey}"`, error);
    }
  }

  // Остановка всех звуков
  stopAll() {
    console.log('🔊 SoundManager: Остановка всех звуков');

    // Останавливаем оригинальные звуки
    this.sounds.forEach((sound, key) => {
      try {
        sound.pause();
        sound.currentTime = 0;
      } catch (error) {
        console.warn(`🔇 SoundManager: Не удалось остановить звук "${key}"`, error);
      }
    });

    // Останавливаем все активные клоны
    this.activeClones.forEach((clone) => {
      try {
        clone.pause();
        clone.currentTime = 0;
      } catch (error) {
        console.warn(`🔇 SoundManager: Не удалось остановить клон`, error);
      }
    });

    // Очищаем Set активных клонов
    this.activeClones.clear();
    console.log('🔊 SoundManager: Все звуки и клоны остановлены');
  }

  // Остановка конкретного звука (для зацикленных звуков)
  stop(soundKey: string) {
    console.log(`🔊 SoundManager: Остановка звука "${soundKey}"`);

    // Останавливаем оригинальный звук если он играет
    const sound = this.sounds.get(soundKey);
    if (sound) {
      try {
        sound.pause();
        sound.currentTime = 0;
      } catch (error) {
        console.warn(`🔇 SoundManager: Не удалось остановить звук "${soundKey}"`, error);
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
        console.warn(`🔇 SoundManager: Не удалось остановить клон "${soundKey}"`, error);
      }
    });

    console.log(`🔊 SoundManager: Звук "${soundKey}" остановлен`);
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
  console.log('🔊 SoundManager: Доступен глобально через window.soundManager');
}
