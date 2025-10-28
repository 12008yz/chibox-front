// Менеджер звуков для приложения
class SoundManager {
   private sounds: Map<string, HTMLAudioElement> = new Map();
   private soundsEnabled: boolean = true;
   private volume: number = 0.5;
 
   // Загружаем звуки
   private soundPaths = {
     click: '/sounds/click.wav',
     upgrade: '/sounds/апгрейд.mp3',
     notification: '/sounds/notifications.wav',
     openCase: '/sounds/openCase fromInvintory.wav',
     slotSpin: '/sounds/slot.wav',
     slotWin: '/sounds/slot win.wav',
     slotLose: '/sounds/slot loose.wav',
     gameOver: '/sounds/gameOver.wav',
     win: '/sounds/torzhestvo.wav',
     lose: '/sounds/losing-lose.wav',
     horrorLose: '/sounds/horror-loose.wav',
     process: '/sounds/PPP.wav',
     endProcess: '/sounds/end PPP.wav',
     change: '/sounds/+-.wav',
   };
 
   constructor() {
     this.preloadSounds();
   }
 
   // Предзагрузка всех звуков
   private preloadSounds() {
     Object.entries(this.soundPaths).forEach(([key, path]) => {
       const audio = new Audio(path);
       audio.volume = this.volume;
       audio.preload = 'auto';
       this.sounds.set(key, audio);
     });
   }
 
   // Установка состояния звуков
   setSoundsEnabled(enabled: boolean) {
     this.soundsEnabled = enabled;
   }
 
   // Установка громкости (0.0 - 1.0)
   setVolume(volume: number) {
     this.volume = Math.max(0, Math.min(1, volume));
     this.sounds.forEach(audio => {
       audio.volume = this.volume;
     });
   }
 
   // Воспроизведение звука
   play(soundKey: string) {
     if (!this.soundsEnabled) return;
 
     const sound = this.sounds.get(soundKey);
     if (!sound) {
       console.warn(`Sound "${soundKey}" not found`);
       return;
     }
 
     // Клонируем звук для множественного воспроизведения
     const clone = sound.cloneNode() as HTMLAudioElement;
     clone.volume = this.volume;
 
     clone.play().catch(error => {
       console.warn(`Failed to play sound "${soundKey}":`, error);
     });
   }
 
   // Остановка всех звуков
   stopAll() {
     this.sounds.forEach(sound => {
       sound.pause();
       sound.currentTime = 0;
     });
   }
 }
 
 // Создаем единственный экземпляр
 export const soundManager = new SoundManager();
 
 // Хук для использования в React компонентах
 export const useSound = () => {
   return soundManager;
 };
 