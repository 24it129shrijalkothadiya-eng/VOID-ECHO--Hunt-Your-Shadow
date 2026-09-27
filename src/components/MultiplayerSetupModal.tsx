/**
 * VOID ECHO - Multiplayer Match Setup & Team Customizer
 */

import React, { useState } from 'react';
import { X, Users, Swords, Clock, Bot, Play } from 'lucide-react';
import { GameDifficulty, MatchSettings } from '../types/game';
import { soundEngine } from '../services/soundEngine';

interface MultiplayerSetupModalProps {
  onStartMatch: (settings: MatchSettings) => void;
  onClose: () => void;
}

export const MultiplayerSetupModal: React.FC<MultiplayerSetupModalProps> = ({
  onStartMatch,
  onClose,
}) => {
  const [numPlayers, setNumPlayers] = useState(4);
  const [numRunners, setNumRunners] = useState(3);
  const [numHunters, setNumHunters] = useState(1);
  const [duration, setDuration] = useState(90);
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');
  const [botsEnabled, setBotsEnabled] = useState(true);

  const handleRunnersChange = (runners: number) => {
    soundEngine.playUiClick();
    setNumRunners(runners);
    setNumHunters(numPlayers - runners);
  };

  const handlePlayersChange = (players: number) => {
    soundEngine.playUiClick();
    setNumPlayers(players);
    const newRunners = Math.max(1, players - 1);
    setNumRunners(newRunners);
    setNumHunters(players - newRunners);
  };

  const launchMatch = () => {
    soundEngine.playUiClick();
    onStartMatch({
      mode: 'hunter_runner',
      difficulty,
      matchDurationSeconds: duration,
      numPlayers,
      numRunners,
      numHunters,
      botsEnabled,
      tiltPerspective: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-cyan-500/40 rounded-2xl max-w-xl w-full p-6 shadow-[0_0_40px_rgba(6,182,212,0.25)] flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl font-orbitron font-bold text-white glow-cyan">
              HUNTER VS RUNNER MULTIPLAYER
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

        {/* Configuration Sections */}
        <div className="space-y-4">
          {/* Total Players */}
          <div>
            <label className="text-xs font-orbitron text-slate-300 flex items-center gap-1.5 mb-2">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>TOTAL COMBATANTS (1–4)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(n => (
                <button
                  key={n}
                  onClick={() => handlePlayersChange(n)}
                  className={`py-2 text-xs font-orbitron font-bold rounded-lg border transition-all cursor-pointer ${
                    numPlayers === n
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {n} {n === 1 ? 'Player' : 'Players'}
                </button>
              ))}
            </div>
          </div>

          {/* Team Composition (Runners vs Hunters) */}
          {numPlayers > 1 && (
            <div>
              <label className="text-xs font-orbitron text-slate-300 flex items-center justify-between mb-2">
                <span>TEAM SPLIT</span>
                <span className="text-cyan-400">
                  {numRunners} Runners • {numHunters} Hunters
                </span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: numPlayers - 1 }, (_, i) => i + 1).map(r => (
                  <button
                    key={r}
                    onClick={() => handleRunnersChange(r)}
                    className={`py-2 text-xs font-orbitron rounded-lg border transition-all cursor-pointer ${
                      numRunners === r
                        ? 'bg-rose-950 border-rose-500 text-rose-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {r} Runner{r > 1 ? 's' : ''} / {numPlayers - r} Hunter
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Match Duration */}
          <div>
            <label className="text-xs font-orbitron text-slate-300 flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>ROUND DURATION</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[60, 90, 120, 180].map(sec => (
                <button
                  key={sec}
                  onClick={() => {
                    soundEngine.playUiClick();
                    setDuration(sec);
                  }}
                  className={`py-2 text-xs font-orbitron font-bold rounded-lg border transition-all cursor-pointer ${
                    duration === sec
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-xs font-orbitron text-slate-300 mb-2 block">
              SPEED & DIFFICULTY
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['slow', 'medium', 'fast'] as const).map(diff => (
                <button
                  key={diff}
                  onClick={() => {
                    soundEngine.playUiClick();
                    setDifficulty(diff);
                  }}
                  className={`py-2 text-xs font-orbitron uppercase font-bold rounded-lg border transition-all cursor-pointer ${
                    difficulty === diff
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* AI Bots Fill Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <div className="text-xs font-orbitron text-slate-200">
                AUTO-FILL OPEN SLOTS WITH BOTS
              </div>
            </div>
            <input
              type="checkbox"
              checked={botsEnabled}
              onChange={e => setBotsEnabled(e.target.checked)}
              className="accent-cyan-500 w-4 h-4 cursor-pointer"
            />
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={launchMatch}
          className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-orbitron font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all cursor-pointer"
        >
          <Play className="w-4 h-4" />
          <span>INITIALIZE MATCH</span>
        </button>
      </div>
    </div>
  );
};
