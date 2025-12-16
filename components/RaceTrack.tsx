import React from 'react';
import { Racer, DisplayMode, RacerType } from '../types';
import { RacerSprite } from './RacerSprite';
import { ConfettiExplosion } from './ConfettiExplosion';

interface RaceTrackProps {
  ducks: Racer[]; 
  displayMode: DisplayMode;
}

export const RaceTrack: React.FC<RaceTrackProps> = ({ ducks, displayMode }) => {
  const raceType = ducks[0]?.type || 'duck';

  const getLabel = (racer: Racer) => {
    switch (displayMode) {
      case 'code': return `#${racer.code}`;
      case 'both': return `${racer.code}. ${racer.name}`;
      case 'name':
      default: return racer.name;
    }
  };

  // --- Dynamic Background Rendering ---
  const renderBackground = () => {
    switch (raceType) {
      case 'duck':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-sky-300 to-blue-500 z-0"></div>
            <div 
              className="absolute inset-0 opacity-20 animate-wave z-0"
              style={{
                backgroundImage: `radial-gradient(circle at 10px 10px, rgba(255,255,255,0.8) 2px, transparent 0)`,
                backgroundSize: '30px 30px'
              }}
            ></div>
            <div className="absolute top-1/4 left-1/4 text-4xl animate-float opacity-80 z-0">🪷</div>
            <div className="absolute bottom-1/3 right-1/4 text-3xl animate-float opacity-70 z-0">🪷</div>
          </>
        );
      case 'bee':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-blue-300 via-sky-200 to-white z-0"></div>
            <div className="absolute top-5 right-10 text-6xl animate-spin-slow opacity-90 z-0">☀️</div>
            <div className="absolute top-10 left-[-100px] text-6xl opacity-80 animate-cloud z-0">☁️</div>
          </>
        );
      case 'rabbit':
      case 'squirrel':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-sky-300 to-green-100 z-0 h-1/2"></div>
            <div className="absolute inset-0 top-1/2 bg-gradient-to-b from-green-300 to-green-600 z-0"></div>
            <div className="absolute bottom-32 left-10 text-6xl animate-tree-sway z-0 opacity-90 origin-bottom">🌳</div>
          </>
        );
      case 'horse':
      case 'ostrich':
        return (
          <>
             <div className="absolute inset-0 bg-amber-100 z-0"></div>
             <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/dirt.png')] z-0"></div>
             <div className="absolute bottom-12 left-[-50px] text-2xl opacity-70 animate-tumble z-0">🧶</div>
          </>
        );
      default:
        return <div className="absolute inset-0 bg-gray-100 z-0"></div>;
    }
  };

  const getLaneStyle = () => {
    switch (raceType) {
      case 'duck': return 'border-b-blue-400/30';
      case 'bee': return 'border-b-white/50';
      case 'horse': case 'ostrich': return 'border-b-amber-700/20';
      case 'rabbit': case 'squirrel': return 'border-b-green-700/10';
      default: return 'border-b-gray-200';
    }
  };

  return (
    <div className="w-full h-[600px] rounded-3xl shadow-2xl overflow-hidden relative border-8 border-white/50 bg-white">
      
      {renderBackground()}

      {/* Track Container */}
      <div className="absolute inset-0 flex flex-col justify-evenly py-4 z-10">
        
        {/* Finish Line */}
        <div className="absolute top-0 bottom-0 right-[10%] w-6 flex flex-col z-0 shadow-lg border-x border-gray-400">
           {Array.from({ length: 40 }).map((_, i) => (
             <div key={i} className={`flex-1 w-full ${i % 2 === 0 ? 'bg-black' : 'bg-white'}`}></div>
           ))}
        </div>

        {ducks.map((racer) => (
          <div 
            key={racer.id} 
            className={`relative h-12 w-full flex items-center ${getLaneStyle()} border-b border-dashed`}
          >
            {/* The Moving Racer */}
            <div
              className="absolute transition-transform duration-[50ms] ease-linear flex flex-col items-center"
              style={{
                left: `calc(10px + (100% - 140px) * ${racer.position / 100})`,
                transform: `translateX(0px)`,
                zIndex: Math.floor(racer.position),
              }}
            >
              <div className="relative flex items-center justify-center group">
                 {/* Name Tag */}
                 <div 
                    className={`absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full shadow-sm text-[10px] font-bold whitespace-nowrap z-30 border 
                      ${raceType === 'duck' ? 'bg-white/80 text-blue-900' : 'bg-white/90 text-slate-800'}`}
                 >
                   {getLabel(racer)}
                 </div>
                 
                 {/* SVG Sprite */}
                 <RacerSprite 
                    type={racer.type}
                    color={racer.color} 
                    isMoving={!racer.isFinished}
                    className={`w-14 h-14 relative z-20 transition-transform ${racer.isFinished ? 'scale-110' : ''}`} 
                 />

                 {/* Finish Effect */}
                 {racer.isFinished && (
                   <ConfettiExplosion color={racer.color} className="absolute z-30" />
                 )}
                 
                 {/* Rank Badge */}
                 {racer.isFinished && racer.rank && (
                   <div className="absolute -right-2 -top-2 bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900 border-2 border-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-lg animate-pop-in z-30">
                     {racer.rank}
                   </div>
                 )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};