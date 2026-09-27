/**
 * VOID ECHO - Avatar Armory & Customization Suite
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, Check, Sparkles } from 'lucide-react';
import { AvatarId, CosmeticId, PlayerCharacter, TrailStyle } from '../types/game';
import {
  AVATAR_REGISTRY,
  COSMETICS_LIST,
  TRAILS_LIST,
  drawAvatar,
} from '../services/avatarDefinitions';
import { storageService } from '../services/storage';
import { soundEngine } from '../services/soundEngine';

interface ArmoryModalProps {
  onClose: () => void;
}

const COLOR_PALETTES = [
  { name: 'Neon Cyan', hex: '#06b6d4', glow: '#38bdf8' },
  { name: 'Synth Purple', hex: '#a855f7', glow: '#c084fc' },
  { name: 'Cyber Gold', hex: '#eab308', glow: '#facc15' },
  { name: 'Blood Crimson', hex: '#f43f5e', glow: '#fb7185' },
  { name: 'Matrix Green', hex: '#10b981', glow: '#34d399' },
  { name: 'Electric Coral', hex: '#f97316', glow: '#fb923c' },
];

export const ArmoryModal: React.FC<ArmoryModalProps> = ({ onClose }) => {
  const [customization, setCustomization] = useState(storageService.getCustomization());
  const [unlockedAvatars, setUnlockedAvatars] = useState(storageService.getUnlockedAvatars());
  const [unlockedTrails, setUnlockedTrails] = useState(storageService.getUnlockedTrails());
  const [stats, setStats] = useState(storageService.getStats());
  const [activeTab, setActiveTab] = useState<'avatars' | 'trails' | 'cosmetics' | 'colors'>('avatars');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Live Canvas Preview Animation
  useEffect(() => {
    let startTime = performance.now();

    const renderPreview = (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Cyber pedestal background
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w / 2);
      bgGrad.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
      bgGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Rotating hologram rings
      ctx.save();
      ctx.strokeStyle = customization.primaryColor;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2 + 35, 60, 20, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Dummy character representation
      const mockPlayer: PlayerCharacter = {
        id: 1,
        name: 'Preview',
        isHuman: true,
        role: 'runner',
        x: w / 2,
        y: h / 2,
        vx: 0,
        vy: 0,
        speed: 4.8,
        angle: 0,
        radius: 28,
        avatarId: customization.avatarId,
        color: customization.primaryColor,
        trailStyle: customization.trailStyle,
        cosmeticId: customization.cosmeticId,
        isAlive: true,
        score: 0,
        combo: 1,
        comboTimer: 0,
        aura: 'speed_surge',
        auraTimer: 1000,
        burstCooldown: 0,
        flareCooldown: 0,
        nearMissCount: 0,
        orbsCollected: 0,
        taggedCount: 0,
        expression: 'normal',
        expressionTimer: 0,
      };

      drawAvatar(ctx, mockPlayer, time - startTime, 1.35);

      animFrameRef.current = requestAnimationFrame(renderPreview);
    };

    animFrameRef.current = requestAnimationFrame(renderPreview);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [customization]);

  const selectAvatar = (id: AvatarId) => {
    soundEngine.playUiClick();
    const meta = AVATAR_REGISTRY[id];
    if (unlockedAvatars.includes(id)) {
      const updated = { ...customization, avatarId: id };
      setCustomization(updated);
      storageService.saveCustomization(updated);
    } else {
      // Try to unlock with Void Shards
      if (stats.voidShards >= meta.costShards) {
        const newStats = { ...stats, voidShards: stats.voidShards - meta.costShards };
        storageService.saveStats(newStats);
        setStats(newStats);
        storageService.unlockAvatar(id);
        setUnlockedAvatars(storageService.getUnlockedAvatars());

        const updated = { ...customization, avatarId: id };
        setCustomization(updated);
        storageService.saveCustomization(updated);
        soundEngine.playOrbCollect(3);
      }
    }
  };

  const selectTrail = (style: TrailStyle) => {
    soundEngine.playUiClick();
    const meta = TRAILS_LIST.find(t => t.style === style);
    if (!meta) return;

    if (unlockedTrails.includes(style)) {
      const updated = { ...customization, trailStyle: style };
      setCustomization(updated);
      storageService.saveCustomization(updated);
    } else {
      if (stats.voidShards >= meta.costShards) {
        const newStats = { ...stats, voidShards: stats.voidShards - meta.costShards };
        storageService.saveStats(newStats);
        setStats(newStats);
        storageService.unlockTrail(style);
        setUnlockedTrails(storageService.getUnlockedTrails());

        const updated = { ...customization, trailStyle: style };
        setCustomization(updated);
        storageService.saveCustomization(updated);
        soundEngine.playOrbCollect(3);
      }
    }
  };

  const selectCosmetic = (cosmeticId: CosmeticId) => {
    soundEngine.playUiClick();
    const updated = { ...customization, cosmeticId };
    setCustomization(updated);
    storageService.saveCustomization(updated);
  };

  const selectColor = (hex: string, glow: string) => {
    soundEngine.playUiClick();
    const updated = { ...customization, primaryColor: hex, glowColor: glow };
    setCustomization(updated);
    storageService.saveCustomization(updated);
  };

  const currentAvatarMeta = AVATAR_REGISTRY[customization.avatarId];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-cyan-500/40 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.25)]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-orbitron font-bold text-white glow-cyan">
              AVATAR ARMORY & CUSTOMIZER
            </h2>
            <div className="flex items-center gap-1.5 bg-cyan-950/80 border border-cyan-500/50 px-3 py-1 rounded-full text-xs font-orbitron text-cyan-300">
              <span>💎</span>
              <span>{stats.voidShards} SHARDS</span>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: 2.5D Animated Character Hologram Display */}
          <div className="w-full md:w-80 bg-slate-900/60 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800">
            <div className="w-48 h-48 relative rounded-2xl border-2 border-cyan-500/30 overflow-hidden bg-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.2)]">
              <canvas
                ref={canvasRef}
                width={200}
                height={200}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="mt-4 text-center">
              <div className="text-lg font-orbitron font-bold text-white">
                {currentAvatarMeta.name}
              </div>
              <div className="text-xs text-cyan-400 font-chakra">
                {currentAvatarMeta.tagline}
              </div>
              <p className="text-[11px] text-slate-400 mt-2 px-2 leading-relaxed">
                {currentAvatarMeta.description}
              </p>
            </div>

            {/* Character Attributes */}
            <div className="w-full mt-4 space-y-1.5 text-xs font-orbitron">
              <div className="flex justify-between text-slate-400">
                <span>AGILITY</span>
                <span className="text-cyan-400">{'★'.repeat(currentAvatarMeta.stats.agility)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>BURST POWER</span>
                <span className="text-rose-400">{'★'.repeat(currentAvatarMeta.stats.burstPower)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>STEALTH</span>
                <span className="text-purple-400">{'★'.repeat(currentAvatarMeta.stats.stealth)}</span>
              </div>
            </div>
          </div>

          {/* Right: Customization Tabs & Grids */}
          <div className="flex-1 flex flex-col overflow-hidden p-6">
            {/* Nav Tabs */}
            <div className="flex gap-2 border-b border-slate-800 pb-3 mb-4">
              {(['avatars', 'trails', 'cosmetics', 'colors'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    soundEngine.playUiClick();
                    setActiveTab(tab);
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-orbitron uppercase tracking-wider transition-colors cursor-pointer ${
                    activeTab === tab
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto pr-1">
              {/* Tab 1: Avatars */}
              {activeTab === 'avatars' && (
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                  {Object.values(AVATAR_REGISTRY).map(avatar => {
                    const isUnlocked = unlockedAvatars.includes(avatar.id);
                    const isEquipped = customization.avatarId === avatar.id;
                    const canAfford = stats.voidShards >= avatar.costShards;

                    return (
                      <div
                        key={avatar.id}
                        onClick={() => selectAvatar(avatar.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                          isEquipped
                            ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                            : isUnlocked
                            ? 'bg-slate-900/70 border-slate-800 hover:border-slate-600'
                            : 'bg-slate-900/40 border-slate-800/60 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-orbitron font-bold text-sm text-white">
                            {avatar.name}
                          </span>
                          {isEquipped ? (
                            <Check className="w-4 h-4 text-cyan-400" />
                          ) : !isUnlocked ? (
                            <span className="flex items-center gap-1 text-[11px] font-orbitron text-amber-400">
                              <Lock className="w-3.5 h-3.5" />
                              {avatar.costShards}
                            </span>
                          ) : null}
                        </div>
                        <div className="text-[11px] text-slate-400 font-chakra mt-1">
                          {avatar.tagline}
                        </div>
                        {!isUnlocked && (
                          <div className="mt-2 text-[10px] font-orbitron">
                            {canAfford ? (
                              <span className="text-cyan-400">CLICK TO UNLOCK</span>
                            ) : (
                              <span className="text-slate-500">NEED {avatar.costShards - stats.voidShards} MORE SHARDS</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab 2: Trails */}
              {activeTab === 'trails' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TRAILS_LIST.map(trail => {
                    const isUnlocked = unlockedTrails.includes(trail.style);
                    const isEquipped = customization.trailStyle === trail.style;

                    return (
                      <div
                        key={trail.style}
                        onClick={() => selectTrail(trail.style)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isEquipped
                            ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                            : 'bg-slate-900/70 border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-orbitron font-bold text-sm text-white">
                            {trail.name}
                          </span>
                          {isEquipped ? (
                            <Check className="w-4 h-4 text-cyan-400" />
                          ) : !isUnlocked ? (
                            <span className="flex items-center gap-1 text-[11px] font-orbitron text-amber-400">
                              <Lock className="w-3.5 h-3.5" />
                              {trail.costShards}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{trail.description}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab 3: Cosmetics */}
              {activeTab === 'cosmetics' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {COSMETICS_LIST.map(cosmetic => {
                    const isEquipped = customization.cosmeticId === cosmetic.id;

                    return (
                      <div
                        key={cosmetic.id}
                        onClick={() => selectCosmetic(cosmetic.id)}
                        className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isEquipped
                            ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                            : 'bg-slate-900/70 border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div className="text-2xl mb-1">{cosmetic.icon}</div>
                        <div className="font-orbitron font-bold text-xs text-white">
                          {cosmetic.name}
                        </div>
                        {isEquipped && (
                          <div className="mt-1 text-[10px] text-cyan-400 font-orbitron">
                            EQUIPPED
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab 4: Colors */}
              {activeTab === 'colors' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {COLOR_PALETTES.map(col => {
                    const isSelected = customization.primaryColor === col.hex;

                    return (
                      <div
                        key={col.hex}
                        onClick={() => selectColor(col.hex, col.glow)}
                        className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                            : 'bg-slate-900/70 border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-full shadow-md border border-white/50"
                          style={{ backgroundColor: col.hex }}
                        />
                        <div>
                          <div className="font-orbitron text-xs font-bold text-white">
                            {col.name}
                          </div>
                          {isSelected && (
                            <div className="text-[10px] text-cyan-400 font-orbitron">
                              ACTIVE
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
