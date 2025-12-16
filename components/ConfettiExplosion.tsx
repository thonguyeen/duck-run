import React, { useMemo } from 'react';

interface ConfettiExplosionProps {
  color: string;
  className?: string;
}

export const ConfettiExplosion: React.FC<ConfettiExplosionProps> = ({ color, className }) => {
  const particles = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => {
      const angle = Math.random() * 360;
      const distance = 50 + Math.random() * 80; // Distance of explosion
      const tx = Math.cos(angle * Math.PI / 180) * distance;
      const ty = Math.sin(angle * Math.PI / 180) * distance;
      const size = 3 + Math.random() * 6;
      
      // Mix between the racer's color, white, and a festive gold
      const rand = Math.random();
      let pColor = color;
      if (rand > 0.6) pColor = '#FFFFFF';
      else if (rand > 0.8) pColor = '#FFD700';

      return {
        id: i,
        tx,
        ty,
        size,
        delay: Math.random() * 0.3,
        color: pColor
      };
    });
  }, [color]);

  return (
    <div className={`${className} pointer-events-none w-0 h-0 flex items-center justify-center`}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full particle"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animationDelay: `${p.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};