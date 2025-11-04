import React, { useEffect, useRef, useState } from 'react';

interface IntroVideoProps {
  isOpen: boolean;
  onVideoEnd: () => void;
  videoUrl: string;
}

const IntroVideo: React.FC<IntroVideoProps> = ({ isOpen, onVideoEnd, videoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Начинаем с отключенным звуком для автоплея

  useEffect(() => {
    console.log('IntroVideo isOpen changed:', isOpen);
    if (isOpen && videoRef.current) {
      console.log('Attempting to play video...');
      const video = videoRef.current;

      // Сбрасываем видео к началу
      video.currentTime = 0;

      // Загружаем видео
      video.load();

      // Пытаемся запустить видео с несколькими попытками
      const attemptPlay = (attemptNumber = 1, maxAttempts = 5) => {
        console.log(`Play attempt ${attemptNumber}/${maxAttempts}`);
        const playPromise = video.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Video playing successfully');
              setIsVideoReady(true);
            })
            .catch(error => {
              console.error(`Play attempt ${attemptNumber} failed:`, error);
              // Повторные попытки с увеличивающимся интервалом
              if (attemptNumber < maxAttempts) {
                const delay = attemptNumber * 100; // 100ms, 200ms, 300ms, etc.
                setTimeout(() => {
                  attemptPlay(attemptNumber + 1, maxAttempts);
                }, delay);
              }
            });
        }
      };

      // Немедленная попытка воспроизведения
      setTimeout(() => attemptPlay(), 0);
    }
  }, [isOpen]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      console.log('Video can play');
      setIsVideoReady(true);

      // Автоматически начинаем воспроизведение когда видео готово
      if (isOpen) {
        video.play().catch(error => {
          console.error('Error auto-playing video on canplay:', error);
        });
      }
    };

    const handleEnded = () => {
      console.log('Video ended, calling onVideoEnd');
      onVideoEnd();
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onVideoEnd, isOpen]);

  // Обработка нажатия ESC для пропуска видео
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        console.log('ESC pressed, skipping video');
        onVideoEnd();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onVideoEnd]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      videoRef.current.muted = newMutedState;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
      onClick={onVideoEnd}
    >
      {!isVideoReady && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
        </div>
      )}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        preload="auto"
        muted={isMuted}
        autoPlay={true}
        controls={false}
        onClick={(e) => e.stopPropagation()}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* Кнопка звука */}
      <button
        onClick={toggleMute}
        className="absolute top-8 left-8 text-white bg-black/50 hover:bg-black/80 p-4 rounded-lg transition-all duration-200 text-2xl"
        title={isMuted ? 'Включить звук' : 'Выключить звук'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      {/* Кнопка пропуска */}
      <button
        onClick={onVideoEnd}
        className="absolute top-8 right-8 text-white bg-black/50 hover:bg-black/80 px-6 py-3 rounded-lg transition-all duration-200 text-lg font-semibold"
      >
        Пропустить →
      </button>
    </div>
  );
};

export default IntroVideo;
