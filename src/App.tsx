/**
 * VOID ECHO - Hunt Your Shadow
 * Main Application Orchestrator
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GameEngine, GameRunStats } from './game/GameEngine';
import { StartMenu } from './components/StartMenu';
import { GameHUD } from './components/GameHUD';
import { VirtualJoystick } from './components/VirtualJoystick';
import { DeathArtModal } from './components/DeathArtModal';
import { ArmoryModal } from './components/ArmoryModal';
import { MultiplayerSetupModal } from './components/MultiplayerSetupModal';
import { TutorialModal } from './components/TutorialModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { SettingsModal } from './components/SettingsModal';
import { AuraState, DeathArtStroke, GameDifficulty, MatchSettings } from './types/game';
import { storageService } from './services/storage';

type AppState = 'menu' | 'playing' | 'game_over';

export default function App() {
  const [appState, setAppState] = useState<AppState>('menu');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [multiplier, setMultiplier] = useState(1);
  const [secondsRemaining, setSecondsRemaining] = useState(90);
  const [isSuddenDeath, setIsSuddenDeath] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [burstCooldownPct, setBurstCooldownPct] = useState(1);
  const [flareCooldownPct, setFlareCooldownPct] = useState(1);
  const [aura, setAura] = useState<AuraState>('neutral');

  // Mobile / Touch controls
  const [isMobileTouch, setIsMobileTouch] = useState(storageService.getTouchControlPreference());

  // Modal Dialogs
  const [showArmory, setShowArmory] = useState(false);
  const [showMultiplayer, setShowMultiplayer] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Game Results for Death Art
  const [deathArtStrokes, setDeathArtStrokes] = useState<DeathArtStroke[]>([]);
  const [runStats, setRunStats] = useState<GameRunStats>({
    score: 0,
    survivalSeconds: 0,
    nearMisses: 0,
    orbsCollected: 0,
    enemiesStunned: 0,
    maxCombo: 1,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const currentSettingsRef = useRef<MatchSettings>({
    mode: 'survival',
    difficulty: 'medium',
    matchDurationSeconds: 90,
    numPlayers: 1,
    numHunters: 0,
    numRunners: 1,
    botsEnabled: false,
    tiltPerspective: true,
  });

  const startGame = useCallback((settings: MatchSettings) => {
    currentSettingsRef.current = settings;
    setAppState('playing');
    setScore(0);
    setCombo(1);
    setMultiplier(1);
    setSecondsRemaining(settings.matchDurationSeconds);
    setIsSuddenDeath(false);
    setIsPaused(false);
    setBurstCooldownPct(1);
    setFlareCooldownPct(1);
    setAura('neutral');
  }, []);

  // Initialize Canvas & Engine when entering 'playing' state
  useEffect(() => {
    if (appState !== 'playing' || !canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, currentSettingsRef.current, {
      onScoreUpdate: (s, c, m) => {
        setScore(s);
        setCombo(c);
        setMultiplier(m);
      },
      onTimeUpdate: (secs, sudden) => {
        setSecondsRemaining(secs);
        setIsSuddenDeath(sudden);
      },
      onGameOver: (strokes, stats) => {
        setDeathArtStrokes(strokes);
        setRunStats(stats);
        setAppState('game_over');
      },
      onNotification: () => {},
      onAbilityCooldown: (burstPct, flarePct) => {
        setBurstCooldownPct(burstPct);
        setFlareCooldownPct(flarePct);
      },
      onAuraChange: (a) => {
        setAura(a);
      },
    });

    engineRef.current = engine;
    engine.start();

    return () => {
      engine.stop();
      engineRef.current = null;
    };
  }, [appState]);

  // Handle Solo Start
  const handleStartSolo = (diff: GameDifficulty) => {
    startGame({
      mode: 'survival',
      difficulty: diff,
      matchDurationSeconds: 90,
      numPlayers: 1,
      numHunters: 0,
      numRunners: 1,
      botsEnabled: false,
      tiltPerspective: true,
    });
  };

  // Ability Triggers from UI
  const handleTriggerAbility = (type: 'burst' | 'flare') => {
    if (engineRef.current) {
      engineRef.current.triggerAbility(type);
    }
  };

  // Joystick Input from VirtualJoystick
  const handleJoystickMove = (x: number, y: number) => {
    if (engineRef.current) {
      engineRef.current.setJoystickInput(x, y);
    }
  };

  // Pause Toggle
  const handleTogglePause = () => {
    setIsPaused(prev => {
      const next = !prev;
      if (engineRef.current) {
        engineRef.current.setPaused(next);
      }
      return next;
    });
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* 1. Start Menu */}
      {appState === 'menu' && (
        <StartMenu
          onStartSolo={handleStartSolo}
          onOpenMultiplayer={() => setShowMultiplayer(true)}
          onOpenTutorial={() => setShowTutorial(true)}
          onOpenArmory={() => setShowArmory(true)}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {/* 2. Active Game Arena Canvas */}
      {appState === 'playing' && (
        <div className="relative w-full h-full">
          <canvas
            ref={canvasRef}
            className="w-full h-full block cursor-crosshair"
          />

          {/* HUD Overlay */}
          <GameHUD
            score={score}
            combo={combo}
            multiplier={multiplier}
            secondsRemaining={secondsRemaining}
            isSuddenDeath={isSuddenDeath}
            isPaused={isPaused}
            onTogglePause={handleTogglePause}
            burstCooldownPct={burstCooldownPct}
            flareCooldownPct={flareCooldownPct}
            aura={aura}
            onAbility={handleTriggerAbility}
            isMobileTouch={isMobileTouch}
            onToggleTouchControls={() => setIsMobileTouch(!isMobileTouch)}
          />

          {/* Virtual Joystick for Mobile / Touch mode */}
          {isMobileTouch && (
            <VirtualJoystick
              onMove={handleJoystickMove}
              onAbility={handleTriggerAbility}
              burstCooldownPct={burstCooldownPct}
              flareCooldownPct={flareCooldownPct}
            />
          )}
        </div>
      )}

      {/* 3. Generative Death Art & Results Modal */}
      {appState === 'game_over' && (
        <DeathArtModal
          strokes={deathArtStrokes}
          stats={runStats}
          onPlayAgain={() => startGame(currentSettingsRef.current)}
          onReturnToMenu={() => setAppState('menu')}
        />
      )}

      {/* 4. Modals & Dialogs */}
      {showArmory && (
        <ArmoryModal onClose={() => setShowArmory(false)} />
      )}

      {showMultiplayer && (
        <MultiplayerSetupModal
          onStartMatch={(settings) => {
            setShowMultiplayer(false);
            startGame(settings);
          }}
          onClose={() => setShowMultiplayer(false)}
        />
      )}

      {showTutorial && (
        <TutorialModal onClose={() => setShowTutorial(false)} />
      )}

      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          isMobileTouch={isMobileTouch}
          onToggleTouch={(v) => setIsMobileTouch(v)}
        />
      )}
    </main>
  );
}
