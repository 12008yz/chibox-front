import React, { useEffect, useRef, useState } from 'react';
import { VolumeX, Volume2 } from 'lucide-react';

interface IntroVideoProps {
  isOpen: boolean;
  onVideoEnd: () => void;
  videoUrl: string;
}

const IntroVideo: React.FC<IntroVideoProps> = ({ isOpen, onVideoEnd, videoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      const video = videoRef.current;

      video.currentTime = 0;
      video.volume = 1.0;

      video.load();

      const attemptPlay = (attemptNumber = 1, maxAttempts = 5) => {
        // Сначала пытаемся воспроизвести со звуком
        video.muted = false;
        const playPromise = video.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsVideoReady(true);
              setIsMuted(false);
            })
            .catch(() => {
              // Если не получилось со звуком, пробуем без звука
              video.muted = true;
              video.play()
                .then(() => {
                  setIsVideoReady(true);
                  setIsMuted(true);
                })
                .catch(() => {
                  if (attemptNumber < maxAttempts) {
                    const delay = attemptNumber * 100;
                    setTimeout(() => {
                      attemptPlay(attemptNumber + 1, maxAttempts);
                    }, delay);
                  }
                });
            });
        }
      };

      setTimeout(() => attemptPlay(), 0);
    }
  }, [isOpen]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const handleEnded = () => {
      onVideoEnd();
    };

    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [onVideoEnd]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
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

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Если звук выключен - включаем его при клике на видео
    if (isMuted && videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };

  if (!isOpen) {
    return null;
  }


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
        autoPlay
        controls={false}
        onClick={handleVideoClick}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* Кнопка звука всегда видна */}
      <button
        onClick={toggleMute}
        className={`absolute top-8 left-8 text-white bg-black/50 hover:bg-black/80 p-4 rounded-lg transition-all duration-200 ${isMuted ? 'animate-pulse' : ''}`}
        title={isMuted ? "Включить звук" : "Выключить звук"}
      >
        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
      </button>

      {/* Подсказка при выключенном звуке */}
      {isMuted && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center pointer-events-none">
          <div className="bg-black/70 px-6 py-4 rounded-lg animate-pulse">
            <VolumeX className="w-12 h-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Нажмите для включения звука</p>
          </div>
        </div>
      )}

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
