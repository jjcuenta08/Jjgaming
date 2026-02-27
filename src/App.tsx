/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sword, 
  Shield, 
  Trophy, 
  User, 
  Cpu, 
  Zap, 
  Target, 
  ChevronRight,
  RefreshCw,
  Settings,
  XCircle,
  Award
} from 'lucide-react';
import { 
  Difficulty, 
  GameMode, 
  Rank, 
  WordData, 
  PlayerState, 
  RANKS, 
  getRank,
  getNextRankInfo,
  ACHIEVEMENTS,
  AchievementId,
  BOT_SPEEDS 
} from './types';
import { WORD_LIST } from './constants';

const INITIAL_HEALTH = 100;
const XP_PER_WIN = 50;

export default function App() {
  const [mode, setMode] = useState<GameMode>('MENU');
  const [difficulty, setDifficulty] = useState<Difficulty>('Recruit');
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [totalWordsSolved, setTotalWordsSolved] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<AchievementId[]>([]);
  const [score, setScore] = useState(0);
  const [p1, setP1] = useState<PlayerState>({ health: INITIAL_HEALTH, xp: 0, rank: 'Private', currentInput: '' });
  const [p2, setP2] = useState<PlayerState>({ health: INITIAL_HEALTH, xp: 0, rank: 'Private', currentInput: '' });
  const [currentWord, setCurrentWord] = useState<WordData | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [feedback, setFeedback] = useState<{ p1?: string; p2?: string }>({});
  const [roundActive, setRoundActive] = useState(false);
  const [matchStats, setMatchStats] = useState({
    missedLetters: false,
    streak: 0,
    levelsPlayed: new Set<number>()
  });
  const [stats, setStats] = useState({
    totalAttempts: 0,
    correctAttempts: 0,
    fastestReaction: Infinity,
    wordsCaptured: 0,
    startTime: 0
  });

  const botTimerRef = useRef<NodeJS.Timeout | null>(null);

  const generateWord = useCallback((lvl: number) => {
    const words = WORD_LIST[lvl];
    const newWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(newWord);
    setP1(prev => ({ ...prev, currentInput: '' }));
    setP2(prev => ({ ...prev, currentInput: '' }));
    setFeedback({});
    setRoundActive(true);
    setMatchStats(prev => ({ ...prev, levelsPlayed: new Set(prev.levelsPlayed).add(lvl) }));
    setStats(prev => ({ ...prev, startTime: Date.now() }));
  }, []);

  const startSoloGame = (diff: Difficulty) => {
    setDifficulty(diff);
    setMode('SOLO');
    setP1({ health: INITIAL_HEALTH, xp, rank: getRank(totalWordsSolved), currentInput: '' });
    setP2({ health: INITIAL_HEALTH, xp: 0, rank: 'Recruit', currentInput: '' });
    setWinner(null);
    setScore(0);
    setLevel(1);
    setMatchStats({
      missedLetters: false,
      streak: 0,
      levelsPlayed: new Set([1])
    });
    setStats({
      totalAttempts: 0,
      correctAttempts: 0,
      fastestReaction: Infinity,
      wordsCaptured: 0,
      startTime: Date.now()
    });
    generateWord(1);
  };

  const startVersusGame = () => {
    setMode('VERSUS');
    setP1({ health: INITIAL_HEALTH, xp, rank: getRank(totalWordsSolved), currentInput: '' });
    setP2({ health: INITIAL_HEALTH, xp: 0, rank: 'Recruit', currentInput: '' });
    setWinner(null);
    setScore(0);
    setLevel(1);
    setMatchStats({
      missedLetters: false,
      streak: 0,
      levelsPlayed: new Set([1])
    });
    setStats({
      totalAttempts: 0,
      correctAttempts: 0,
      fastestReaction: Infinity,
      wordsCaptured: 0,
      startTime: Date.now()
    });
    generateWord(1);
  };

  const unlockAchievement = (id: AchievementId) => {
    setUnlockedAchievements(prev => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  };

  const handleWin = (player: 'p1' | 'p2') => {
    setRoundActive(false);
    if (player === 'p1') {
      const newXp = xp + XP_PER_WIN;
      setXp(newXp);
      setTotalWordsSolved(prev => prev + stats.wordsCaptured);
      setP1(prev => ({ ...prev, health: INITIAL_HEALTH, xp: newXp, rank: getRank(totalWordsSolved + stats.wordsCaptured) }));
      setWinner('PLAYER 1');

      // Check Achievements
      if (!matchStats.missedLetters) unlockAchievement('IRON_DEFENSE');
      if (p1.health <= 5) unlockAchievement('CLOSE_CALL');
      if (mode === 'SOLO' && difficulty === 'General') unlockAchievement('BOT_BUSTER');
      if (matchStats.levelsPlayed.has(1) && matchStats.levelsPlayed.has(2) && matchStats.levelsPlayed.has(3)) unlockAchievement('THE_SCHOLAR');
    } else {
      setWinner(mode === 'SOLO' ? 'BOT' : 'PLAYER 2');
    }
    
    if (botTimerRef.current) clearTimeout(botTimerRef.current);
  };

  const checkInput = (input: string, player: 'p1' | 'p2') => {
    if (!currentWord || winner || !roundActive) return;

    const missingLetters = currentWord.blanks.map(i => currentWord.word[i]).join('');
    
    if (input.toUpperCase() === missingLetters) {
      setRoundActive(false); // First-Strike Logic: Lock out others
      
      const reactionTime = (Date.now() - stats.startTime) / 1000;
      
      // Check Flash Strike
      if (player === 'p1' && currentWord.word.length >= 5 && reactionTime < 1) {
        unlockAchievement('FLASH_STRIKE');
      }

      setStats(prev => ({
        ...prev,
        correctAttempts: prev.correctAttempts + 1,
        totalAttempts: prev.totalAttempts + 1,
        wordsCaptured: prev.wordsCaptured + 1,
        fastestReaction: Math.min(prev.fastestReaction, reactionTime)
      }));

      const damage = Math.floor(Math.random() * 11) + 10; // 10-20 damage
      
      if (player === 'p1') {
        setMatchStats(prev => {
          const newStreak = prev.streak + 1;
          if (mode === 'SOLO' && difficulty === 'General' && newStreak >= 10) {
            unlockAchievement('ON_A_ROLL');
          }
          return { ...prev, streak: newStreak };
        });
        setScore(s => s + 10);
        setP2(prev => {
          const newHealth = prev.health - damage;
          if (newHealth <= 0) handleWin('p1');
          return { ...prev, health: Math.max(0, newHealth) };
        });
        setFeedback({ p1: 'DIRECT HIT!' });
      } else {
        if (player === 'p2' && mode === 'SOLO') {
          setMatchStats(prev => ({ ...prev, streak: 0 }));
        }
        setP1(prev => {
          const newHealth = prev.health - damage;
          if (newHealth <= 0) handleWin('p2');
          return { ...prev, health: Math.max(0, newHealth) };
        });
        setFeedback({ p2: 'DIRECT HIT!' });
      }
      
      // Next word if no winner yet
      if (p1.health > 0 && p2.health > 0) {
        setTimeout(() => {
          const nextLevel = Math.min(3, level + (Math.random() > 0.7 ? 1 : 0));
          setLevel(nextLevel);
          generateWord(nextLevel);
        }, 800);
      }
    } else if (input.length >= missingLetters.length) {
      // Wrong input: Take 5-10 damage
      setStats(prev => ({ ...prev, totalAttempts: prev.totalAttempts + 1 }));
      if (player === 'p1') {
        setMatchStats(prev => ({ ...prev, missedLetters: true, streak: 0 }));
      }
      const selfDamage = Math.floor(Math.random() * 6) + 5;
      if (player === 'p1') {
        setP1(prev => ({ ...prev, health: Math.max(0, prev.health - selfDamage), currentInput: '' }));
        setFeedback({ p1: 'MISFIRE!' });
      } else {
        setP2(prev => ({ ...prev, health: Math.max(0, prev.health - selfDamage), currentInput: '' }));
        setFeedback({ p2: 'MISFIRE!' });
      }
    }
  };

  // Bot Logic
  useEffect(() => {
    if (mode === 'SOLO' && currentWord && !winner && !isPaused && roundActive) {
      const speed = BOT_SPEEDS[difficulty];
      const variance = Math.random() * 400 - 200;
      botTimerRef.current = setTimeout(() => {
        const missingLetters = currentWord.blanks.map(i => currentWord.word[i]).join('');
        checkInput(missingLetters, 'p2');
      }, speed + variance);
    }
    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, [currentWord, mode, difficulty, winner, isPaused, roundActive]);

  // Keyboard Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === 'MENU' || winner || isPaused || !roundActive) return;

      const char = e.key.toUpperCase();
      if (/^[A-Z]$/.test(char)) {
        setP1(prev => {
          const newInput = prev.currentInput + char;
          checkInput(newInput, 'p1');
          return { ...prev, currentInput: newInput };
        });
      } else if (e.key === 'Backspace') {
        setP1(prev => ({ ...prev, currentInput: prev.currentInput.slice(0, -1) }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, winner, isPaused, currentWord, roundActive]);

  const HealthBar = ({ health, label, color }: { health: number, label: string, color: string }) => (
    <div className="w-full">
      <div className="flex justify-between items-end mb-1">
        <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">{label}</span>
        <span className="text-xs font-mono font-bold" style={{ color }}>{health}%</span>
      </div>
      <div className="h-2 bg-black/40 border border-white/10 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: '100%' }}
          animate={{ width: `${health}%` }}
          className="h-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );

  if (mode === 'MENU') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 scanline relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,255,65,0.05)_0%,_transparent_70%)]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full tactical-panel p-8 rounded-2xl relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <div className="flex flex-col justify-center">
            <div className="text-center md:text-left mb-8">
              <motion.div
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="inline-block mb-4"
              >
                <Sword className="w-12 h-12 text-[#00ff41]" />
              </motion.div>
              <h1 className="text-4xl font-bold tracking-tighter glitch-text mb-2 uppercase">Word War</h1>
              <p className="text-xs font-mono uppercase tracking-[0.3em] opacity-50 mb-4">Battle of the Blanks</p>
              
              <div className="flex gap-2 mb-6">
                <span className="px-2 py-1 rounded bg-[#00ff41]/20 border border-[#00ff41]/40 text-[#00ff41] text-[8px] font-bold uppercase tracking-wider">
                  Free to Play
                </span>
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white/40 text-[8px] font-bold uppercase tracking-wider">
                  No Microtransactions
                </span>
              </div>
              
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl mb-6">
                <p className="text-sm leading-relaxed text-white/70 italic">
                  "Welcome to the Frontline, Recruit! In Word War, your vocabulary is your weapon. Type fast, stay sharp, and dominate the dictionary. Are you ready for battle?"
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => startSoloGame('Recruit')}
                  className="group flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-[#00ff41]/10 hover:border-[#00ff41]/50 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <Cpu className="w-4 h-4 text-[#00ff41]" />
                    <span className="font-bold text-sm">SOLO: RECRUIT (5s)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                </button>
                <button 
                  onClick={() => startSoloGame('Soldier')}
                  className="group flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-[#00ff41]/10 hover:border-[#00ff41]/50 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-[#00ff41]" />
                    <span className="font-bold text-sm">SOLO: SOLDIER (3s)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                </button>
                <button 
                  onClick={() => startSoloGame('General')}
                  className="group flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-[#00ff41]/10 hover:border-[#00ff41]/50 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <Target className="w-4 h-4 text-[#00ff41]" />
                    <span className="font-bold text-sm">SOLO: GENERAL (1.5s)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                </button>
                <button 
                  onClick={startVersusGame}
                  className="group flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-[#ff3e3e]/10 hover:border-[#ff3e3e]/50 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-[#ff3e3e]" />
                    <span className="font-bold text-sm">VERSUS: LOCAL WAR</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                </button>
              </div>
            </div>
          </div>

          <div className="border-l border-white/10 pl-8 hidden md:block">
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] opacity-40 mb-4">Mission Intel</h3>
            <ul className="space-y-4 text-xs text-white/60">
              <li className="flex gap-3">
                <span className="text-[#00ff41] font-bold">01.</span>
                <span>Read the Hint provided at the top.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#00ff41] font-bold">02.</span>
                <span>Identify the missing letters in the word below.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#00ff41] font-bold">03.</span>
                <span>Type the correct letter before your opponent does.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#00ff41] font-bold">04.</span>
                <span>Every correct strike damages the enemy. Every mistake damages YOU.</span>
              </li>
            </ul>

            <div className="mt-10 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase opacity-50">Current Rank: {getRank(totalWordsSolved)}</span>
                <span className="text-[10px] font-mono opacity-50">{totalWordsSolved} Words Solved</span>
              </div>
              {getNextRankInfo(totalWordsSolved).nextRank && (
                <div className="text-[10px] font-mono opacity-40 mb-2 italic">
                  (Next Rank: {getNextRankInfo(totalWordsSolved).nextRank} - {totalWordsSolved}/{getNextRankInfo(totalWordsSolved).required} words to go!)
                </div>
              )}
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#00ff41]/50" 
                  style={{ width: `${(totalWordsSolved / (getNextRankInfo(totalWordsSolved).required || totalWordsSolved)) * 100}%` }} 
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col scanline relative overflow-hidden bg-[#0a0a0c]">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#00ff41 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} 
      />

      {/* Header Info */}
      <div className="p-6 flex justify-between items-start relative z-10">
        <div className="flex gap-8">
          <div className="w-48">
            <HealthBar health={p1.health} label="Player 1" color="#00ff41" />
            <div className="mt-2 flex justify-between items-center text-[10px] font-mono opacity-40 uppercase tracking-widest">
              <span>Rank: {p1.rank}</span>
              <span className="text-[#00ff41]">Score: {score}</span>
            </div>
          </div>
          {mode === 'VERSUS' && (
            <div className="w-48">
              <HealthBar health={p2.health} label="Player 2" color="#ff3e3e" />
              <div className="mt-2 text-[10px] font-mono opacity-40 uppercase tracking-widest">
                Rank: {p2.rank}
              </div>
            </div>
          )}
          {mode === 'SOLO' && (
            <div className="w-48">
              <HealthBar health={p2.health} label={`Bot (${difficulty})`} color="#ff3e3e" />
              <div className="mt-2 text-[10px] font-mono opacity-40 uppercase tracking-widest">
                System Status: Active
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button onClick={() => setIsPaused(!isPaused)} className="p-2 rounded-lg border border-white/10 hover:bg-white/5">
            <Settings className="w-5 h-5 opacity-50" />
          </button>
          <button onClick={() => setMode('MENU')} className="p-2 rounded-lg border border-white/10 hover:bg-white/5">
            <XCircle className="w-5 h-5 opacity-50" />
          </button>
        </div>
      </div>

      {/* Main Combat Arena */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <AnimatePresence mode="wait">
          {!winner ? (
            <motion.div 
              key="game"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="w-full max-w-2xl text-center"
            >
              <div className="mb-4">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-[0.3em] opacity-50">
                  Level {level} Objective
                </span>
              </div>
              
              <h2 className="text-2xl font-bold mb-12 text-white/80 tracking-tight">
                {currentWord?.hint}
              </h2>

              <div className="flex justify-center gap-4 mb-16">
                {currentWord?.word.split('').map((char, idx) => {
                  const isBlank = currentWord.blanks.includes(idx);
                  const blankIdx = currentWord.blanks.indexOf(idx);
                  const filledChar = p1.currentInput[blankIdx];

                  return (
                    <div 
                      key={idx}
                      className={`
                        w-16 h-20 rounded-xl border-2 flex items-center justify-center text-4xl font-bold
                        ${isBlank 
                          ? filledChar 
                            ? 'border-[#00ff41] text-[#00ff41] bg-[#00ff41]/5 shadow-[0_0_15px_rgba(0,255,65,0.2)]' 
                            : 'border-white/20 bg-white/5 animate-pulse' 
                          : 'border-transparent text-white/30'
                        }
                      `}
                    >
                      {isBlank ? filledChar || '' : char}
                    </div>
                  );
                })}
              </div>

              {/* Feedback Overlay */}
              <div className="h-8 flex justify-center items-center mb-8">
                <AnimatePresence>
                  {feedback.p1 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[#00ff41] font-mono text-sm font-bold tracking-widest"
                    >
                      {feedback.p1}
                    </motion.div>
                  )}
                  {feedback.p2 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[#ff3e3e] font-mono text-sm font-bold tracking-widest"
                    >
                      {feedback.p2}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Virtual Keyboard */}
              <div className="max-w-xl mx-auto grid grid-cols-7 md:grid-cols-9 gap-2">
                {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((char) => (
                  <button
                    key={char}
                    onClick={() => {
                      if (!roundActive || winner) return;
                      setP1(prev => {
                        const newInput = prev.currentInput + char;
                        checkInput(newInput, 'p1');
                        return { ...prev, currentInput: newInput };
                      });
                    }}
                    className="h-10 rounded-lg border border-white/10 bg-white/5 hover:bg-[#00ff41]/20 hover:border-[#00ff41]/50 hover:text-[#00ff41] transition-all font-mono font-bold text-sm flex items-center justify-center active:scale-90"
                  >
                    {char}
                  </button>
                ))}
                <button
                  onClick={() => setP1(prev => ({ ...prev, currentInput: prev.currentInput.slice(0, -1) }))}
                  className="h-10 col-span-2 rounded-lg border border-white/10 bg-white/5 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-500 transition-all font-mono font-bold text-[10px] uppercase flex items-center justify-center active:scale-90"
                >
                  DEL
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="winner"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center tactical-panel p-12 rounded-3xl border-2 border-[#00ff41]/30 max-w-lg w-full"
            >
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xs font-mono uppercase tracking-[0.5em] opacity-50 mb-2">
                {winner === 'PLAYER 1' ? 'Mission Accomplished' : 'Defeated'}
              </h3>
              <h2 className="text-5xl font-bold glitch-text mb-8">{winner} WINS</h2>
              
              <div className="grid grid-cols-1 gap-4 mb-10 text-left bg-black/40 p-6 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[10px] font-mono uppercase opacity-50">Accuracy</span>
                  <span className="text-sm font-bold text-[#00ff41]">
                    {stats.totalAttempts > 0 ? Math.round((stats.correctAttempts / stats.totalAttempts) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[10px] font-mono uppercase opacity-50">Fastest Reaction</span>
                  <span className="text-sm font-bold text-[#00ff41]">
                    {stats.fastestReaction === Infinity ? '0.00' : stats.fastestReaction.toFixed(2)}s
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[10px] font-mono uppercase opacity-50">Words Captured</span>
                  <span className="text-sm font-bold text-[#00ff41]">{stats.wordsCaptured}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono uppercase opacity-50">Final Score</span>
                  <span className="text-sm font-bold text-[#00ff41]">{score}</span>
                </div>
              </div>

              {unlockedAchievements.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-[10px] font-mono uppercase tracking-widest opacity-40 mb-4 text-left">Medals Earned</h4>
                  <div className="flex flex-wrap gap-2">
                    {unlockedAchievements.map(id => {
                      const achievement = ACHIEVEMENTS.find(a => a.id === id);
                      return (
                        <div key={id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#00ff41]/10 border border-[#00ff41]/30 text-[#00ff41]">
                          <span className="text-lg">{achievement?.icon}</span>
                          <div className="text-left">
                            <div className="text-[10px] font-bold leading-none">{achievement?.title}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => mode === 'SOLO' ? startSoloGame(difficulty) : startVersusGame()}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#00ff41] text-black font-bold hover:scale-[1.02] transition-transform"
                >
                  <RefreshCw className="w-4 h-4" />
                  RE-DEPLOY
                </button>
                <button 
                  onClick={() => setMode('MENU')}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-white/20 hover:bg-white/5 transition-colors"
                >
                  BASE CAMP
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer / Controls Info */}
      <div className="p-8 border-t border-white/5 bg-black/20 relative z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center text-[10px] font-mono uppercase tracking-widest opacity-40">
          <div className="flex gap-6">
            <span>Mission: Word War</span>
            <span>Sector: {level === 1 ? 'Recruit' : level === 2 ? 'Soldier' : 'Boss'}</span>
          </div>
          <div className="flex gap-6">
            <span>Input: Keyboard Detected</span>
            <span>Latency: 0.02ms</span>
          </div>
        </div>
      </div>

      {/* Pause Menu Overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <div className="max-w-sm w-full tactical-panel p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Settings className="w-6 h-6 text-[#00ff41]" />
                PAUSE MENU
              </h2>
              <div className="space-y-4">
                <button 
                  onClick={() => setIsPaused(false)}
                  className="w-full p-4 rounded-xl bg-[#00ff41] text-black font-bold"
                >
                  RESUME MISSION
                </button>
                <button 
                  onClick={() => setMode('MENU')}
                  className="w-full p-4 rounded-xl border border-white/10 hover:bg-white/5"
                >
                  ABANDON MISSION
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
