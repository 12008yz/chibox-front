import React from 'react';

interface RouletteSegment {
  option: string;
  style: {
    backgroundColor: string;
    textColor: string;
  };
}

interface RouletteWheelProps {
  segments: RouletteSegment[];
}

export const RouletteWheel: React.FC<RouletteWheelProps> = ({ segments }) => {
  return (
    <svg
      width="320"
      height="320"
      viewBox="0 0 320 320"
      className="drop-shadow-2xl"
    >
      {/* Внешний круг - золотой бордер */}
      <circle
        cx="160"
        cy="160"
        r="158"
        fill="url(#goldGradient)"
      />

      {/* Основной круг */}
      <circle
        cx="160"
        cy="160"
        r="150"
        fill="#1F2937"
      />

      {/* Сегменты */}
      {segments.map((segment, index) => {
        const segmentAngle = 360 / segments.length;
        const startAngle = index * segmentAngle - 90;
        const endAngle = startAngle + segmentAngle;

        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = 160 + 150 * Math.cos(startRad);
        const y1 = 160 + 150 * Math.sin(startRad);
        const x2 = 160 + 150 * Math.cos(endRad);
        const y2 = 160 + 150 * Math.sin(endRad);

        const pathData = `M 160 160 L ${x1} ${y1} A 150 150 0 0 1 ${x2} ${y2} Z`;

        // Позиция текста
        const textAngle = startAngle + segmentAngle / 2;
        const textRad = (textAngle * Math.PI) / 180;
        const textX = 160 + 100 * Math.cos(textRad);
        const textY = 160 + 100 * Math.sin(textRad);

        return (
          <g key={index}>
            <path
              d={pathData}
              fill={segment.style.backgroundColor}
              stroke="#374151"
              strokeWidth="3"
            />
            <text
              x={textX}
              y={textY}
              fill={segment.style.textColor}
              fontSize="11"
              fontWeight="700"
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
            >
              {segment.option.split(' ').map((word, i) => (
                <tspan key={i} x={textX} dy={i === 0 ? 0 : 13}>
                  {word}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}

      {/* Центральный круг с градиентом */}
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>

      <circle
        cx="160"
        cy="160"
        r="30"
        fill="url(#centerGradient)"
        stroke="#3730A3"
        strokeWidth="3"
      />

      <text
        x="160"
        y="166"
        fill="white"
        fontSize="16"
        fontWeight="bold"
        textAnchor="middle"
        style={{ letterSpacing: '1px' }}
      >
        SPIN
      </text>
    </svg>
  );
};
