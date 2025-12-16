
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Play, Users, Check, Timer, Palette, GraduationCap, Trophy, BookOpen, Trash2, ArrowRight } from 'lucide-react';
import { parseNamesFile } from '../utils/gameUtils';
import { RacerType, RACER_ICONS, GameMode, PlayerScore } from '../types';

interface SetupPanelProps {
  onStartRace: (names: string[], type: RacerType, duration: number, randomizeColors: boolean, topic: string) => void;
  leaderboard: PlayerScore[];
  onClearLeaderboard: () => void;
}

export const SetupPanel: React.FC<SetupPanelProps> = ({ onStartRace, leaderboard, onClearLeaderboard }) => {
  // Input states
  const [waitingList, setWaitingList] = useState<string[]>([]);
  const [racingList, setRacingList] = useState<string[]>([]);
  const [inputName, setInputName] = useState('');
  
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState<RacerType>('duck');
  const [duration, setDuration] = useState<number>(10);
  const [isRandomColor, setIsRandomColor] = useState<boolean>(true);
  const [topic, setTopic] = useState<string>('');
  const [gameMode, setGameMode] = useState<GameMode>('free');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing leaderboard names if in tournament mode
  useEffect(() => {
    if (gameMode === 'tournament' && leaderboard.length > 0 && waitingList.length === 0 && racingList.length === 0) {
       setWaitingList(leaderboard.map(p => p.name));
    }
  }, [gameMode, leaderboard]);

  const handleAddToWaiting = () => {
    if (inputName.trim()) {
      setWaitingList(prev => [...prev, inputName.trim()]);
      setInputName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddToWaiting();
  };

  const moveToRacing = (name: string) => {
    setWaitingList(prev => prev.filter(n => n !== name));
    setRacingList(prev => [...prev, name]);
  };

  const moveToWaiting = (name: string) => {
    setRacingList(prev => prev.filter(n => n !== name));
    setWaitingList(prev => [...prev, name]);
  };

  const moveAllToRacing = () => {
    setRacingList(prev => [...prev, ...waitingList]);
    setWaitingList([]);
  };

  const moveAllToWaiting = () => {
    setWaitingList(prev => [...prev, ...racingList]);
    setRacingList([]);
  };

  const handleStart = () => {
    if (racingList.length < 2) {
      setError('Cần ít nhất 2 vận động viên trong danh sách ĐUA!');
      return;
    }

    if (duration <= 0) {
      setError('Vui lòng chọn thời gian đua hợp lệ!');
      return;
    }

    setError('');
    onStartRace(racingList, selectedType, duration, isRandomColor, topic);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const names = await parseNamesFile(file);
        // Add to waiting list
        setWaitingList(prev => [...prev, ...names]);
        setError('');
      } catch (err) {
        setError('Lỗi khi đọc file. Hãy dùng file .txt hoặc .csv');
      }
    }
  };

  const PRESET_DURATIONS = [5, 10, 15, 20, 30];

  return (
    <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl p-6 md:p-8 transform transition-all border-4 border-blue-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-gray-100 pb-6">
        <div>
           <h1 className="text-4xl font-black text-sky-600 mb-1 flex items-center gap-2">
             <GraduationCap className="text-sky-500" size={40} />
             Animal Run: Edu
           </h1>
           <p className="text-gray-500 font-medium ml-1">Công cụ Gamification cho lớp học</p>
        </div>

        {/* Game Mode Selector */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
           <button 
             onClick={() => setGameMode('free')}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${gameMode === 'free' ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
           >
             Tự Do
           </button>
           <button 
             onClick={() => setGameMode('elimination')}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1 ${gameMode === 'elimination' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
           >
             <Check size={14} /> Trả lời để Đua
           </button>
           <button 
             onClick={() => setGameMode('tournament')}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1 ${gameMode === 'tournament' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
           >
             <Trophy size={14} /> Tích Điểm
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Student Management (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
           
           <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100 h-full flex flex-col">
              <h3 className="text-sky-800 font-bold mb-3 flex items-center gap-2">
                 <Users size={18} /> Danh sách lớp / Chờ ({waitingList.length})
              </h3>
              
              {/* Input Area */}
              <div className="flex gap-2 mb-3">
                 <input 
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tên HS..."
                    className="flex-1 border border-sky-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-400 outline-none"
                 />
                 <input
                    type="file"
                    accept=".txt,.csv"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                 <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-white text-sky-600 border border-sky-200 rounded-lg hover:bg-sky-100" title="Upload File">
                    <Upload size={18} />
                 </button>
                 <button onClick={handleAddToWaiting} className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600">
                    +
                 </button>
              </div>

              {/* Waiting List Area */}
              <div className="flex-1 bg-white rounded-xl border border-sky-100 p-2 overflow-y-auto max-h-[300px] min-h-[200px] shadow-inner">
                 {waitingList.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm italic p-4 text-center">
                       Nhập tên hoặc tải danh sách lớp.<br/>
                       {gameMode === 'elimination' && "Học sinh trả lời đúng sẽ được chọn sang bên phải."}
                    </div>
                 ) : (
                    <div className="flex flex-wrap gap-2">
                       {waitingList.map((name, i) => (
                          <button 
                            key={i} 
                            onClick={() => moveToRacing(name)}
                            className="bg-gray-100 hover:bg-green-100 hover:text-green-700 hover:border-green-300 text-gray-700 text-sm px-3 py-1.5 rounded-lg border border-gray-200 transition-all flex items-center gap-1 group"
                          >
                             {name} <ArrowRight size={12} className="opacity-0 group-hover:opacity-100" />
                          </button>
                       ))}
                    </div>
                 )}
              </div>
              
              <div className="mt-2 flex justify-between">
                 <button onClick={() => setWaitingList([])} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                    <Trash2 size={12} /> Xóa hết
                 </button>
                 <button onClick={moveAllToRacing} className="text-xs text-sky-600 hover:text-sky-800 font-bold">
                    Chọn tất cả &gt;&gt;
                 </button>
              </div>
           </div>
        </div>

        {/* MIDDLE COLUMN: Selection / Racing List (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
           <div className="bg-green-50 rounded-2xl p-4 border border-green-100 h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                 <Play size={100} className="text-green-500" />
              </div>

              <h3 className="text-green-800 font-bold mb-3 flex items-center gap-2">
                 <Play size={18} className="fill-green-700" /> Sẵn Sàng Đua ({racingList.length})
              </h3>
              
              {/* Racing List Area */}
              <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-green-200 border-dashed p-2 overflow-y-auto max-h-[350px] min-h-[240px]">
                 {racingList.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                       Chưa có vận động viên nào.<br/>Nhấp vào tên bên trái để thêm!
                    </div>
                 ) : (
                    <div className="space-y-2">
                       {racingList.map((name, i) => (
                          <div key={i} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg shadow-sm border border-green-100 animate-pop-in">
                             <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-green-600 bg-green-100 px-1.5 rounded">{i+1}</span>
                                <span className="font-bold text-gray-700">{name}</span>
                             </div>
                             <button onClick={() => moveToWaiting(name)} className="text-gray-400 hover:text-red-500">
                                <Trash2 size={14} />
                             </button>
                          </div>
                       ))}
                    </div>
                 )}
              </div>

              <div className="mt-2 flex justify-between">
                 <button onClick={moveAllToWaiting} className="text-xs text-orange-500 hover:text-orange-700 font-bold">
                    &lt;&lt; Bỏ chọn tất cả
                 </button>
                 <span className="text-xs text-green-600 font-medium">
                    {gameMode === 'elimination' ? 'Chỉ những HS này được đua' : 'Đội hình ra sân'}
                 </span>
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: Config & Start (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          
          {/* Topic Input */}
          <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
             <label className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                <BookOpen size={14} /> Chủ đề / Câu hỏi
             </label>
             <input 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="VD: Bảng cửu chương 5..."
                className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-300 outline-none"
             />
          </div>

          {/* Animal Selector */}
          <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
             <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Nhân vật</label>
             <div className="grid grid-cols-3 gap-2">
              {(Object.keys(RACER_ICONS) as RacerType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`
                    p-2 rounded-lg border text-xl transition-all
                    ${selectedType === type ? 'bg-sky-100 border-sky-400 scale-110' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}
                  `}
                >
                  {RACER_ICONS[type]}
                </button>
              ))}
             </div>
          </div>

          {/* Duration & Color */}
          <div className="flex gap-2">
             <div className="flex-1 bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Timer size={12}/> Giây</label>
                 <select 
                    value={duration} 
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-1 text-sm font-bold"
                 >
                    {PRESET_DURATIONS.map(d => <option key={d} value={d}>{d}s</option>)}
                 </select>
             </div>
             <button 
                onClick={() => setIsRandomColor(!isRandomColor)}
                className={`flex-1 rounded-xl p-3 border shadow-sm flex flex-col items-center justify-center gap-1 transition-all ${isRandomColor ? 'bg-gradient-to-br from-pink-100 to-purple-100 border-purple-200' : 'bg-gray-50 border-gray-200'}`}
             >
                <Palette size={16} className={isRandomColor ? 'text-purple-600' : 'text-gray-400'} />
                <span className="text-[10px] font-bold text-gray-600">Màu</span>
             </button>
          </div>

          {error && <div className="text-xs text-red-500 font-bold text-center animate-pulse">{error}</div>}

          <button
            onClick={handleStart}
            className="mt-auto w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-lg font-black py-4 rounded-xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            BẮT ĐẦU ĐUA! <Play size={20} fill="currentColor" />
          </button>
        </div>

      </div>
    </div>
  );
};
