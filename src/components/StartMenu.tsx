/**
 * VOID ECHO - Title & Start Menu
 */

import React, { useState, useEffect } from 'react';
import { Play, Users, BookOpen, Shield, Trophy, Settings, Sparkles, Flame, Zap } from 'lucide-react';
import { GameDifficulty } from '../types/game';
import { AVATAR_REGISTRY } from '../services/avatarDefinitions';
import { storageService } from '../services/storage';
import { soundEngine } from '../services/soundEngine';

interface StartMenuProps {
  onStartSolo: (difficulty: GameDifficulty) => void;
  onOpenMultiplayer: () => void;
  onOpenTutorial: () => void;
  onOpenArmory: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  onStartSolo,
  onOpenMultiplayer,
  onOpenTutorial,
  onOpenArmory,
  onOpenLeaderboard,
  onOpenSettings,
}) => {
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');
  const [stats, setStats] = useState(storageService.getStats());
  const [customization, setCustomization] = useState(storageService.getCustomization());

  useEffect(() => {
    setStats(storageService.getStats());
    setCustomization(storageService.getCustomization());
  }, []);

  const currentAvatar = AVATAR_REGISTRY[customization.avatarId];

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center p-6 bg-slate-950 overflow-hidden select-none">
      {/* Background Cyber Grid & Vignette */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#0ea5e915_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e915_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent via-slate-950/60 to-black" />

      {/* Top Bar Zone: Operative Status & Shards */}
      <header className="w-full max-w-5xl flex items-center justify-between z-10 pt-2">
        <div className="flex items-center gap-2">
          <span className="font-orbitron font-bold text-sm tracking-wider text-cyan-400">
            SYS//NODE.01
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-xs text-slate-400 font-chakra">QUANTUM ARENA</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Operative Info */}
          <div
            onClick={onOpenArmory}
            className="flex items-center gap-3 bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-400 px-3.5 py-1.5 rounded-xl cursor-pointer transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)]"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center border text-xs"
              style={{
                borderColor: customization.primaryColor,
                backgroundColor: `${customization.primaryColor}20`,
                color: customization.primaryColor,
              }}
            >
              ★
            </div>
            <div>
              <div className="text-xs font-orbitron font-bold text-white flex items-center gap-1.5">
                <span>{currentAvatar.name}</span>
                <span className="text-[10px] text-cyan-400 font-normal">LVL {stats.level}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-chakra">
                💎 {stats.voidShards} Void Shards
              </div>
            </div>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onOpenSettings();
            }}
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Title Section */}
      <div className="z-10 flex flex-col items-center text-center my-auto max-w-2xl px-4">
        {/* Glow Title */}
        <h1 className="text-5xl sm:text-7xl font-orbitron font-black tracking-tight text-white mb-2 glow-cyan">
          VOID ECHO
        </h1>
        <p className="text-sm sm:text-base font-chakra tracking-widest text-cyan-400 uppercase font-semibold mb-6">
          HUNT YOUR SHADOW // 5-SECOND RESONANCE ARENA
        </p>

        {/* Core Mechanic Callout */}
        <div className="bg-slate-900/70 border border-cyan-500/30 rounded-2xl p-4 mb-8 backdrop-blur-md max-w-xl text-xs sm:text-sm text-slate-300 leading-relaxed shadow-[0_0_25px_rgba(6,182,212,0.1)]">
          <span className="text-cyan-300 font-orbitron font-bold">CORE PROTOCOL:</span> Shadow enemies cannot see you directly. They relentlessly hunt the{' '}
          <span className="text-rose-400 font-bold">5-second Echo Trail</span> left behind by your movement. Break the line, forge barrier walls, and deploy decoy flares to survive.
        </div>

        {/* Difficulty Selection */}
        <div className="w-full max-w-md mb-6">
          <div className="text-xs font-orbitron text-slate-400 mb-2 uppercase tracking-wider">
            Select Difficulty
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'slow', name: 'SLOW', tag: '6.5s Trail • Chill' },
              { id: 'medium', name: 'MEDIUM', tag: '5.0s Trail • Tactical' },
              { id: 'fast', name: 'FAST', tag: '3.5s Trail • Overdrive' },
            ].map(d => (
              <button
                key={d.id}
                onClick={() => {
                  soundEngine.playUiClick();
                  setDifficulty(d.id as GameDifficulty);
                }}
                className={`py-2 px-3 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  difficulty === d.id
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-xs font-orbitron font-bold">{d.name}</span>
                <span className="text-[9px] text-slate-400 font-chakra mt-0.5">{d.tag}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Primary Play Button */}
        <button
          onClick={() => {
            soundEngine.playUiClick();
            onStartSolo(difficulty);
          }}
          className="w-full max-w-md py-4 bg-cyan-500 hover:bg-cyan-400 active:scale-98 text-slate-950 font-orbitron font-black text-lg rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all cursor-pointer mb-3"
        >
          <Play className="w-6 h-6 fill-current" />
          <span>ENTER THE VOID (SOLO)</span>
        </button>

        {/* Secondary Mode Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onOpenMultiplayer();
            }}
            className="py-3 px-4 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-rose-400 text-slate-200 font-orbitron text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Users className="w-4 h-4 text-rose-400" />
            <span>HUNTER VS RUNNER</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              onOpenTutorial();
            }}
            className="py-3 px-4 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-200 font-orbitron text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>HOW TO PLAY</span>
          </button>
        </div>
      </div>

      {/* Footer Navigation Bar */}
      <footer className="w-full max-w-5xl flex items-center justify-between border-t border-slate-900 pt-4 z-10 text-xs text-slate-500 font-orbitron">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onOpenArmory();
            }}
            className="hover:text-cyan-400 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Shield className="w-4 h-4" />
            <span>AVATAR ARMORY</span>
          </button>
          <span>·</span>
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onOpenLeaderboard();
            }}
            className="hover:text-cyan-400 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            <span>LEADERBOARDS</span>
          </button>
        </div>

        <div className="text-slate-600 font-chakra text-[11px] hidden sm:block">
          HTML5 CANVAS // 60FPS VECTOR ACCELERATED
        </div>
      </footer>
    </div>
  );
};
