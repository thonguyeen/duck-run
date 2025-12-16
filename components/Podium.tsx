
import React from 'react';
import { Racer, DisplayMode, GameMode } from '../types';
import { RacerSprite } from './RacerSprite';
import { Trophy, Award, Medal, BookOpen, Star, ArrowRight } from 'lucide-react';
import { ConfettiExplosion } from './ConfettiExplosion';

interface PodiumProps {
  racers: Racer[];
  displayMode: DisplayMode;
  onRestart: () => void;
  topic: string;
  gameMode: GameMode;
}

export const Podium: React.FC<PodiumProps> = ({ racers, displayMode, onRestart, topic, gameMode }) => {
  const winners = racers
    .filter(r => r.rank !== null && r.rank <= 3)
    .sort((a, b) => (a.rank || 100) - (b.rank || 100));

  const getLabel = (racer: Racer) => {
     switch (displayMode) {
       case 'code': return `#${racer.code}`;
       case 'both': return `${racer.code}. ${racer.name}`;
       case 'name':
       default: return racer.name;
     }
  };

  const first = winners.find(r => r.rank === 1);
  const second = winners.find(r => r.rank === 2);
  const third = winners.find(r => r.rank === 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-5xl bg-gradient-to-b from-white to-blue-50 rounded-3xl shadow-2xl p-6 md:p-8 overflow-hidden animate-pop-in border-4 border-yellow-400/50 flex flex-col max-h-[90vh]">
        
        {/* Shine Background */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-20">
           <div className="w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,gold_45deg,transparent_90deg,gold_135deg,transparent_180deg,gold_225deg,transparent_270deg,gold_315deg,transparent_360deg)] animate-spin-slow"></div>
        </div>

        <div className="absolute top-10 left-10"><ConfettiExplosion color="#FFD700" /></div>
        <div className="absolute top-10 right-10"><ConfettiExplosion color="#FFD700" /></div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center h-full overflow-y-auto no-scrollbar">
          
          {/* Header Section */}
          <div className="text-center mb-6">
            {topic && (
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-1 rounded-full font-bold text-sm mb-2 shadow-sm border border-blue-200">
                <BookOpen size={16} /> {topic}
              </div>
            )}
            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600 drop-shadow-sm uppercase tracking-widest">
               Vinh Danh
            </h2>
            
            {/* Gamification Prompts */}
            <div className="mt-2 min-h-[30px]">
               {gameMode === 'tournament' && (
                  <span className="text-purple-600 font-bold animate-pulse flex items-center justify-center gap-1">
                     <Star size={16} fill="currentColor"/> +10 điểm cho Hạng 1!
                  </span>
               )}
               {/* "Race to Answer" Prompt */}
               {gameMode === 'free' && (
                  <span className="text-green-600 font-bold flex items-center justify-center gap-1">
                     <ArrowRight size={16} /> Người chiến thắng được trả lời câu hỏi!
                  </span>
               )}
            </div>
          </div>

          {/* Podium Display */}
          <div className="flex items-end justify-center w-full gap-4 md:gap-12 mb-8 flex-1 min-h-[250px]">
             
             {/* 2nd Place */}
             <div className="flex flex-col items-center justify-end h-full order-1">
               {second && (
                 <div className="flex flex-col items-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                    <div className="relative mb-[-10px] z-10">
                       <RacerSprite type={second.type} color={second.color} className="w-20 h-20 md:w-28 md:h-28" />
                       <div className="absolute -top-2 -right-2 bg-gray-200 text-gray-700 rounded-full p-2 border-2 border-white shadow-lg">
                          <Award size={16} strokeWidth={3} />
                       </div>
                    </div>
                    <div className="bg-gradient-to-b from-gray-100 to-gray-300 w-24 md:w-36 h-32 md:h-40 rounded-t-2xl border-t-4 border-gray-400 flex flex-col items-center justify-start p-3 shadow-xl">
                       <span className="text-3xl font-black text-gray-500/50 mb-2">2</span>
                       <div className="text-center w-full bg-white/80 backdrop-blur-sm rounded-lg py-1 px-1 shadow-sm">
                          <p className="font-bold text-slate-800 text-xs md:text-sm truncate px-1">{getLabel(second)}</p>
                          {gameMode === 'tournament' && <p className="text-[10px] text-purple-600 font-bold">+7 pts</p>}
                       </div>
                    </div>
                 </div>
               )}
             </div>

             {/* 1st Place */}
             <div className="flex flex-col items-center justify-end h-full order-2 -mt-8">
               {first && (
                 <div className="flex flex-col items-center relative animate-fade-in-up" style={{animationDelay: '0s'}}>
                    <div className="absolute -top-16 z-20 animate-bounce">
                        <Trophy size={50} className="text-yellow-400 drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)] fill-yellow-200" />
                    </div>
                    <div className="relative mb-[-15px] z-20 scale-110">
                       <RacerSprite type={first.type} color={first.color} className="w-28 h-28 md:w-36 md:h-36" />
                       <div className="absolute -inset-6 bg-yellow-400/30 blur-2xl rounded-full animate-pulse -z-10"></div>
                    </div>
                    <div className="bg-gradient-to-b from-yellow-100 to-yellow-300 w-32 md:w-44 h-48 md:h-56 rounded-t-2xl border-t-4 border-yellow-500 flex flex-col items-center justify-start p-4 shadow-2xl z-10 relative">
                       <span className="text-5xl font-black text-yellow-600/40 mb-3">1</span>
                       <div className="text-center w-full bg-white/90 backdrop-blur-sm rounded-xl py-2 px-2 shadow-md border-b-4 border-yellow-200">
                          <p className="font-black text-slate-900 text-sm md:text-lg truncate px-1">{getLabel(first)}</p>
                          {gameMode === 'tournament' && <p className="text-xs text-purple-600 font-bold">+10 pts</p>}
                       </div>
                    </div>
                 </div>
               )}
             </div>

             {/* 3rd Place */}
             <div className="flex flex-col items-center justify-end h-full order-3">
               {third && (
                 <div className="flex flex-col items-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                    <div className="relative mb-[-10px] z-10">
                       <RacerSprite type={third.type} color={third.color} className="w-20 h-20 md:w-28 md:h-28" />
                       <div className="absolute -top-2 -right-2 bg-orange-200 text-orange-800 rounded-full p-2 border-2 border-white shadow-lg">
                          <Medal size={16} strokeWidth={3} />
                       </div>
                    </div>
                    <div className="bg-gradient-to-b from-orange-100 to-orange-300 w-24 md:w-36 h-24 md:h-32 rounded-t-2xl border-t-4 border-orange-400 flex flex-col items-center justify-start p-3 shadow-xl">
                       <span className="text-3xl font-black text-orange-700/30 mb-2">3</span>
                       <div className="text-center w-full bg-white/80 backdrop-blur-sm rounded-lg py-1 px-1 shadow-sm">
                          <p className="font-bold text-slate-800 text-xs md:text-sm truncate px-1">{getLabel(third)}</p>
                          {gameMode === 'tournament' && <p className="text-[10px] text-purple-600 font-bold">+5 pts</p>}
                       </div>
                    </div>
                 </div>
               )}
             </div>

          </div>

          <button 
             onClick={onRestart}
             className="bg-sky-600 hover:bg-sky-700 text-white text-lg font-bold py-3 px-12 rounded-full shadow-lg transform transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
             <ArrowRight /> Tiếp Tục Vòng Sau
          </button>
        </div>
      </div>
    </div>
  );
};
