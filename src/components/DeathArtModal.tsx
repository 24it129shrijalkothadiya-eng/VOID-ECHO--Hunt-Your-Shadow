/**
 * VOID ECHO - Generative Death Art Painting System & Match Results
 */

import React, { useEffect, useRef, useState } from 'react';
import { Download, RefreshCw, Trophy, Zap, Shield, Flame, Sparkles } from 'lucide-react';
import { DeathArtStroke } from '../types/game';
import { GameRunStats } from '../game/GameEngine';
import { storageService } from '../services/storage';
import { soundEngine } from '../services/soundEngine';

interface DeathArtModalProps {
  strokes: DeathArtStroke[];
  stats: GameRunStats;
  onPlayAgain: () => void;
  onReturnToMenu: () => void;
}

export const DeathArtModal: React.FC<DeathArtModalProps> = ({
  strokes,
  stats,
  onPlayAgain,
  onReturnToMenu,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [leveledUp, setLeveledUp] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [shardsEarned, setShardsEarned] = useState(0);

  useEffect(() => {
    // Calculate XP & Shards based on performance
    const baseScoreXp = Math.floor(stats.score * 0.15);
    const timeXp = stats.survivalSeconds * 10;
    const nearMissXp = stats.nearMisses * 40;
    const totalXp = Math.max(100, baseScoreXp + timeXp + nearMissXp);

    const shards = Math.floor(stats.score / 200) + stats.nearMisses * 3 + Math.floor(stats.orbsCollected / 2);

    setXpEarned(totalXp);
    setShardsEarned(shards);

    const res = storageService.addXpAndShards(totalXp, shards);
    setLeveledUp(res.leveledUp);

    // Render generative vector Death Art
    renderDeathArt();
  }, [strokes, stats]);

  const renderDeathArt = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // 1. Deep cosmic gradient background
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w * 0.7);
    bgGrad.addColorStop(0, '#0d111e');
    bgGrad.addColorStop(0.6, '#060810');
    bgGrad.addColorStop(1, '#020408');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Cyberpunk geometric grid lines in background
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 36) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // 3. Draw recorded vector trails with radiant bloom
    ctx.save();
    for (const stroke of strokes) {
      if (stroke.points.length < 2) continue;

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x * (w / 1200), stroke.points[0].y * (h / 800));

      for (let i = 1; i < stroke.points.length; i++) {
        const pt = stroke.points[i];
        ctx.lineTo(pt.x * (w / 1200), pt.y * (h / 800));
      }

      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.globalAlpha = stroke.alpha;
      ctx.shadowColor = stroke.color;
      ctx.shadowBlur = 14;
      ctx.stroke();
    }
    ctx.restore();

    // 4. Subtle watermark logo
    ctx.save();
    ctx.font = '900 16px "Orbitron", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillText('VOID ECHO // ARTIFACT', 24, h - 24);
    ctx.font = '600 12px "Rajdhani", sans-serif';
    ctx.fillText(`SCORE: ${stats.score} • SURVIVED: ${stats.survivalSeconds}s`, 24, h - 42);
    ctx.restore();
  };

  const downloadArt = () => {
    soundEngine.playUiClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `void_echo_art_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-950 border border-cyan-500/40 rounded-2xl max-w-4xl w-full p-6 md:p-8 flex flex-col md:flex-row gap-8 shadow-[0_0_40px_rgba(6,182,212,0.25)] relative">
        {/* Left Side: Generative Death Art Canvas Preview */}
        <div className="flex-1 flex flex-col items-center">
          <div className="text-xs font-orbitron tracking-widest text-cyan-400 mb-2 uppercase">
            Generative Death Art Artifact
          </div>
          <div className="relative border-2 border-cyan-500/50 rounded-xl overflow-hidden shadow-[0_0_25px_rgba(6,182,212,0.3)] bg-slate-900 w-full aspect-[4/3]">
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={downloadArt}
            className="mt-3 w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 rounded-lg text-cyan-300 font-orbitron text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>DOWNLOAD DEATH ART CARD (.PNG)</span>
          </button>
        </div>

        {/* Right Side: Match Stats & Progression */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-orbitron font-black text-white glow-crimson">
                RUN TERMINATED
              </h2>
              {leveledUp && (
                <span className="flex items-center gap-1 text-xs font-orbitron font-bold text-amber-300 bg-amber-950/80 border border-amber-500 px-3 py-1 rounded-full animate-bounce">
                  <Sparkles className="w-3.5 h-3.5" />
                  LEVEL UP!
                </span>
              )}
            </div>

            {/* Score Highlight Box */}
            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-4 mb-4">
              <div className="text-xs font-orbitron text-cyan-400 uppercase">
                Final Score
              </div>
              <div className="text-3xl font-orbitron font-black text-white glow-cyan">
                {stats.score.toLocaleString()}
              </div>
            </div>

            {/* Breakdown Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-orbitron">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>SURVIVAL</span>
                </div>
                <div className="text-lg font-orbitron font-bold text-slate-100">
                  {stats.survivalSeconds}s
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-orbitron">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>NEAR MISSES</span>
                </div>
                <div className="text-lg font-orbitron font-bold text-rose-400">
                  {stats.nearMisses}
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-orbitron">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ORBS COLLECTED</span>
                </div>
                <div className="text-lg font-orbitron font-bold text-cyan-300">
                  {stats.orbsCollected}
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-orbitron">
                  <Shield className="w-3.5 h-3.5 text-purple-400" />
                  <span>ENEMIES STUNNED</span>
                </div>
                <div className="text-lg font-orbitron font-bold text-purple-300">
                  {stats.enemiesStunned}
                </div>
              </div>
            </div>

            {/* Rewards Card */}
            <div className="bg-cyan-950/30 border border-cyan-500/40 rounded-xl p-3 mb-6 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-cyan-400 font-orbitron uppercase">
                  Rewards Granted
                </div>
                <div className="text-xs text-slate-300">
                  +{xpEarned} Player XP • +{shardsEarned} Void Shards
                </div>
              </div>
              <div className="text-xl">💎</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                soundEngine.playUiClick();
                onPlayAgain();
              }}
              className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-orbitron font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>PLAY AGAIN</span>
            </button>
            <button
              onClick={() => {
                soundEngine.playUiClick();
                onReturnToMenu();
              }}
              className="py-3 px-6 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-orbitron font-bold rounded-xl transition-all cursor-pointer"
            >
              MAIN MENU
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
