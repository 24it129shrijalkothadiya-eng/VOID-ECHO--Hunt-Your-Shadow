/**
 * VOID ECHO - Local Leaderboards, Career Stats & Achievements
 */

import React, { useState } from 'react';
import { X, Trophy, BarChart2, Award, Flame, Zap, Shield, CheckCircle2 } from 'lucide-react';
import { storageService } from '../services/storage';
import { soundEngine } from '../services/soundEngine';

interface LeaderboardModalProps {
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'stats' | 'achievements'>('leaderboard');
  const [leaderboard] = useState(storageService.getLeaderboard());
  const [stats] = useState(storageService.getStats());
  const [achievements] = useState(storageService.getAchievements());

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-cyan-500/40 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.25)]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-orbitron font-bold text-white glow-cyan">
              RECORDS & CAREER CODEX
            </h2>
          </div>
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 px-6 pt-4 border-b border-slate-800 pb-3">
          <button
            onClick={() => {
              soundEngine.playUiClick();
              setActiveTab('leaderboard');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-orbitron flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'leaderboard'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>LEADERBOARD</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              setActiveTab('stats');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-orbitron flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'stats'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>CAREER STATS</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              setActiveTab('achievements');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-orbitron flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'achievements'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>ACHIEVEMENTS</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tab 1: Leaderboard Table */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-2">
              <div className="grid grid-cols-12 text-[11px] font-orbitron text-slate-400 px-3 py-1 uppercase tracking-wider">
                <span className="col-span-1">#</span>
                <span className="col-span-4">OPERATIVE</span>
                <span className="col-span-3 text-right">SCORE</span>
                <span className="col-span-2 text-center">MODE</span>
                <span className="col-span-2 text-right">SURVIVED</span>
              </div>

              {leaderboard.map((entry, idx) => (
                <div
                  key={entry.id}
                  className={`grid grid-cols-12 items-center px-3 py-2.5 rounded-xl border text-xs font-orbitron ${
                    idx === 0
                      ? 'bg-amber-950/30 border-amber-500/50 text-amber-300'
                      : idx === 1
                      ? 'bg-slate-900/80 border-slate-700 text-slate-200'
                      : idx === 2
                      ? 'bg-amber-950/15 border-amber-800/40 text-amber-200'
                      : 'bg-slate-900/40 border-slate-800/60 text-slate-300'
                  }`}
                >
                  <span className="col-span-1 font-bold">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                  </span>
                  <span className="col-span-4 font-bold truncate">{entry.playerName}</span>
                  <span className="col-span-3 text-right font-black text-cyan-400">
                    {entry.score.toLocaleString()}
                  </span>
                  <span className="col-span-2 text-center text-[10px] text-slate-400 uppercase">
                    {entry.difficulty}
                  </span>
                  <span className="col-span-2 text-right text-slate-400">
                    {entry.survivalTimeSeconds}s
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Career Stats */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Level & XP Banner */}
              <div className="bg-gradient-to-r from-cyan-950/60 to-purple-950/60 border border-cyan-500/40 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-orbitron text-cyan-400">OPERATIVE RANK</div>
                  <div className="text-2xl font-orbitron font-black text-white">
                    LEVEL {stats.level}
                  </div>
                  <div className="text-xs text-slate-400 font-chakra mt-1">
                    {stats.currentXp} / {stats.nextLevelXp} XP to next rank
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-orbitron text-amber-400">VOID SHARDS</div>
                  <div className="text-2xl font-orbitron font-black text-amber-300">
                    💎 {stats.voidShards}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs font-orbitron text-slate-400 mb-1">TOTAL RUNS</div>
                  <div className="text-xl font-orbitron font-bold text-white">
                    {stats.totalRuns}
                  </div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs font-orbitron text-slate-400 mb-1">CAREER HIGH SCORE</div>
                  <div className="text-xl font-orbitron font-bold text-cyan-400">
                    {stats.highScore.toLocaleString()}
                  </div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs font-orbitron text-slate-400 mb-1">TOTAL TIME SURVIVED</div>
                  <div className="text-xl font-orbitron font-bold text-slate-200">
                    {Math.floor(stats.totalSurvivalSeconds / 60)}m {stats.totalSurvivalSeconds % 60}s
                  </div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center gap-1 text-xs font-orbitron text-rose-400 mb-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span>NEAR MISSES</span>
                  </div>
                  <div className="text-xl font-orbitron font-bold text-rose-300">
                    {stats.totalNearMisses}
                  </div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center gap-1 text-xs font-orbitron text-cyan-400 mb-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>ORBS SIPHONED</span>
                  </div>
                  <div className="text-xl font-orbitron font-bold text-cyan-300">
                    {stats.totalOrbsCollected}
                  </div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center gap-1 text-xs font-orbitron text-purple-400 mb-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span>ENEMIES STUNNED</span>
                  </div>
                  <div className="text-xl font-orbitron font-bold text-purple-300">
                    {stats.totalEnemiesStunned}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Achievements List */}
          {activeTab === 'achievements' && (
            <div className="space-y-3">
              {achievements.map(ach => (
                <div
                  key={ach.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    ach.unlocked
                      ? 'bg-cyan-950/30 border-cyan-500/50 shadow-sm'
                      : 'bg-slate-900/40 border-slate-800/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{ach.icon}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-orbitron font-bold text-sm text-white">
                          {ach.title}
                        </span>
                        {ach.unlocked && (
                          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{ach.description}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-orbitron font-bold text-amber-400">
                      +{ach.rewardShards} 💎
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
