/**
 * VOID ECHO - Mobile Virtual Joystick & Touch Ability Buttons
 */

import React, { useRef, useState, useEffect } from 'react';
import { Zap, ShieldAlert } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

interface VirtualJoystickProps {
  onMove: (x: number, y: number) => void;
  onAbility: (type: 'burst' | 'flare') => void;
  burstCooldownPct: number;
  flareCooldownPct: number;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  onMove,
  onAbility,
  burstCooldownPct,
  flareCooldownPct,
}) => {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const touchIdRef = useRef<number | null>(null);

  const maxRadius = 45;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setIsDragging(true);
    updateKnob(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateKnob(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setIsDragging(false);
        setKnobPos({ x: 0, y: 0 });
        onMove(0, 0);
        break;
      }
    }
  };

  const updateKnob = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.hypot(dx, dy);

    if (distance <= maxRadius) {
      setKnobPos({ x: dx, y: dy });
      onMove(dx / maxRadius, dy / maxRadius);
    } else {
      const angle = Math.atan2(dy, dx);
      const clampedX = Math.cos(angle) * maxRadius;
      const clampedY = Math.sin(angle) * maxRadius;
      setKnobPos({ x: clampedX, y: clampedY });
      onMove(clampedX / maxRadius, clampedY / maxRadius);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex justify-between items-end p-6">
      {/* Virtual Joystick Thumbpad */}
      <div
        ref={joystickBaseRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="pointer-events-auto w-32 h-32 rounded-full border-2 border-cyan-500/40 bg-slate-950/60 backdrop-blur-sm relative flex items-center justify-center active:border-cyan-400"
      >
        <div
          className="w-14 h-14 rounded-full bg-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.8)] border border-white/60 absolute transition-transform"
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        />
        <div className="text-[10px] text-cyan-300 font-orbitron uppercase tracking-widest pointer-events-none opacity-40">
          Move
        </div>
      </div>

      {/* Ability Action Buttons */}
      <div className="pointer-events-auto flex flex-col gap-4 items-end mb-2">
        {/* Phantom Flare Button */}
        <button
          onClick={() => {
            if (flareCooldownPct >= 1) {
              soundEngine.playUiClick();
              onAbility('flare');
            }
          }}
          disabled={flareCooldownPct < 1}
          className={`w-16 h-16 rounded-full flex flex-col items-center justify-center border-2 transition-all relative ${
            flareCooldownPct >= 1
              ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] active:scale-95'
              : 'bg-slate-900/50 border-slate-700 text-slate-500 opacity-60'
          }`}
        >
          <Zap className="w-6 h-6" />
          <span className="text-[9px] font-orbitron mt-0.5">FLARE</span>
          {flareCooldownPct < 1 && (
            <div
              className="absolute inset-0 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"
            />
          )}
        </button>

        {/* Echo Burst Button */}
        <button
          onClick={() => {
            if (burstCooldownPct >= 1) {
              soundEngine.playUiClick();
              onAbility('burst');
            }
          }}
          disabled={burstCooldownPct < 1}
          className={`w-18 h-18 rounded-full flex flex-col items-center justify-center border-2 transition-all relative ${
            burstCooldownPct >= 1
              ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.6)] active:scale-95'
              : 'bg-slate-900/50 border-slate-700 text-slate-500 opacity-60'
          }`}
        >
          <ShieldAlert className="w-7 h-7" />
          <span className="text-[10px] font-orbitron font-bold mt-0.5">BURST</span>
          {burstCooldownPct < 1 && (
            <div
              className="absolute inset-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"
            />
          )}
        </button>
      </div>
    </div>
  );
};
