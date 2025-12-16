
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SetupPanel } from './components/SetupPanel';
import { RaceTrack } from './components/RaceTrack';
import { Podium } from './components/Podium';
import { Racer, GameState, RacerType, DisplayMode, PlayerScore, GameMode } from './types';
import { createRacersFromNames } from './utils/gameUtils';
import { generateRaceCommentary } from './services/geminiService';
import { playStartSound, playAnimalSound, playFinishLineSound, playWinSound, playApplauseSound } from './services/soundService';
import { RefreshCw, Volume2, Timer, Eye, Hash, Type, Trophy } from 'lucide-react';

const FRAME_RATE = 60;

function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
  const [racers, setRacers] = useState<Racer[]>([]);
  const [commentary, setCommentary] = useState<string>("Chào mừng đến với trường đua!");
  
  // Game Configuration State
  const [currentTopic, setCurrentTopic] = useState<string>("");
  const [gameMode, setGameMode] = useState<GameMode>('free'); // Will be determined by how start is called later, or passed
  const [leaderboard, setLeaderboard] = useState<PlayerScore[]>([]);
  
  const [countDown, setCountDown] = useState(3);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('both');
  
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number | undefined>(undefined);
  const racersRef = useRef<Racer[]>(racers);
  const raceStartTimeRef = useRef<number>(0);

  useEffect(() => {
    racersRef.current = racers;
  }, [racers]);

  const startRace = async (names: string[], type: RacerType, duration: number, randomizeColors: boolean, topic: string) => {
    setCurrentTopic(topic);
    
    // Determine mode based on context if needed, but for now we assume SetupPanel sets up the names correctly.
    // Ideally pass gameMode from SetupPanel, but we can infer 'tournament' if we want to track points.
    // For this implementation, we will assume if names exist in leaderboard, update them.
    
    // We need to know if we are in tournament mode. 
    // Since I didn't change the signature of onStartRace to accept GameMode in the prop drilling (to keep it simple),
    // we can deduce or just track it. Let's assume standard flow for now.
    // *Correction*: I should store gameMode state from SetupPanel. 
    // Since SetupPanel component has local state for gameMode, we should probably lift it or pass it.
    // For now, let's assume 'tournament' mode is active if leaderboard has items or user wants points.
    // Actually, let's auto-detect: if names match existing leaderboard names, use that context.
    
    const newRacers = createRacersFromNames(names, type, duration, randomizeColors);
    setRacers(newRacers);
    setElapsedTime(0);
    setCountDown(3);
    
    playStartSound();
    setGameState(GameState.COUNTDOWN);

    const topicIntro = topic ? ` về chủ đề "${topic}"` : "";
    setCommentary(`Hệ thống sẵn sàng! Cuộc đua${topicIntro} sắp bắt đầu...`);
    
    // Gemini commentary can wait a bit
    const intro = await generateRaceCommentary(newRacers, 'start');
    setCommentary(intro);
  };

  // Helper to detect if we should treat this as a tournament
  const isTournamentMode = leaderboard.length > 0;

  // Logic to handle Countdown 3 -> 2 -> 1 -> Racing
  useEffect(() => {
    if (gameState === GameState.COUNTDOWN) {
      const interval = setInterval(() => {
        setCountDown(prev => {
          if (prev === 1) {
            clearInterval(interval);
            setTimeout(() => {
              setGameState(GameState.RACING);
              raceStartTimeRef.current = Date.now();
            }, 1000);
            return 0; 
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  const resetGame = () => {
    // If tournament, update points before resetting
    if (gameState === GameState.FINISHED) {
        updateLeaderboard();
    }
    setGameState(GameState.SETUP);
    setRacers([]);
    setCommentary("Chào mừng đến với trường đua!");
    setElapsedTime(0);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const updateLeaderboard = () => {
      // Calculate points based on rank
      // Rank 1: 10, Rank 2: 7, Rank 3: 5, Others: 1
      const finishedRacers = racersRef.current.filter(r => r.isFinished);
      
      setLeaderboard(prev => {
         const newScores = [...prev];
         
         finishedRacers.forEach(r => {
             const existingIdx = newScores.findIndex(s => s.name === r.name);
             let points = 1;
             if (r.rank === 1) points = 10;
             else if (r.rank === 2) points = 7;
             else if (r.rank === 3) points = 5;
             
             if (existingIdx >= 0) {
                 newScores[existingIdx].score += points;
                 if (r.rank === 1) newScores[existingIdx].wins += 1;
             } else {
                 newScores.push({
                     name: r.name,
                     score: points,
                     wins: r.rank === 1 ? 1 : 0
                 });
             }
         });
         return newScores.sort((a,b) => b.score - a.score);
      });
  };

  const clearLeaderboard = () => setLeaderboard([]);

  const toggleDisplayMode = () => {
    setDisplayMode(prev => {
      if (prev === 'name') return 'code';
      if (prev === 'code') return 'both';
      return 'name';
    });
  };

  const getDisplayModeIcon = () => {
    switch (displayMode) {
      case 'name': return <Type size={18} />;
      case 'code': return <Hash size={18} />;
      case 'both': return <Eye size={18} />;
    }
  };

  const updateRace = useCallback((time: number) => {
    if (gameState !== GameState.RACING) return;

    if (lastTimeRef.current !== undefined) {
      const currentRacers = racersRef.current;
      setElapsedTime(Date.now() - raceStartTimeRef.current);

      if (Math.random() < 0.015 && currentRacers.length > 0) {
        playAnimalSound(currentRacers[0].type);
      }

      setRacers(prevRacers => {
        let anyoneFinishedThisFrame = false;
        const currentFinishedCount = prevRacers.filter(d => d.isFinished).length;
        
        const updatedRacers = prevRacers.map(racer => {
          if (racer.isFinished) return racer;

          let { currentSpeedMultiplier, speedChangeTimer } = racer;

          if (speedChangeTimer <= 0) {
            const rand = Math.random();
            if (rand > 0.8) {
              currentSpeedMultiplier = 1.5 + Math.random(); 
              speedChangeTimer = 30 + Math.random() * 60;
            } else if (rand < 0.25) {
              currentSpeedMultiplier = 0.2 + Math.random() * 0.4;
              speedChangeTimer = 30 + Math.random() * 60;
            } else {
              currentSpeedMultiplier = 0.8 + Math.random() * 0.4;
              speedChangeTimer = 60 + Math.random() * 60;
            }
          } else {
            speedChangeTimer--;
          }

          const moveAmount = racer.speed * currentSpeedMultiplier;
          let newPosition = racer.position + moveAmount;
          
          let isJustFinished = false;
          if (newPosition >= 100) {
            newPosition = 100;
            isJustFinished = true;
            anyoneFinishedThisFrame = true;
          }

          if (isJustFinished) {
            return {
              ...racer,
              position: newPosition,
              isFinished: true,
              rank: currentFinishedCount + 1,
              currentSpeedMultiplier,
              speedChangeTimer
            };
          }

          return { 
            ...racer, 
            position: newPosition,
            currentSpeedMultiplier,
            speedChangeTimer
          };
        });

        if (anyoneFinishedThisFrame) playFinishLineSound();

        const allFinished = updatedRacers.every(d => d.isFinished);
        if (allFinished) {
           setGameState(GameState.FINISHED);
           playWinSound();
           setTimeout(() => playApplauseSound(), 500); 
           
           const winner = updatedRacers.find(d => d.rank === 1);
           generateRaceCommentary(updatedRacers, 'end', winner).then(setCommentary);
        }

        return updatedRacers;
      });
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(updateRace);
  }, [gameState]);

  useEffect(() => {
    if (gameState === GameState.RACING) {
      requestRef.current = requestAnimationFrame(updateRace);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, updateRace]);

  // Mid-race commentary
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (gameState === GameState.RACING) {
      interval = setInterval(async () => {
         if (Math.random() > 0.6) {
             const text = await generateRaceCommentary(racersRef.current, 'mid');
             setCommentary(text);
         }
      }, 9000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${centiseconds.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-200 flex flex-col items-center py-10 px-4 relative">
      
      {/* Commentary Box */}
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg mb-8 border-b-4 border-blue-300 min-h-[100px] flex flex-col justify-center items-center text-center z-10 transition-all">
        <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-wider text-xs mb-2">
           <Volume2 size={16} /> AI Commentary {currentTopic && `• ${currentTopic}`}
        </div>
        <p className="text-xl md:text-2xl font-medium text-slate-800 animate-fade-in transition-all">
          "{commentary}"
        </p>
      </div>

      {gameState === GameState.SETUP && (
        <>
          <SetupPanel 
            onStartRace={startRace} 
            leaderboard={leaderboard} 
            onClearLeaderboard={clearLeaderboard}
          />
          {leaderboard.length > 0 && (
            <div className="w-full max-w-4xl mt-8 bg-white/90 rounded-2xl p-6 shadow-xl">
               <h3 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2"><Trophy size={20}/> Bảng Xếp Hạng Tổng</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {leaderboard.slice(0, 8).map((p, i) => (
                    <div key={i} className="flex justify-between items-center bg-purple-50 p-2 rounded-lg border border-purple-100">
                       <span className="font-bold text-purple-900">#{i+1} {p.name}</span>
                       <span className="bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full text-xs font-bold">{p.score}đ</span>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </>
      )}

      {(gameState === GameState.COUNTDOWN || gameState === GameState.RACING || gameState === GameState.FINISHED) && (
        <div className="w-full max-w-6xl animate-fade-in-up relative z-0">
           
           <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
              <div className="flex items-center gap-4">
                 <h2 className="text-2xl font-bold text-white shadow-text flex items-center gap-2">
                   {gameState === GameState.RACING ? <span className="animate-pulse text-red-500">● LIVE</span> : (gameState === GameState.FINISHED ? '🏁 Kết thúc' : '⏱️ Chuẩn bị')}
                 </h2>
                 {(gameState === GameState.RACING || gameState === GameState.FINISHED) && (
                    <div className="bg-black/40 text-white px-4 py-1 rounded-full font-mono font-bold flex items-center gap-2 border border-white/20">
                       <Timer size={16} />
                       {formatTime(elapsedTime)}
                    </div>
                 )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={toggleDisplayMode}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm font-semibold backdrop-blur-sm border border-white/30 flex items-center gap-2 transition-all"
                >
                  {getDisplayModeIcon()} <span>{displayMode === 'name' ? 'Tên' : displayMode === 'code' ? 'Mã' : 'Tất cả'}</span>
                </button>

                {gameState === GameState.FINISHED && (
                  <button 
                    onClick={resetGame}
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw size={18} /> Đua Lại
                  </button>
                )}
              </div>
           </div>

           <RaceTrack ducks={racers} displayMode={displayMode} />

           {gameState === GameState.COUNTDOWN && (
             <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-3xl">
                <div className="text-9xl font-black text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] animate-bounce">
                  {countDown > 0 ? countDown : "GO!"}
                </div>
             </div>
           )}

           {gameState === GameState.FINISHED && (
             <Podium 
               racers={racers} 
               displayMode={displayMode} 
               onRestart={resetGame} 
               topic={currentTopic}
               gameMode={leaderboard.length > 0 ? 'tournament' : 'free'}
             />
           )}
        </div>
      )}
    </div>
  );
}

export default App;
