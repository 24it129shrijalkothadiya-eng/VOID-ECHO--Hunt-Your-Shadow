/**
 * VOID ECHO - Interactive Tutorial & Codex Guide
 */

import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, ShieldAlert, Zap, Compass, Flame, AlertTriangle } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

interface TutorialModalProps {
  onClose: () => void;
  onPlayTutorialMission?: () => void;
}

const TUTORIAL_STEPS = [
  {
    step: 1,
    title: 'THE 5-SECOND ECHO TRAIL',
    subtitle: 'Enemies cannot see you directly',
    icon: Compass,
    color: '#06b6d4',
    content:
      'As you move through the quantum void, your character leaves behind an Echo Trail that lasts for exactly 5 seconds before fading into oblivion. Enemies DO NOT track where you are right now—they only chase this 5-second ghost path!',
    tip: 'Standing completely still allows your trail to completely dissolve, leaving enemies blinded and confused!',
  },
  {
    step: 2,
    title: 'STALKERS VS HUNTERS',
    subtitle: 'Learn distinct shadow hunting styles',
    icon: Flame,
    color: '#ec4899',
    content:
      'Pink Stalkers are swift and agile, homing directly in on your freshest trail coordinates. Red Hunters are brute interrogators that scan with wide radar arcs and pounce ahead to cut off your projected route.',
    tip: 'Make sudden 90-degree pivots or circular loops to force Hunters into miscalculated pounces.',
  },
  {
    step: 3,
    title: 'SPECIAL ABILITIES',
    subtitle: 'Echo Burst & Phantom Flare',
    icon: ShieldAlert,
    color: '#38bdf8',
    content:
      'Echo Burst (SPACE / E) instantly vaporizes your entire echo trail and unleashes a resonant shockwave that stuns surrounding enemies for 3.5s. Phantom Flare (Q / F) launches a decoy beacon that radiates simulated trail pings, tricking all hunters into swarming it!',
    tip: 'Save your Echo Burst for moments when enemies are closing in on a dense trail cluster near you.',
  },
  {
    step: 4,
    title: 'TRAIL WEAVING & NEAR-MISS',
    subtitle: 'Advanced tactics & combo multipliers',
    icon: Zap,
    color: '#eab308',
    content:
      'Looping your trail creates an energized Trail Wall barrier that repels and stumbles pursuing enemies! Furthermore, sliding within razor-thin proximity of an enemy without touching triggers NEAR MISS bonuses, building up to an 8x Overdrive Frenzy!',
    tip: 'Chain near-misses to ignite the Speed Surge and Zen Ghost invulnerability auras.',
  },
  {
    step: 5,
    title: 'SUDDEN DEATH & MULTIPLAYER',
    subtitle: 'Survive the Void Collapse',
    icon: AlertTriangle,
    color: '#f43f5e',
    content:
      'In the final 25 seconds of timed rounds, the Void Collapses into Sudden Death: enemy aggression surges, elite stalkers spawn, and all orb point values double! In Multiplayer Hunter vs Runner, hunters tag runners while runners survive and bank team scores.',
    tip: 'Collect glowing Energy Orbs to magnetically siphon extra points and unlock new avatars in the Armory.',
  },
];

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const stepData = TUTORIAL_STEPS[currentStep];
  const Icon = stepData.icon;

  const nextStep = () => {
    soundEngine.playUiClick();
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    soundEngine.playUiClick();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-cyan-500/40 rounded-2xl max-w-xl w-full p-6 shadow-[0_0_40px_rgba(6,182,212,0.25)] flex flex-col justify-between min-h-[460px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-orbitron text-cyan-400">
              CODEX // LESSON {currentStep + 1} OF {TUTORIAL_STEPS.length}
            </span>
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

        {/* Content Card */}
        <div className="my-6">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-md"
              style={{
                backgroundColor: `${stepData.color}20`,
                borderColor: stepData.color,
                color: stepData.color,
              }}
            >
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-orbitron font-bold text-white tracking-wider">
                {stepData.title}
              </h3>
              <div className="text-xs text-slate-400 font-chakra">
                {stepData.subtitle}
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed mb-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            {stepData.content}
          </p>

          <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-xl p-3 flex items-start gap-2.5">
            <span className="text-cyan-400 font-orbitron text-xs font-bold shrink-0 mt-0.5">
              PRO TACTIC:
            </span>
            <span className="text-xs text-cyan-200/90 leading-normal">
              {stepData.tip}
            </span>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded-lg text-xs font-orbitron flex items-center gap-1.5 transition-colors ${
              currentStep > 0
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer'
                : 'opacity-40 text-slate-600 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>PREV</span>
          </button>

          {/* Dots Indicator */}
          <div className="flex gap-2">
            {TUTORIAL_STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentStep ? 'bg-cyan-400 w-6' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextStep}
            className="px-5 py-2 rounded-lg text-xs font-orbitron font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer transition-all"
          >
            <span>{currentStep === TUTORIAL_STEPS.length - 1 ? 'GOT IT' : 'NEXT'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
