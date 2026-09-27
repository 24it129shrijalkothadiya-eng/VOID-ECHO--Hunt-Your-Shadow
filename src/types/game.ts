/**
 * VOID ECHO - Core Type Definitions
 */

export type GameDifficulty = 'slow' | 'medium' | 'fast';

export type GameMode = 'survival' | 'hunter_runner' | 'sudden_death' | 'tutorial';

export type AuraState = 'neutral' | 'speed_surge' | 'frenzy_overdrive' | 'zen_ghost';

export type AvatarId = 
  | 'cyber_fox'
  | 'astro_cat'
  | 'robo_bunny'
  | 'neon_panda'
  | 'pixel_dragon'
  | 'shadow_ninja'
  | 'space_pirate'
  | 'void_knight';

export type TrailStyle = 'ribbon' | 'circuit' | 'stardust' | 'hex' | 'flame';

export type CosmeticId = 'none' | 'visor' | 'horns' | 'halo' | 'scarf' | 'wings';

export type EnemyType = 'stalker' | 'hunter' | 'glitcher' | 'elite';

export interface Vector2D {
  x: number;
  y: number;
}

export interface EchoTrailPoint {
  x: number;
  y: number;
  createdAt: number; // timestamp in ms
  playerId: number;
  color: string;
  style: TrailStyle;
  intensity: number;
}

export interface TrailWall {
  id: string;
  p1: Vector2D;
  p2: Vector2D;
  createdAt: number;
  durationMs: number;
  color: string;
  health: number;
}

export interface PlayerCharacter {
  id: number;
  name: string;
  isHuman: boolean;
  role: 'runner' | 'hunter';
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  angle: number;
  radius: number;
  avatarId: AvatarId;
  color: string;
  trailStyle: TrailStyle;
  cosmeticId: CosmeticId;
  isAlive: boolean;
  score: number;
  combo: number;
  comboTimer: number;
  aura: AuraState;
  auraTimer: number;
  burstCooldown: number; // in ms remaining
  flareCooldown: number;
  nearMissCount: number;
  orbsCollected: number;
  taggedCount: number;
  controlScheme?: 'mouse' | 'wasd' | 'arrows' | 'touch' | 'bot';
  expression: 'normal' | 'focused' | 'shocked' | 'victorious';
  expressionTimer: number;
}

export interface EnemyEntity {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  angle: number;
  radius: number;
  targetPoint: Vector2D | null;
  state: 'chasing_echo' | 'hunting' | 'stunned' | 'pouncing';
  stunTimer: number;
  color: string;
  glow: string;
  radarAngle: number;
  eliteVariant?: boolean;
}

export interface CollectibleOrb {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  pulsePhase: number;
  type: 'standard' | 'super' | 'shield' | 'multiplier';
  points: number;
}

export interface DecoyFlare {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  alpha: number;
  shape?: 'circle' | 'square' | 'spark' | 'hex';
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  width: number;
  opacity: number;
  damageRadius: number;
}

export interface FloatingNotification {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  scale: number;
  duration: number;
}

export interface EchoAlly {
  id: string;
  x: number;
  y: number;
  targetOrb: CollectibleOrb | null;
  angle: number;
  life: number;
  maxLife: number;
}

export interface DeathArtStroke {
  points: Vector2D[];
  color: string;
  width: number;
  alpha: number;
  type: 'player_trail' | 'enemy_path' | 'burst_ring' | 'near_miss';
}

export interface MatchSettings {
  mode: GameMode;
  difficulty: GameDifficulty;
  matchDurationSeconds: number; // 60, 90, 120, 180, 0 = endless
  numPlayers: number; // 1 to 4
  numHunters: number;
  numRunners: number;
  botsEnabled: boolean;
  tiltPerspective: boolean;
}

export interface PlayerCustomization {
  avatarId: AvatarId;
  primaryColor: string;
  glowColor: string;
  trailStyle: TrailStyle;
  cosmeticId: CosmeticId;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  icon: string;
  rewardShards: number;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  mode: GameMode;
  difficulty: GameDifficulty;
  survivalTimeSeconds: number;
  date: string;
  avatarId: AvatarId;
  nearMisses: number;
}

export interface PlayerStats {
  totalRuns: number;
  totalScore: number;
  highScore: number;
  totalSurvivalSeconds: number;
  totalOrbsCollected: number;
  totalNearMisses: number;
  totalEnemiesStunned: number;
  totalMatchesWon: number;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  voidShards: number;
}

export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  isMuted: boolean;
}
