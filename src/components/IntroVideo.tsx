import React, { useEffect, useRef, useState } from 'react';

interface IntroVideoProps {
  isOpen: boolean;
  onVideoEnd: () => void;
  videoUrl: string;
}

const IntroVideo: React.FC<IntroVideoProps> = ({ isOpen, onVideoEnd, videoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    console.log('IntroVideo isOpen changed:', isOpen);
    if (isOpen && videoRef.current) {
      console.log('Attempting to play video...');
      // Запускаем видео когда компонент открывается
      videoRef.current.play().catch(error => {
        console.error('Error playing video:', error);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      console.log('Video can play');
      setIsVideoReady(true);
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
  }, [onVideoEnd]);

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
        className="w-full h-full object-contain"
        playsInline
        preload="auto"
        onClick={(e) => e.stopPropagation()}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
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
