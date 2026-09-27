/**
 * VOID ECHO - Settings & Audio Mixer
 */

import React, { useState } from 'react';
import { X, Volume2, VolumeX, Music, Smartphone, Sliders, PlayCircle } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';
import { storageService } from '../services/storage';

interface SettingsModalProps {
  onClose: () => void;
  isMobileTouch: boolean;
  onToggleTouch: (val: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  isMobileTouch,
  onToggleTouch,
}) => {
  const [audioSettings, setAudioSettings] = useState(soundEngine.getSettings());

  const handleVolumeChange = (field: 'masterVolume' | 'musicVolume' | 'sfxVolume', value: number) => {
    const updated = { ...audioSettings, [field]: value };
    setAudioSettings(updated);
    soundEngine.updateSettings(updated);
    storageService.saveAudioSettings(updated);
  };

  const handleMuteToggle = () => {
    soundEngine.playUiClick();
    const updated = { ...audioSettings, isMuted: !audioSettings.isMuted };
    setAudioSettings(updated);
    soundEngine.updateSettings(updated);
    storageService.saveAudioSettings(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-cyan-500/40 rounded-2xl max-w-md w-full p-6 shadow-[0_0_40px_rgba(6,182,212,0.25)] flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-orbitron font-bold text-white glow-cyan">
              SYSTEM SETTINGS
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

        {/* Audio Mixer Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-orbitron text-slate-300">AUDIO ENGINE</span>
            <button
              onClick={handleMuteToggle}
              className={`px-3 py-1.5 rounded-lg text-xs font-orbitron flex items-center gap-1.5 transition-colors cursor-pointer ${
                audioSettings.isMuted
                  ? 'bg-rose-950 text-rose-300 border border-rose-600'
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-600'
              }`}
            >
              {audioSettings.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{audioSettings.isMuted ? 'UNMUTE' : 'MUTE ALL'}</span>
            </button>
          </div>

          {/* Master Volume */}
          <div>
            <div className="flex justify-between text-xs font-orbitron text-slate-400 mb-1">
              <span>MASTER GAIN</span>
              <span>{Math.round(audioSettings.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audioSettings.masterVolume}
              onChange={e => handleVolumeChange('masterVolume', parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Synthwave Music Channel */}
          <div>
            <div className="flex justify-between text-xs font-orbitron text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Music className="w-3.5 h-3.5 text-purple-400" />
                <span>SYNTH BGM CHANNEL</span>
              </span>
              <span>{Math.round(audioSettings.musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audioSettings.musicVolume}
              onChange={e => handleVolumeChange('musicVolume', parseFloat(e.target.value))}
              className="w-full accent-purple-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* SFX Channel */}
          <div>
            <div className="flex justify-between text-xs font-orbitron text-slate-400 mb-1">
              <span>COMBAT SFX CHANNEL</span>
              <span>{Math.round(audioSettings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audioSettings.sfxVolume}
              onChange={e => handleVolumeChange('sfxVolume', parseFloat(e.target.value))}
              className="w-full accent-rose-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Audio Test Preview Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => soundEngine.previewSound('music')}
              className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-orbitron text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <PlayCircle className="w-3.5 h-3.5 text-purple-400" />
              <span>TEST SYNTH BGM</span>
            </button>
            <button
              onClick={() => soundEngine.previewSound('sfx')}
              className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-orbitron text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <PlayCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>TEST SFX BURST</span>
            </button>
          </div>
        </div>

        {/* Input & Control Preferences */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="text-xs font-orbitron text-slate-300">INPUT CONFIGURATION</div>

          <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-xs font-orbitron text-slate-200">
                  VIRTUAL TOUCH JOYSTICK & BUTTONS
                </div>
                <div className="text-[11px] text-slate-400">
                  Recommended for mobile phones and touchscreens
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isMobileTouch}
              onChange={e => {
                soundEngine.playUiClick();
                onToggleTouch(e.target.checked);
                storageService.saveTouchControlPreference(e.target.checked);
              }}
              className="accent-cyan-500 w-4 h-4 cursor-pointer"
            />
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            soundEngine.playUiClick();
            onClose();
          }}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-orbitron text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          CONFIRM & RETURN
        </button>
      </div>
    </div>
  );
};
