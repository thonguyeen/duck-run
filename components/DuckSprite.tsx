import React from 'react';

interface DuckSpriteProps {
  color: string;
  className?: string;
}

export const DuckSprite: React.FC<DuckSpriteProps> = ({ color, className }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} duck-shadow`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body */}
      <path
        d="M25,65 Q20,85 45,85 L75,85 Q95,85 85,60 Q80,45 65,45 L25,65"
        fill={color}
        stroke="#333"
        strokeWidth="2"
      />
      {/* Head */}
      <circle cx="65" cy="35" r="20" fill={color} stroke="#333" strokeWidth="2" />
      {/* Beak */}
      <path d="M80,30 L95,35 L80,40" fill="#FF8C00" stroke="#333" strokeWidth="2" />
      {/* Eye */}
      <circle cx="70" cy="30" r="3" fill="black" />
      <circle cx="72" cy="28" r="1" fill="white" />
      {/* Wing */}
      <path
        d="M45,60 Q55,55 65,65 Q55,75 45,60"
        fill={color}
        filter="brightness(90%)"
        stroke="#333"
        strokeWidth="2"
      />
    </svg>
  );
};