/**
 * VOID ECHO - Heads Up Display (HUD)
 */

import React from 'react';
import { Pause, Play, ShieldAlert, Zap, Flame, Sparkles } from 'lucide-react';
import { AuraState } from '../types/game';
import { soundEngine } from '../services/soundEngine';

interface GameHUDProps {
  score: number;
  combo: number;
  multiplier: number;
  secondsRemaining: number;
  isSuddenDeath: boolean;
  isPaused: boolean;
  onTogglePause: () => void;
  burstCooldownPct: number;
  flareCooldownPct: number;
  aura: AuraState;
  onAbility: (type: 'burst' | 'flare') => void;
  isMobileTouch: boolean;
  onToggleTouchControls: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  combo,
  multiplier,
  secondsRemaining,
  isSuddenDeath,
  isPaused,
  onTogglePause,
  burstCooldownPct,
  flareCooldownPct,
  aura,
  onAbility,
  isMobileTouch,
  onToggleTouchControls,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none p-4 flex flex-col justify-between z-10">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-4">
        {/* Left Zone: Score & Multiplier */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950/80 border border-cyan-500/40 rounded-lg px-4 py-2 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <div className="text-[10px] text-cyan-400 font-orbitron tracking-wider uppercase">
              Score
            </div>
            <div className="text-2xl font-orbitron font-black text-white glow-cyan tracking-wider">
              {score.toLocaleString()}
            </div>
          </div>

          {/* Combo Multiplier Meter */}
          <div
            className={`border rounded-lg px-3 py-2 backdrop-blur-md transition-all ${
              combo > 1
                ? 'bg-rose-950/70 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Flame
                className={`w-4 h-4 ${combo > 1 ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`}
              />
              <span className="text-xs font-orbitron text-slate-300">COMBO</span>
            </div>
            <div className="text-xl font-orbitron font-bold text-rose-400">
              {multiplier}x
            </div>
          </div>
        </div>

        {/* Center Zone: Timer & Sudden Death Alert */}
        <div className="flex flex-col items-center">
          <div
            className={`px-5 py-2 rounded-lg border backdrop-blur-md flex items-center gap-2 ${
              isSuddenDeath
                ? 'bg-rose-950/90 border-rose-500 animate-pulse shadow-[0_0_25px_rgba(244,63,94,0.7)]'
                : 'bg-slate-950/80 border-slate-800 shadow-md'
            }`}
          >
            {isSuddenDeath && (
              <span className="text-xs font-orbitron font-bold text-rose-400 tracking-widest animate-bounce">
                SUDDEN DEATH
              </span>
            )}
            <span
              className={`font-orbitron font-bold tracking-wider ${
                isSuddenDeath ? 'text-xl text-rose-300' : 'text-lg text-slate-200'
              }`}
            >
              {secondsRemaining > 0 ? formatTime(secondsRemaining) : 'ENDLESS'}
            </span>
          </div>

          {/* Active Aura State Tag */}
          {aura !== 'neutral' && (
            <div className="mt-1 flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-orbitron font-bold tracking-wider shadow-sm animate-pulse bg-cyan-950/80 border border-cyan-400 text-cyan-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {aura === 'frenzy_overdrive' && 'FRENZY OVERDRIVE 8X'}
                {aura === 'speed_surge' && 'SPEED SURGE'}
                {aura === 'zen_ghost' && 'ZEN GHOST SHIELD'}
              </span>
            </div>
          )}
        </div>

        {/* Right Zone: Controls & Pause */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Mobile Joystick Toggle */}
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onToggleTouchControls();
            }}
            className={`px-3 py-2 text-xs font-orbitron rounded-lg border transition-colors ${
              isMobileTouch
                ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle Virtual Touch Controls"
          >
            {isMobileTouch ? 'Touch On' : 'Touch Off'}
          </button>

          {/* Pause Button */}
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onTogglePause();
            }}
            className="w-10 h-10 rounded-lg bg-slate-900/80 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white flex items-center justify-center transition-colors backdrop-blur-md"
            title="Pause Match"
          >
            {isPaused ? <Play className="w-5 h-5 text-cyan-400" /> : <Pause className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Bottom Center: Desktop Ability Hotbar (hidden when touch buttons are active to reduce clutter) */}
      {!isMobileTouch && (
        <div className="flex justify-center items-center gap-6 pb-2 pointer-events-auto">
          {/* Echo Burst Ability Card */}
          <div
            onClick={() => {
              if (burstCooldownPct >= 1) onAbility('burst');
            }}
            className={`cursor-pointer px-4 py-2.5 rounded-xl border flex items-center gap-3 backdrop-blur-md transition-all ${
              burstCooldownPct >= 1
                ? 'bg-slate-950/85 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95'
                : 'bg-slate-950/50 border-slate-800 opacity-60'
            }`}
          >
            <div className="relative w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/50 flex items-center justify-center text-cyan-300">
              <ShieldAlert className="w-5 h-5" />
              {burstCooldownPct < 1 && (
                <div
                  className="absolute inset-0 bg-slate-950/70 rounded-lg flex items-center justify-center text-[10px] font-orbitron text-cyan-400"
                >
                  {Math.ceil((1 - burstCooldownPct) * 9)}s
                </div>
              )}
            </div>
            <div>
              <div className="text-xs font-orbitron font-bold text-white flex items-center gap-1.5">
                <span>ECHO BURST</span>
                <span className="text-[10px] bg-cyan-950 px-1.5 py-0.5 rounded text-cyan-400 border border-cyan-600">
                  SPACE / E
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                Vaporize trail & stun enemies
              </div>
            </div>
          </div>

          {/* Phantom Flare Decoy Card */}
          <div
            onClick={() => {
              if (flareCooldownPct >= 1) onAbility('flare');
            }}
            className={`cursor-pointer px-4 py-2.5 rounded-xl border flex items-center gap-3 backdrop-blur-md transition-all ${
              flareCooldownPct >= 1
                ? 'bg-slate-950/85 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:scale-105 active:scale-95'
                : 'bg-slate-950/50 border-slate-800 opacity-60'
            }`}
          >
            <div className="relative w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-500/50 flex items-center justify-center text-amber-300">
              <Zap className="w-5 h-5" />
              {flareCooldownPct < 1 && (
                <div
                  className="absolute inset-0 bg-slate-950/70 rounded-lg flex items-center justify-center text-[10px] font-orbitron text-amber-400"
                >
                  {Math.ceil((1 - flareCooldownPct) * 12)}s
                </div>
              )}
            </div>
            <div>
              <div className="text-xs font-orbitron font-bold text-white flex items-center gap-1.5">
                <span>PHANTOM FLARE</span>
                <span className="text-[10px] bg-amber-950 px-1.5 py-0.5 rounded text-amber-400 border border-amber-600">
                  Q / F
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                Deploy decoy trail beacon
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pause Modal Overlay */}
      {isPaused && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center pointer-events-auto z-50">
          <div className="bg-slate-900 border border-cyan-500/50 p-8 rounded-2xl max-w-sm w-full text-center shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            <h2 className="text-2xl font-orbitron font-bold text-white mb-2 glow-cyan">
              PAUSED
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              Shadows freeze in the quantum void.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  soundEngine.playUiClick();
                  onTogglePause();
                }}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-orbitron font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(6,182,212,0.5)] cursor-pointer"
              >
                RESUME RUN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
