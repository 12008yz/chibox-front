import React, { useState, useEffect } from 'react';
import type { Item, CaseTemplate } from '../types/api';

interface CaseOpeningAnimationProps {
  isOpen: boolean;
  onClose: () => void;
  caseTemplate: CaseTemplate | null;
  wonItem: Item | null;
  isLoading: boolean;
}

const CaseOpeningAnimation: React.FC<CaseOpeningAnimationProps> = ({
  isOpen,
  onClose,
  caseTemplate,
  wonItem,
  isLoading
}) => {
  const [animationStage, setAnimationStage] = useState<'opening' | 'revealing' | 'showing'>('opening');
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    if (isOpen && !isLoading && wonItem) {
      console.log('Starting case animation with item:', wonItem.name);
      // Последовательность анимации
      setTimeout(() => {
        console.log('Animation stage: revealing');
        setAnimationStage('revealing');
      }, 1500);
      setTimeout(() => {
        console.log('Animation stage: showing');
        setAnimationStage('showing');
        setShowFireworks(true);
      }, 3000);
      setTimeout(() => setShowFireworks(false), 5000);
    }
  }, [isOpen, isLoading, wonItem]);

  useEffect(() => {
    if (isOpen) {
      console.log('Case opening animation started');
      setAnimationStage('opening');
      setShowFireworks(false);
    } else {
      console.log('Case opening animation closed');
    }
  }, [isOpen]);

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'consumer': return 'from-gray-500 to-gray-600';
      case 'industrial': return 'from-blue-500 to-blue-600';
      case 'milspec': return 'from-purple-500 to-purple-600';
      case 'restricted': return 'from-pink-500 to-pink-600';
      case 'classified': return 'from-red-500 to-red-600';
      case 'covert': return 'from-yellow-500 to-orange-500';
      case 'contraband': return 'from-orange-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRarityName = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'consumer': return 'Потребительское';
      case 'industrial': return 'Промышленное';
      case 'milspec': return 'Армейское';
      case 'restricted': return 'Запрещённое';
      case 'classified': return 'Засекреченное';
      case 'covert': return 'Тайное';
      case 'contraband': return 'Контрабанда';
      default: return rarity;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 overflow-hidden">
      {/* Fireworks effect */}
      {showFireworks && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${10 + Math.random() * 80}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
          {[...Array(6)].map((_, i) => (
            <div
              key={`spark-${i}`}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                top: `${30 + Math.random() * 40}%`,
                left: `${20 + Math.random() * 60}%`,
                animationDelay: `${Math.random() * 1.5}s`,
                animationDuration: '0.8s'
              }}
            />
          ))}
        </div>
      )}

      <div className="relative max-w-md w-full mx-4">
        {/* Case Container */}
        <div className="relative mb-8">
          {/* Case - показывается во время opening и скрывается во время revealing */}
          <div className={`transition-all duration-1000 ${
            animationStage === 'opening' ? 'scale-100 opacity-100' :
            animationStage === 'revealing' ? 'scale-110 opacity-0 -translate-y-20' :
            'scale-0 opacity-0'
          }`}>
            <div className="w-48 h-48 mx-auto rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 p-2 shadow-2xl">
              {caseTemplate?.image_url ? (
                <img
                  src={caseTemplate.image_url}
                  alt={caseTemplate.name}
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 rounded-xl flex items-center justify-center">
                  <svg className="w-16 h-16 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Won Item - появляется во время revealing и остается во время showing */}
          {wonItem && !isLoading && (
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${
              animationStage === 'revealing' ? 'scale-0 opacity-0 translate-y-20' :
              animationStage === 'showing' ? 'scale-100 opacity-100 translate-y-0' :
              'scale-0 opacity-0'
            }`}>
              <div className={`w-48 h-48 rounded-2xl bg-gradient-to-br ${getRarityColor(wonItem.rarity)} p-2 shadow-2xl ${
                showFireworks ? 'animate-pulse' : ''
              }`}>
                {wonItem.image_url ? (
                  <img
                    src={wonItem.image_url}
                    alt={wonItem.name}
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 rounded-xl flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2L3 7v6l7 5 7-5V7l-7-5zM6.5 9.5 9 11l2.5-1.5L14 8l-4-2.5L6 8l.5 1.5z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Case Info */}
        {caseTemplate && (
          <div className="text-center mb-6">
            <h3 className="text-white text-xl font-bold mb-2">{caseTemplate.name}</h3>
            {animationStage === 'opening' && (
              <p className="text-gray-300">Открываем кейс...</p>
            )}
          </div>
        )}

        {/* Won Item Info */}
        {wonItem && animationStage === 'showing' && (
          <div className={`text-center space-y-4 transition-all duration-1000 ${
            animationStage === 'showing' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-2xl font-bold text-white mb-2">🎉 Поздравляем!</h2>
              <h3 className="text-lg font-semibold text-white mb-3">{wonItem.name}</h3>

              <div className="flex items-center justify-center gap-4 mb-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r ${getRarityColor(wonItem.rarity)} text-white`}>
                  {getRarityName(wonItem.rarity)}
                </span>
                <span className="text-green-400 font-bold text-xl">
                  {Number(wonItem.price).toFixed(2)} КР
                </span>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Забрать предмет
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-300">Выбираем предмет...</p>
          </div>
        )}
      </div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #fbbf24 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)`,
          backgroundSize: '200px 200px'
        }}></div>
      </div>
    </div>
  );
};

export default CaseOpeningAnimation;
