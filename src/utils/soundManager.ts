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
  private unlockedSoundKey: string = 'uiClick';
  private ignoreError(): void {
    // intentionally ignored in non-critical audio flows
  }
 
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
    this.preloadEssentialSounds();
    this.initAudioContext();
    this.setupUnlockListeners();
  }

  // Инициализация AudioContext для разблокировки звуков
  private initAudioContext() {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    } catch {
      this.ignoreError();
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
      const firstSound = this.ensureSoundLoaded(this.unlockedSoundKey) || this.sounds.values().next().value;
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

  private createSound(path: string, preload: 'none' | 'metadata' | 'auto' = 'none'): HTMLAudioElement {
    const audio = new Audio();
    audio.preload = preload;
    audio.volume = this.volume;
    audio.src = path;
    return audio;
  }

  // Предзагрузка только базовых звуков (остальные — по требованию)
  private preloadEssentialSounds() {
    const essentialKeys: Array<keyof SoundManager['soundPaths']> = ['uiClick', 'click'];
    essentialKeys.forEach((key) => {
      const path = this.soundPaths[key];
      try {
        const audio = this.createSound(path, 'metadata');
        this.sounds.set(key, audio);
      } catch {
        this.ignoreError();
      }
    });
  }

  private ensureSoundLoaded(soundKey: string): HTMLAudioElement | null {
    const existing = this.sounds.get(soundKey);
    if (existing) return existing;
    const path = this.soundPaths[soundKey as keyof SoundManager['soundPaths']];
    if (!path) return null;
    try {
      const audio = this.createSound(path, 'auto');
      this.sounds.set(soundKey, audio);
      return audio;
    } catch {
      this.ignoreError();
      return null;
    }
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

    const sound = this.ensureSoundLoaded(soundKey);
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
              if (!this.unlocked) this.ignoreError();
            } else if (error.name === 'NotSupportedError') {
              this.ignoreError();
            } else {
              this.ignoreError();
            }
          });
      }
    } catch {
      this.ignoreError();
    }
  }

  // Остановка всех звуков
  stopAll() {

    // Останавливаем оригинальные звуки
    this.sounds.forEach((sound) => {
      try {
        sound.pause();
        sound.currentTime = 0;
      } catch {
        this.ignoreError();
      }
    });

    // Останавливаем все активные клоны
    this.activeClones.forEach((clone) => {
      try {
        clone.pause();
        clone.currentTime = 0;
      } catch {
        this.ignoreError();
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
      } catch {
        this.ignoreError();
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
      } catch {
        this.ignoreError();
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

  // Ожидание предзагрузки конкретных звуков (или таймаута)
  waitForSounds(soundKeys: string[], timeoutMs: number = 1800): Promise<void> {
    const pending = soundKeys
      .map((key) => this.sounds.get(key))
      .filter((audio): audio is HTMLAudioElement => !!audio)
      .filter((audio) => audio.readyState < 3);

    if (pending.length === 0) {
      return Promise.resolve();
    }

    const waitForOne = (audio: HTMLAudioElement) =>
      new Promise<void>((resolve) => {
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          audio.removeEventListener('canplaythrough', finish);
          audio.removeEventListener('error', finish);
          resolve();
        };
        audio.addEventListener('canplaythrough', finish, { once: true });
        audio.addEventListener('error', finish, { once: true });
      });

    return Promise.race([
      Promise.allSettled(pending.map(waitForOne)).then(() => undefined),
      new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
    ]);
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
  (window as Window & { soundManager?: SoundManager }).soundManager = soundManager;
 
}
