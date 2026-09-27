/**
 * VOID ECHO - LocalStorage Persistence & Progression System
 */

import {
  Achievement,
  AudioSettings,
  AvatarId,
  GameDifficulty,
  GameMode,
  LeaderboardEntry,
  PlayerCustomization,
  PlayerStats,
  TrailStyle,
} from '../types/game';

const STORAGE_KEYS = {
  STATS: 'void_echo_stats_v1',
  CUSTOMIZATION: 'void_echo_customization_v1',
  UNLOCKED_AVATARS: 'void_echo_unlocked_avatars_v1',
  UNLOCKED_TRAILS: 'void_echo_unlocked_trails_v1',
  UNLOCKED_COSMETICS: 'void_echo_unlocked_cosmetics_v1',
  ACHIEVEMENTS: 'void_echo_achievements_v1',
  LEADERBOARD: 'void_echo_leaderboard_v1',
  AUDIO_SETTINGS: 'void_echo_audio_v1',
  TOUCH_SETTINGS: 'void_echo_touch_v1',
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_run',
    title: 'Void Initiate',
    description: 'Complete your first run in VOID ECHO.',
    unlocked: false,
    icon: '⚡',
    rewardShards: 50,
  },
  {
    id: 'trail_master',
    title: 'Trail Master',
    description: 'Survive for more than 45 seconds in a single run.',
    unlocked: false,
    icon: '⏳',
    rewardShards: 100,
  },
  {
    id: 'near_miss_pro',
    title: 'Razor Edge',
    description: 'Perform 10 Near-Misses in a single game.',
    unlocked: false,
    icon: '🎯',
    rewardShards: 120,
  },
  {
    id: 'burst_tactician',
    title: 'Shockwave King',
    description: 'Stun 5 or more enemies with Echo Burst.',
    unlocked: false,
    icon: '💥',
    rewardShards: 100,
  },
  {
    id: 'decoy_artist',
    title: 'Phantom Illusionist',
    description: 'Distract 3 hunters with a single Phantom Flare.',
    unlocked: false,
    icon: '✨',
    rewardShards: 120,
  },
  {
    id: 'orb_collector',
    title: 'Orb Overcharger',
    description: 'Collect 30 energy orbs in one match.',
    unlocked: false,
    icon: '🔮',
    rewardShards: 150,
  },
  {
    id: 'combo_king',
    title: 'Overdrive 8x',
    description: 'Reach maximum 8x combo multiplier.',
    unlocked: false,
    icon: '🔥',
    rewardShards: 200,
  },
  {
    id: 'sudden_death_survivor',
    title: 'Sudden Death Conqueror',
    description: 'Survive in Sudden Death mode for 20 seconds.',
    unlocked: false,
    icon: '💀',
    rewardShards: 250,
  },
  {
    id: 'trail_wall_barrier',
    title: 'Weaver of Barriers',
    description: 'Form a Trail Wall by looping your echo.',
    unlocked: false,
    icon: '🛡️',
    rewardShards: 100,
  },
  {
    id: 'fast_champion',
    title: 'Hyperspeed Master',
    description: 'Achieve 5,000 points on Fast difficulty.',
    unlocked: false,
    icon: '🚀',
    rewardShards: 300,
  },
  {
    id: 'multiplayer_victor',
    title: 'Arena Gladiator',
    description: 'Win a Hunter vs Runner match.',
    unlocked: false,
    icon: '🏆',
    rewardShards: 150,
  },
  {
    id: 'zen_master',
    title: 'Ghost Zen',
    description: 'Trigger the Zen Ghost Aura state.',
    unlocked: false,
    icon: '☯️',
    rewardShards: 180,
  },
];

export const INITIAL_STATS: PlayerStats = {
  totalRuns: 0,
  totalScore: 0,
  highScore: 0,
  totalSurvivalSeconds: 0,
  totalOrbsCollected: 0,
  totalNearMisses: 0,
  totalEnemiesStunned: 0,
  totalMatchesWon: 0,
  level: 1,
  currentXp: 0,
  nextLevelXp: 500,
  voidShards: 150, // Starting bonus shards
};

export const INITIAL_CUSTOMIZATION: PlayerCustomization = {
  avatarId: 'cyber_fox',
  primaryColor: '#06b6d4', // Cyan
  glowColor: '#38bdf8',
  trailStyle: 'ribbon',
  cosmeticId: 'visor',
};

// Seed leaderboard entries for rich initial arcade feel
export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lb_1',
    playerName: 'CYBER_V0ID',
    score: 18450,
    mode: 'survival',
    difficulty: 'fast',
    survivalTimeSeconds: 142,
    date: '2026-09-24',
    avatarId: 'void_knight',
    nearMisses: 24,
  },
  {
    id: 'lb_2',
    playerName: 'NEON_GHOST',
    score: 14200,
    mode: 'survival',
    difficulty: 'medium',
    survivalTimeSeconds: 120,
    date: '2026-09-25',
    avatarId: 'shadow_ninja',
    nearMisses: 19,
  },
  {
    id: 'lb_3',
    playerName: 'PHANTOM_FOX',
    score: 11800,
    mode: 'survival',
    difficulty: 'medium',
    survivalTimeSeconds: 98,
    date: '2026-09-26',
    avatarId: 'cyber_fox',
    nearMisses: 15,
  },
  {
    id: 'lb_4',
    playerName: 'ASTRO_PAW',
    score: 8950,
    mode: 'hunter_runner',
    difficulty: 'medium',
    survivalTimeSeconds: 88,
    date: '2026-09-27',
    avatarId: 'astro_cat',
    nearMisses: 12,
  },
  {
    id: 'lb_5',
    playerName: 'PULSE_BUNNY',
    score: 6400,
    mode: 'survival',
    difficulty: 'slow',
    survivalTimeSeconds: 75,
    date: '2026-09-27',
    avatarId: 'robo_bunny',
    nearMisses: 9,
  },
];

class StorageService {
  // Stats & Progression
  public getStats(): PlayerStats {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATS);
      return data ? { ...INITIAL_STATS, ...JSON.parse(data) } : INITIAL_STATS;
    } catch {
      return INITIAL_STATS;
    }
  }

  public saveStats(stats: PlayerStats) {
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch {
      // Ignore storage errors
    }
  }

  public addXpAndShards(xpToAdd: number, shardsToAdd: number): { leveledUp: boolean; newStats: PlayerStats } {
    const stats = this.getStats();
    let { level, currentXp, nextLevelXp, voidShards } = stats;
    let leveledUp = false;

    currentXp += xpToAdd;
    voidShards += shardsToAdd;

    while (currentXp >= nextLevelXp) {
      currentXp -= nextLevelXp;
      level += 1;
      nextLevelXp = Math.floor(nextLevelXp * 1.35);
      voidShards += 100; // Bonus shards on level up
      leveledUp = true;
    }

    const newStats: PlayerStats = {
      ...stats,
      level,
      currentXp,
      nextLevelXp,
      voidShards,
    };

    this.saveStats(newStats);
    return { leveledUp, newStats };
  }

  // Customization
  public getCustomization(): PlayerCustomization {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMIZATION);
      return data ? { ...INITIAL_CUSTOMIZATION, ...JSON.parse(data) } : INITIAL_CUSTOMIZATION;
    } catch {
      return INITIAL_CUSTOMIZATION;
    }
  }

  public saveCustomization(customization: PlayerCustomization) {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMIZATION, JSON.stringify(customization));
    } catch {
      // Ignore
    }
  }

  // Unlocks
  public getUnlockedAvatars(): AvatarId[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.UNLOCKED_AVATARS);
      return data ? JSON.parse(data) : ['cyber_fox', 'astro_cat'];
    } catch {
      return ['cyber_fox', 'astro_cat'];
    }
  }

  public unlockAvatar(id: AvatarId) {
    const current = this.getUnlockedAvatars();
    if (!current.includes(id)) {
      current.push(id);
      try {
        localStorage.setItem(STORAGE_KEYS.UNLOCKED_AVATARS, JSON.stringify(current));
      } catch {
        // Ignore
      }
    }
  }

  public getUnlockedTrails(): TrailStyle[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.UNLOCKED_TRAILS);
      return data ? JSON.parse(data) : ['ribbon', 'circuit'];
    } catch {
      return ['ribbon', 'circuit'];
    }
  }

  public unlockTrail(style: TrailStyle) {
    const current = this.getUnlockedTrails();
    if (!current.includes(style)) {
      current.push(style);
      try {
        localStorage.setItem(STORAGE_KEYS.UNLOCKED_TRAILS, JSON.stringify(current));
      } catch {
        // Ignore
      }
    }
  }

  // Achievements
  public getAchievements(): Achievement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (!data) return INITIAL_ACHIEVEMENTS;
      const parsed = JSON.parse(data) as Achievement[];
      // Merge in case schema changed
      return INITIAL_ACHIEVEMENTS.map(initial => {
        const found = parsed.find(p => p.id === initial.id);
        return found ? found : initial;
      });
    } catch {
      return INITIAL_ACHIEVEMENTS;
    }
  }

  public unlockAchievement(id: string): Achievement | null {
    const achievements = this.getAchievements();
    const item = achievements.find(a => a.id === id);
    if (item && !item.unlocked) {
      item.unlocked = true;
      item.unlockedAt = new Date().toISOString();
      try {
        localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
      } catch {
        // Ignore
      }
      this.addXpAndShards(200, item.rewardShards);
      return item;
    }
    return null;
  }

  // Leaderboard
  public getLeaderboard(): LeaderboardEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
      return data ? JSON.parse(data) : INITIAL_LEADERBOARD;
    } catch {
      return INITIAL_LEADERBOARD;
    }
  }

  public addLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'date'>) {
    const leaderboard = this.getLeaderboard();
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: 'lb_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
    };
    leaderboard.push(newEntry);
    leaderboard.sort((a, b) => b.score - a.score);
    // Keep top 30
    const trimmed = leaderboard.slice(0, 30);
    try {
      localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(trimmed));
    } catch {
      // Ignore
    }
  }

  // Audio Settings
  public getAudioSettings(): AudioSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIO_SETTINGS);
      return data ? JSON.parse(data) : { masterVolume: 0.75, musicVolume: 0.65, sfxVolume: 0.8, isMuted: false };
    } catch {
      return { masterVolume: 0.75, musicVolume: 0.65, sfxVolume: 0.8, isMuted: false };
    }
  }

  public saveAudioSettings(settings: AudioSettings) {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIO_SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }

  // Virtual Joystick Setting
  public getTouchControlPreference(): boolean {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TOUCH_SETTINGS);
      if (data !== null) return JSON.parse(data);
      // Auto-detect touch device
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    } catch {
      return false;
    }
  }

  public saveTouchControlPreference(enabled: boolean) {
    try {
      localStorage.setItem(STORAGE_KEYS.TOUCH_SETTINGS, JSON.stringify(enabled));
    } catch {
      // Ignore
    }
  }
}

export const storageService = new StorageService();
