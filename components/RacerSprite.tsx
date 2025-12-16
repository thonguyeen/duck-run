import React from 'react';
import { RacerType, RACER_ICONS } from '../types';
import { DuckSprite } from './DuckSprite';

interface RacerSpriteProps {
  type: RacerType;
  color: string;
  className?: string;
  isMoving?: boolean;
}

export const RacerSprite: React.FC<RacerSpriteProps> = ({ type, color, className, isMoving = true }) => {
  // Nếu là Vịt, dùng component DuckSprite chuyên biệt (có thể đổi màu)
  // DuckSprite đã được vẽ hướng sang phải nên không cần lật
  if (type === 'duck') {
    return (
      <div className={`${className} ${isMoving ? 'animate-waddle' : ''}`}>
        <DuckSprite color={color} className="w-full h-full" />
      </div>
    );
  }

  // Với các loài khác, dùng Emoji từ danh sách icon.
  // Đa số Emoji động vật (Ngựa, Ong...) mặc định hướng sang Trái.
  // Ta cần lật ngược lại (scaleX(-1)) để hướng sang Phải theo chiều chạy.
  return (
    <div className={`${className} ${isMoving ? 'animate-waddle' : ''}`}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full overflow-visible" 
        style={{ 
          // Tạo bóng/viền sáng theo màu của người chơi để dễ nhận biết
          filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.3)) drop-shadow(0 0 2px ${color})` 
        }}
      >
        <text 
          x="50" 
          y="60" 
          fontSize="85" 
          textAnchor="middle" 
          dominantBaseline="middle"
          transform="scale(-1, 1)" 
          style={{ transformOrigin: 'center' }}
        >
          {RACER_ICONS[type]}
        </text>
      </svg>
    </div>
  );
};