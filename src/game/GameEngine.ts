/**
 * VOID ECHO - Core Game Engine
 * High-performance 60fps HTML5 Canvas Engine with Echo-tracking AI,
 * dynamic particles, Trail Weaving Walls, abilities, and Death Art generation.
 */

import {
  AuraState,
  CollectibleOrb,
  DeathArtStroke,
  DecoyFlare,
  EchoAlly,
  EchoTrailPoint,
  EnemyEntity,
  EnemyType,
  FloatingNotification,
  MatchSettings,
  Particle,
  PlayerCharacter,
  Shockwave,
  TrailWall,
  Vector2D,
} from '../types/game';
import { drawAvatar } from '../services/avatarDefinitions';
import { soundEngine } from '../services/soundEngine';
import { storageService } from '../services/storage';

export interface GameEngineCallbacks {
  onScoreUpdate: (score: number, combo: number, multiplier: number) => void;
  onTimeUpdate: (secondsLeft: number, isSuddenDeath: boolean) => void;
  onGameOver: (artStrokes: DeathArtStroke[], stats: GameRunStats) => void;
  onNotification: (text: string, color: string) => void;
  onAbilityCooldown: (burstPct: number, flarePct: number) => void;
  onAuraChange: (aura: AuraState) => void;
  onMultiplayerScore?: (scores: { id: number; name: string; score: number; isAlive: boolean; role: string }[]) => void;
}

export interface GameRunStats {
  score: number;
  survivalSeconds: number;
  nearMisses: number;
  orbsCollected: number;
  enemiesStunned: number;
  maxCombo: number;
  winnerTeam?: 'runners' | 'hunters';
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameEngineCallbacks;
  private settings: MatchSettings;

  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0;

  // Arena Geometry
  private width: number = 1200;
  private height: number = 800;
  private dpr: number = 1;

  // Game Clock & Duration
  private matchTimeElapsedMs: number = 0;
  private matchDurationMs: number = 90000;
  private isSuddenDeath: boolean = false;

  // Game Entities
  private players: PlayerCharacter[] = [];
  private enemies: EnemyEntity[] = [];
  private trailPoints: EchoTrailPoint[] = [];
  private trailWalls: TrailWall[] = [];
  private orbs: CollectibleOrb[] = [];
  private flares: DecoyFlare[] = [];
  private particles: Particle[] = [];
  private shockwaves: Shockwave[] = [];
  private notifications: FloatingNotification[] = [];
  private allies: EchoAlly[] = [];

  // Death Art Vector Recording
  private deathArtStrokes: DeathArtStroke[] = [];
  private runStats: GameRunStats = {
    score: 0,
    survivalSeconds: 0,
    nearMisses: 0,
    orbsCollected: 0,
    enemiesStunned: 0,
    maxCombo: 1,
  };

  // Input State
  private pointerPos: Vector2D = { x: 600, y: 400 };
  private keysPressed: Record<string, boolean> = {};
  private joystickVector: Vector2D = { x: 0, y: 0 };

  // Spawners & Timers
  private orbSpawnTimer: number = 0;
  private enemySpawnTimer: number = 0;
  private trailDropTimer: number = 0;
  private wallCheckTimer: number = 0;

  // Trail duration based on difficulty
  private trailDurationMs: number = 5000;

  constructor(
    canvas: HTMLCanvasElement,
    settings: MatchSettings,
    callbacks: GameEngineCallbacks
  ) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;
    this.settings = settings;
    this.callbacks = callbacks;

    this.configureDifficulty();
    this.resizeCanvas();
    this.initEntities();
    this.bindEvents();
  }

  private configureDifficulty() {
    if (this.settings.difficulty === 'slow') {
      this.trailDurationMs = 6500;
    } else if (this.settings.difficulty === 'fast') {
      this.trailDurationMs = 3500;
    } else {
      this.trailDurationMs = 5000; // Medium / Default
    }

    if (this.settings.matchDurationSeconds > 0) {
      this.matchDurationMs = this.settings.matchDurationSeconds * 1000;
    } else {
      this.matchDurationMs = 0; // Endless
    }
  }

  public resizeCanvas() {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = parent.clientWidth || 1200;
    this.height = parent.clientHeight || 800;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.resetTransform();
    this.ctx.scale(this.dpr, this.dpr);
  }

  public start() {
    this.isRunning = true;
    this.isPaused = false;
    this.lastTimestamp = performance.now();
    soundEngine.startMusic();
    this.loop(this.lastTimestamp);
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    soundEngine.stopMusic();
    this.unbindEvents();
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
    if (!paused) {
      this.lastTimestamp = performance.now();
      if (this.isRunning && this.animationFrameId === null) {
        this.loop(this.lastTimestamp);
      }
    }
  }

  public setJoystickInput(x: number, y: number) {
    this.joystickVector = { x, y };
  }

  public triggerAbility(type: 'burst' | 'flare', playerId: number = 1) {
    const player = this.players.find(p => p.id === playerId);
    if (!player || !player.isAlive) return;

    if (type === 'burst' && player.burstCooldown <= 0) {
      this.activateEchoBurst(player);
    } else if (type === 'flare' && player.flareCooldown <= 0) {
      this.activatePhantomFlare(player);
    }
  }

  // --- Initialization ---
  private initEntities() {
    this.players = [];
    this.enemies = [];
    this.trailPoints = [];
    this.trailWalls = [];
    this.orbs = [];
    this.flares = [];
    this.particles = [];
    this.shockwaves = [];
    this.notifications = [];
    this.allies = [];
    this.deathArtStrokes = [];

    const customization = storageService.getCustomization();

    // Create Players (1 to 4)
    const numPlayers = Math.max(1, Math.min(4, this.settings.numPlayers));
    for (let i = 0; i < numPlayers; i++) {
      const isP1 = i === 0;
      let role: 'runner' | 'hunter' = 'runner';

      if (this.settings.mode === 'hunter_runner') {
        role = i < this.settings.numRunners ? 'runner' : 'hunter';
      }

      const player: PlayerCharacter = {
        id: i + 1,
        name: isP1 ? 'Player 1' : `Agent ${i + 1}`,
        isHuman: isP1,
        role,
        x: this.width * 0.5 + (i - (numPlayers - 1) / 2) * 80,
        y: this.height * 0.5,
        vx: 0,
        vy: 0,
        speed: 4.8,
        angle: 0,
        radius: 18,
        avatarId: isP1 ? customization.avatarId : i % 2 === 0 ? 'astro_cat' : 'robo_bunny',
        color: isP1 ? customization.primaryColor : i === 1 ? '#a855f7' : i === 2 ? '#ec4899' : '#eab308',
        trailStyle: isP1 ? customization.trailStyle : 'circuit',
        cosmeticId: isP1 ? customization.cosmeticId : 'none',
        isAlive: true,
        score: 0,
        combo: 1,
        comboTimer: 0,
        aura: 'neutral',
        auraTimer: 0,
        burstCooldown: 0,
        flareCooldown: 0,
        nearMissCount: 0,
        orbsCollected: 0,
        taggedCount: 0,
        controlScheme: isP1 ? 'mouse' : 'bot',
        expression: 'normal',
        expressionTimer: 0,
      };

      this.players.push(player);
    }

    // Spawn Initial Orbs
    for (let i = 0; i < 8; i++) {
      this.spawnOrb();
    }

    // Spawn Initial Enemies
    const initialEnemies = this.settings.difficulty === 'slow' ? 2 : this.settings.difficulty === 'fast' ? 4 : 3;
    for (let i = 0; i < initialEnemies; i++) {
      this.spawnEnemy(i === 0 ? 'stalker' : i === 1 ? 'hunter' : 'glitcher');
    }

    // Spawn Friendly Echo Ally in Survival mode
    if (this.settings.mode === 'survival') {
      this.allies.push({
        id: 'ally_1',
        x: this.width * 0.5 - 40,
        y: this.height * 0.5 - 40,
        targetOrb: null,
        angle: 0,
        life: 60000,
        maxLife: 60000,
      });
    }

    this.pointerPos = { x: this.players[0].x, y: this.players[0].y };
  }

  // --- Main 60fps Loop ---
  private loop = (timestamp: number) => {
    if (!this.isRunning) return;

    const deltaMs = Math.min(timestamp - this.lastTimestamp, 60);
    this.lastTimestamp = timestamp;

    if (!this.isPaused) {
      this.update(deltaMs, timestamp);
    }

    this.render(timestamp);

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  // --- Logic Updates ---
  private update(deltaMs: number, timeMs: number) {
    this.matchTimeElapsedMs += deltaMs;

    // Check Match Duration & Sudden Death
    if (this.matchDurationMs > 0) {
      const remainingMs = Math.max(0, this.matchDurationMs - this.matchTimeElapsedMs);
      const remainingSeconds = Math.ceil(remainingMs / 1000);

      // Sudden Death at last 25 seconds
      if (remainingSeconds <= 25 && !this.isSuddenDeath) {
        this.triggerSuddenDeath();
      }

      this.callbacks.onTimeUpdate(remainingSeconds, this.isSuddenDeath);

      if (remainingMs <= 0) {
        this.concludeMatch('time_out');
        return;
      }
    } else {
      this.callbacks.onTimeUpdate(Math.floor(this.matchTimeElapsedMs / 1000), this.isSuddenDeath);
    }

    // 1. Update Players
    this.updatePlayers(deltaMs, timeMs);

    // 2. Trail Generation & Aging
    this.updateEchoTrail(deltaMs, timeMs);

    // 3. Trail Weaving Detection (forms defensive barrier walls)
    this.updateTrailWeaving(timeMs);

    // 4. Update Enemies (THE KEY MECHANIC: Enemies chase the Echo Trail, not the player!)
    this.updateEnemies(deltaMs, timeMs);

    // 5. Update Decoy Flares
    this.updateFlares(deltaMs);

    // 6. Update Echo Allies
    this.updateAllies(deltaMs);

    // 7. Update Orbs & Spawners
    this.updateOrbs(deltaMs);

    // 8. Update Particles & Shockwaves
    this.updateVfx(deltaMs);

    // 9. Dynamic Chase Audio Intensity
    this.updateAudioTension();

    // 10. Update Ability Cooldowns HUD
    const p1 = this.players[0];
    if (p1) {
      const maxBurstCd = 9000;
      const maxFlareCd = 12000;
      const burstPct = Math.max(0, 1 - p1.burstCooldown / maxBurstCd);
      const flarePct = Math.max(0, 1 - p1.flareCooldown / maxFlareCd);
      this.callbacks.onAbilityCooldown(burstPct, flarePct);
    }
  }

  // --- Player Physics & Control ---
  private updatePlayers(deltaMs: number, timeMs: number) {
    const p1 = this.players[0];

    for (const player of this.players) {
      if (!player.isAlive) continue;

      // Cooldowns
      if (player.burstCooldown > 0) player.burstCooldown -= deltaMs;
      if (player.flareCooldown > 0) player.flareCooldown -= deltaMs;

      // Aura timer
      if (player.auraTimer > 0) {
        player.auraTimer -= deltaMs;
        if (player.auraTimer <= 0) {
          player.aura = 'neutral';
          if (player.id === 1) this.callbacks.onAuraChange('neutral');
        }
      }

      // Combo countdown
      if (player.comboTimer > 0) {
        player.comboTimer -= deltaMs;
        if (player.comboTimer <= 0 && player.combo > 1) {
          player.combo = 1;
          if (player.id === 1) {
            this.callbacks.onScoreUpdate(player.score, player.combo, 1);
          }
        }
      }

      // Expression reset
      if (player.expressionTimer > 0) {
        player.expressionTimer -= deltaMs;
        if (player.expressionTimer <= 0) {
          player.expression = 'normal';
        }
      }

      let targetX = player.x;
      let targetY = player.y;

      if (player.isHuman) {
        // Human Player 1 Controls: Mouse / Virtual Joystick / WASD
        let moveX = 0;
        let moveY = 0;

        if (this.keysPressed['KeyW'] || this.keysPressed['ArrowUp']) moveY -= 1;
        if (this.keysPressed['KeyS'] || this.keysPressed['ArrowDown']) moveY += 1;
        if (this.keysPressed['KeyA'] || this.keysPressed['ArrowLeft']) moveX -= 1;
        if (this.keysPressed['KeyD'] || this.keysPressed['ArrowRight']) moveX += 1;

        if (this.joystickVector.x !== 0 || this.joystickVector.y !== 0) {
          moveX = this.joystickVector.x;
          moveY = this.joystickVector.y;
        }

        if (moveX !== 0 || moveY !== 0) {
          const len = Math.hypot(moveX, moveY);
          const nx = moveX / (len || 1);
          const ny = moveY / (len || 1);
          targetX = player.x + nx * player.speed * (deltaMs / 16.6);
          targetY = player.y + ny * player.speed * (deltaMs / 16.6);
        } else {
          // Mouse Tracking: Smooth lerp toward mouse cursor
          targetX = this.pointerPos.x;
          targetY = this.pointerPos.y;
        }
      } else {
        // AI Bot Players (for multiplayer matches or bot companions)
        this.updateBotPlayer(player, deltaMs, timeMs);
        targetX = player.x + player.vx;
        targetY = player.y + player.vy;
      }

      // Smooth movement interpolation
      const dx = targetX - player.x;
      const dy = targetY - player.y;
      const dist = Math.hypot(dx, dy);

      let effectiveSpeed = player.speed;
      if (player.aura === 'speed_surge') effectiveSpeed *= 1.35;
      if (player.aura === 'frenzy_overdrive') effectiveSpeed *= 1.5;

      if (dist > 3) {
        const step = Math.min(dist, effectiveSpeed * (deltaMs / 16.6));
        player.vx = (dx / dist) * step;
        player.vy = (dy / dist) * step;
        player.x += player.vx;
        player.y += player.vy;
        player.angle = Math.atan2(dy, dx);
      } else {
        player.vx = 0;
        player.vy = 0;
      }

      // Constrain inside arena
      const pad = player.radius + 6;
      player.x = Math.max(pad, Math.min(this.width - pad, player.x));
      player.y = Math.max(pad, Math.min(this.height - pad, player.y));
    }

    if (p1 && p1.isAlive) {
      this.runStats.survivalSeconds = Math.floor(this.matchTimeElapsedMs / 1000);
    }
  }

  private updateBotPlayer(bot: PlayerCharacter, deltaMs: number, timeMs: number) {
    if (bot.role === 'runner') {
      // Runner Bot: Avoid nearby enemies, steer toward closest orb
      let fleeX = 0;
      let fleeY = 0;
      for (const enemy of this.enemies) {
        const d = Math.hypot(bot.x - enemy.x, bot.y - enemy.y);
        if (d < 160) {
          fleeX += (bot.x - enemy.x) / (d || 1);
          fleeY += (bot.y - enemy.y) / (d || 1);
        }
      }

      if (fleeX !== 0 || fleeY !== 0) {
        const mag = Math.hypot(fleeX, fleeY);
        bot.vx = (fleeX / mag) * bot.speed;
        bot.vy = (fleeY / mag) * bot.speed;
      } else if (this.orbs.length > 0) {
        // Collect closest orb
        let closest = this.orbs[0];
        let minDist = 9999;
        for (const orb of this.orbs) {
          const d = Math.hypot(bot.x - orb.x, bot.y - orb.y);
          if (d < minDist) {
            minDist = d;
            closest = orb;
          }
        }
        const angle = Math.atan2(closest.y - bot.y, closest.x - bot.x);
        bot.vx = Math.cos(angle) * (bot.speed * 0.85);
        bot.vy = Math.sin(angle) * (bot.speed * 0.85);
      }
    } else {
      // Hunter Bot: Chases runner echo trails!
      const runnerTrails = this.trailPoints.filter(p => {
        const owner = this.players.find(pl => pl.id === p.playerId);
        return owner && owner.role === 'runner';
      });

      if (runnerTrails.length > 0) {
        const target = runnerTrails[runnerTrails.length - 1];
        const angle = Math.atan2(target.y - bot.y, target.x - bot.x);
        bot.vx = Math.cos(angle) * (bot.speed * 0.95);
        bot.vy = Math.sin(angle) * (bot.speed * 0.95);
      } else {
        // Patrol
        bot.vx = Math.cos(timeMs * 0.002 + bot.id) * 2.5;
        bot.vy = Math.sin(timeMs * 0.002 + bot.id) * 2.5;
      }
    }
  }

  // --- Echo Trail Mechanics ---
  private updateEchoTrail(deltaMs: number, timeMs: number) {
    this.trailDropTimer += deltaMs;

    // Drop new trail node every ~45ms if player is moving
    if (this.trailDropTimer >= 45) {
      this.trailDropTimer = 0;

      for (const player of this.players) {
        if (!player.isAlive) continue;
        const speed = Math.hypot(player.vx, player.vy);

        if (speed > 0.4) {
          this.trailPoints.push({
            x: player.x,
            y: player.y,
            createdAt: timeMs,
            playerId: player.id,
            color: player.color,
            style: player.trailStyle,
            intensity: 1,
          });

          // Record stroke for Death Art
          if (this.deathArtStrokes.length === 0 || this.deathArtStrokes[this.deathArtStrokes.length - 1].points.length > 25) {
            this.deathArtStrokes.push({
              points: [{ x: player.x, y: player.y }],
              color: player.color,
              width: 3,
              alpha: 0.8,
              type: 'player_trail',
            });
          } else {
            this.deathArtStrokes[this.deathArtStrokes.length - 1].points.push({ x: player.x, y: player.y });
          }
        }
      }
    }

    // Age and expire trail nodes that exceed the 5-second lifetime
    const cutoff = timeMs - this.trailDurationMs;
    this.trailPoints = this.trailPoints.filter(p => p.createdAt >= cutoff);
  }

  // --- Trail Weaving Walls ---
  private updateTrailWeaving(timeMs: number) {
    this.wallCheckTimer += 1;
    if (this.wallCheckTimer % 8 !== 0) return;

    // Remove expired walls
    this.trailWalls = this.trailWalls.filter(w => timeMs - w.createdAt < w.durationMs && w.health > 0);

    // If player trail loops back on itself within recent 2.5s, create an energy Trail Wall
    const p1Trails = this.trailPoints.filter(p => p.playerId === 1);
    if (p1Trails.length < 12) return;

    const head = p1Trails[p1Trails.length - 1];
    // Check against earlier points in the trail
    for (let i = 0; i < p1Trails.length - 8; i++) {
      const older = p1Trails[i];
      const dist = Math.hypot(head.x - older.x, head.y - older.y);

      // Loop detected!
      if (dist < 32 && this.trailWalls.length < 4) {
        const wallId = 'wall_' + timeMs;
        const exists = this.trailWalls.some(w => Math.hypot(w.p1.x - head.x, w.p1.y - head.y) < 50);
        if (!exists) {
          this.trailWalls.push({
            id: wallId,
            p1: { x: older.x, y: older.y },
            p2: { x: head.x, y: head.y },
            createdAt: timeMs,
            durationMs: 4500,
            color: '#38bdf8',
            health: 3,
          });

          this.addNotification('TRAIL WALL FORMED!', '#38bdf8', head.x, head.y);
          storageService.unlockAchievement('trail_wall_barrier');
          this.createSparkles(head.x, head.y, '#38bdf8', 12);
        }
        break;
      }
    }
  }

  // --- Enemy Intelligence & Echo Shadow Chasing ---
  private updateEnemies(deltaMs: number, timeMs: number) {
    this.enemySpawnTimer += deltaMs;
    const spawnInterval = this.isSuddenDeath ? 7000 : this.settings.difficulty === 'fast' ? 10000 : 14000;

    if (this.enemySpawnTimer >= spawnInterval && this.enemies.length < (this.isSuddenDeath ? 12 : 8)) {
      this.enemySpawnTimer = 0;
      const types: EnemyType[] = ['stalker', 'hunter', 'glitcher'];
      if (this.matchTimeElapsedMs > 30000 || this.isSuddenDeath) {
        types.push('elite');
      }
      const pick = types[Math.floor(Math.random() * types.length)];
      this.spawnEnemy(pick);
    }

    const runners = this.players.filter(p => p.role === 'runner' && p.isAlive);
    const p1 = this.players[0];

    for (const enemy of this.enemies) {
      // 1. Stun status
      if (enemy.stunTimer > 0) {
        enemy.stunTimer -= deltaMs;
        if (enemy.stunTimer <= 0) {
          enemy.state = 'hunting';
        }
        continue;
      }

      // 2. Check for Decoy Flares (Highest priority distraction)
      let activeDecoy: DecoyFlare | null = null;
      if (this.flares.length > 0) {
        activeDecoy = this.flares[0];
      }

      // 3. TARGET RESOLUTION:
      // CRITICAL CORE MECHANIC: Enemies CANNOT see the player!
      // They ONLY see:
      //  A) The Decoy Flare (if active)
      //  B) Echo Trail Points left behind by Runners in the past 5 seconds!
      let targetPoint: Vector2D | null = null;

      if (activeDecoy) {
        targetPoint = { x: activeDecoy.x, y: activeDecoy.y };
        enemy.state = 'chasing_echo';
      } else {
        // Filter trail points from surviving runners
        const relevantTrails = this.trailPoints.filter(tp => {
          const owner = this.players.find(p => p.id === tp.playerId);
          return owner && owner.isAlive && owner.role === 'runner';
        });

        if (relevantTrails.length > 0) {
          if (enemy.type === 'stalker') {
            // Stalker: Sniffs and charges the NEWEST echo trail point
            targetPoint = relevantTrails[relevantTrails.length - 1];
          } else if (enemy.type === 'hunter') {
            // Hunter: Sweeps radar cone and intercepts intermediate interpolated path
            const midIndex = Math.floor(relevantTrails.length * 0.7);
            targetPoint = relevantTrails[midIndex];
          } else if (enemy.type === 'glitcher') {
            // Glitcher: Attacks random point along the trail
            const randIndex = Math.floor(Math.random() * relevantTrails.length);
            targetPoint = relevantTrails[randIndex];
          } else {
            // Elite: Accelerates directly toward the freshest trail cluster
            targetPoint = relevantTrails[relevantTrails.length - 1];
          }
          enemy.state = 'chasing_echo';
        } else {
          // No trail exists (player stood still or used Echo Burst)!
          // Enemy loses scent, wanders blindly or stalks last known position
          enemy.state = 'hunting';
          if (!enemy.targetPoint) {
            enemy.targetPoint = {
              x: enemy.x + (Math.random() - 0.5) * 200,
              y: enemy.y + (Math.random() - 0.5) * 200,
            };
          }
          targetPoint = enemy.targetPoint;
        }
      }

      // 4. Enemy Movement Toward Echo Target
      if (targetPoint) {
        const dx = targetPoint.x - enemy.x;
        const dy = targetPoint.y - enemy.y;
        const dist = Math.hypot(dx, dy);

        let speed = enemy.speed;
        if (this.isSuddenDeath) speed *= 1.3;

        if (dist > 6) {
          const step = Math.min(dist, speed * (deltaMs / 16.6));
          enemy.vx = (dx / dist) * step;
          enemy.vy = (dy / dist) * step;
          enemy.x += enemy.vx;
          enemy.y += enemy.vy;
          enemy.angle = Math.atan2(dy, dx);
        }
      }

      // Constrain inside arena
      enemy.x = Math.max(enemy.radius, Math.min(this.width - enemy.radius, enemy.x));
      enemy.y = Math.max(enemy.radius, Math.min(this.height - enemy.radius, enemy.y));

      // 5. Collision with Trail Walls (Repels/stumbles enemies!)
      for (const wall of this.trailWalls) {
        const distToWall = this.pointToSegmentDistance(
          { x: enemy.x, y: enemy.y },
          wall.p1,
          wall.p2
        );
        if (distToWall < enemy.radius + 6) {
          // Bounce enemy away and damage wall
          enemy.x -= enemy.vx * 2;
          enemy.y -= enemy.vy * 2;
          enemy.stunTimer = 600; // brief stumble
          wall.health -= 1;
          this.createSparkles(enemy.x, enemy.y, '#38bdf8', 6);
          soundEngine.playEnemyStun();
        }
      }

      // 6. Near-Miss Detection & Collision with Players
      for (const runner of runners) {
        const distToPlayer = Math.hypot(enemy.x - runner.x, enemy.y - runner.y);

        // Near-Miss: Grazing past enemy within 36px without touching
        if (distToPlayer > runner.radius + enemy.radius && distToPlayer < runner.radius + enemy.radius + 28) {
          this.handleNearMiss(runner, enemy);
        }

        // Direct Touch: CAPTURE / DAMAGE!
        if (distToPlayer <= runner.radius + enemy.radius) {
          if (runner.aura === 'zen_ghost') {
            // Invulnerable! Stuns enemy instead
            enemy.stunTimer = 3000;
            this.createShockwave(enemy.x, enemy.y, '#eab308', 60);
            soundEngine.playEnemyStun();
          } else {
            this.handlePlayerCaptured(runner, enemy);
          }
        }
      }
    }
  }

  // --- Abilities: Echo Burst & Phantom Flare ---
  private activateEchoBurst(player: PlayerCharacter) {
    player.burstCooldown = 9000; // 9s cooldown
    soundEngine.playEchoBurst();

    // 1. Destroy all current trail points belonging to this player!
    this.trailPoints = this.trailPoints.filter(tp => tp.playerId !== player.id);

    // 2. Spawn massive resonant shockwave
    this.createShockwave(player.x, player.y, player.color, 240);

    // 3. Stun all enemies within 220px radius
    let stunnedCount = 0;
    for (const enemy of this.enemies) {
      const d = Math.hypot(enemy.x - player.x, enemy.y - player.y);
      if (d <= 220) {
        enemy.stunTimer = 3800; // 3.8s stun
        enemy.state = 'stunned';
        stunnedCount++;
        this.createSparkles(enemy.x, enemy.y, '#38bdf8', 10);
      }
    }

    this.runStats.enemiesStunned += stunnedCount;
    if (this.runStats.enemiesStunned >= 5) {
      storageService.unlockAchievement('burst_tactician');
    }

    this.addNotification('ECHO BURST!', player.color, player.x, player.y);
    player.expression = 'victorious';
    player.expressionTimer = 800;
  }

  private activatePhantomFlare(player: PlayerCharacter) {
    player.flareCooldown = 12000; // 12s cooldown
    soundEngine.playPhantomFlare();

    // Launch flare beacon forward along current heading
    const angle = player.angle;
    const flare: DecoyFlare = {
      id: 'flare_' + Date.now(),
      x: player.x,
      y: player.y,
      vx: Math.cos(angle) * 7,
      vy: Math.sin(angle) * 7,
      life: 5500, // 5.5s active decoy
      maxLife: 5500,
      color: '#facc15',
    };

    this.flares.push(flare);
    this.addNotification('PHANTOM FLARE DEPLOYED!', '#facc15', player.x, player.y);

    storageService.unlockAchievement('decoy_artist');
    player.expression = 'focused';
    player.expressionTimer = 800;
  }

  private updateFlares(deltaMs: number) {
    for (const flare of this.flares) {
      flare.life -= deltaMs;
      flare.x += flare.vx;
      flare.y += flare.vy;
      flare.vx *= 0.94; // friction
      flare.vy *= 0.94;

      // Emit simulated decoy trail pings
      if (Math.random() < 0.35) {
        this.trailPoints.push({
          x: flare.x + (Math.random() - 0.5) * 16,
          y: flare.y + (Math.random() - 0.5) * 16,
          createdAt: performance.now(),
          playerId: 999, // dummy decoy ID
          color: flare.color,
          style: 'stardust',
          intensity: 1.2,
        });
      }
    }
    this.flares = this.flares.filter(f => f.life > 0);
  }

  // --- Near-Miss System & Emotional Aura States ---
  private handleNearMiss(player: PlayerCharacter, enemy: EnemyEntity) {
    // Cooldown per near-miss check
    if (player.expressionTimer > 0 && player.expression === 'shocked') return;

    player.nearMissCount++;
    this.runStats.nearMisses++;
    player.expression = 'shocked';
    player.expressionTimer = 600;

    // Sound & Points
    soundEngine.playNearMiss();
    const bonus = 250 * player.combo;
    player.score += bonus;
    this.runStats.score = player.score;

    this.addNotification(`NEAR MISS! +${bonus}`, '#f43f5e', player.x, player.y - 20);
    this.createSparkles((player.x + enemy.x) / 2, (player.y + enemy.y) / 2, '#f43f5e', 8);

    // Increase Combo
    player.combo = Math.min(8, player.combo + 1);
    player.comboTimer = 5000;
    this.runStats.maxCombo = Math.max(this.runStats.maxCombo, player.combo);

    if (player.combo === 8) {
      storageService.unlockAchievement('combo_king');
      // Trigger Frenzy Overdrive Aura
      this.triggerAura(player, 'frenzy_overdrive', 6000);
    } else if (player.nearMissCount % 3 === 0) {
      // Trigger Speed Surge Aura
      this.triggerAura(player, 'speed_surge', 4500);
    }

    if (this.runStats.nearMisses >= 10) {
      storageService.unlockAchievement('near_miss_pro');
    }

    if (player.id === 1) {
      this.callbacks.onScoreUpdate(player.score, player.combo, player.combo);
    }
  }

  private triggerAura(player: PlayerCharacter, aura: AuraState, durationMs: number) {
    player.aura = aura;
    player.auraTimer = durationMs;
    if (player.id === 1) {
      this.callbacks.onAuraChange(aura);
    }

    if (aura === 'zen_ghost') {
      storageService.unlockAchievement('zen_master');
      this.addNotification('GHOST ZEN ACTIVATED!', '#eab308', player.x, player.y);
    } else if (aura === 'frenzy_overdrive') {
      this.addNotification('FRENZY OVERDRIVE 8X!', '#f43f5e', player.x, player.y);
    } else if (aura === 'speed_surge') {
      this.addNotification('SPEED SURGE!', '#38bdf8', player.x, player.y);
    }
  }

  // --- Collectible Orbs ---
  private updateOrbs(deltaMs: number) {
    this.orbSpawnTimer += deltaMs;
    if (this.orbSpawnTimer >= 3200 && this.orbs.length < 12) {
      this.orbSpawnTimer = 0;
      this.spawnOrb();
    }

    for (let i = this.orbs.length - 1; i >= 0; i--) {
      const orb = this.orbs[i];
      orb.pulsePhase += deltaMs * 0.005;

      // Magnetic pull toward nearest player
      for (const player of this.players) {
        if (!player.isAlive) continue;
        const dist = Math.hypot(player.x - orb.x, player.y - orb.y);

        if (dist < 110) {
          const pull = (110 - dist) * 0.08;
          orb.x += ((player.x - orb.x) / dist) * pull;
          orb.y += ((player.y - orb.y) / dist) * pull;
        }

        if (dist <= player.radius + orb.radius) {
          // Collected!
          this.collectOrb(player, orb);
          this.orbs.splice(i, 1);
          break;
        }
      }
    }
  }

  private collectOrb(player: PlayerCharacter, orb: CollectibleOrb) {
    soundEngine.playOrbCollect(player.combo);
    player.orbsCollected++;
    this.runStats.orbsCollected++;

    const earned = orb.points * player.combo * (this.isSuddenDeath ? 2 : 1);
    player.score += earned;
    this.runStats.score = player.score;

    this.createSparkles(orb.x, orb.y, orb.color, 10);
    this.addNotification(`+${earned}`, orb.color, orb.x, orb.y);

    if (orb.type === 'shield') {
      this.triggerAura(player, 'zen_ghost', 5000);
    } else if (orb.type === 'multiplier') {
      player.combo = Math.min(8, player.combo + 2);
      player.comboTimer = 6000;
    }

    if (this.runStats.orbsCollected >= 30) {
      storageService.unlockAchievement('orb_collector');
    }

    if (player.id === 1) {
      this.callbacks.onScoreUpdate(player.score, player.combo, player.combo);
    }
  }

  private spawnOrb() {
    const pad = 60;
    const types: CollectibleOrb['type'][] = ['standard', 'standard', 'super', 'multiplier'];
    if (Math.random() < 0.18) types.push('shield');

    const type = types[Math.floor(Math.random() * types.length)];
    let color = '#06b6d4';
    let points = 100;
    let radius = 10;

    if (type === 'super') {
      color = '#ec4899';
      points = 250;
      radius = 13;
    } else if (type === 'multiplier') {
      color = '#f59e0b';
      points = 180;
      radius = 12;
    } else if (type === 'shield') {
      color = '#10b981';
      points = 150;
      radius = 14;
    }

    this.orbs.push({
      id: 'orb_' + Math.random(),
      x: pad + Math.random() * (this.width - pad * 2),
      y: pad + Math.random() * (this.height - pad * 2),
      radius,
      color,
      pulsePhase: Math.random() * Math.PI * 2,
      type,
      points,
    });
  }

  // --- Echo Allies (Companion AI) ---
  private updateAllies(deltaMs: number) {
    for (const ally of this.allies) {
      ally.life -= deltaMs;

      // Find nearest orb to siphon for player
      if (!ally.targetOrb || !this.orbs.includes(ally.targetOrb)) {
        if (this.orbs.length > 0) {
          ally.targetOrb = this.orbs[Math.floor(Math.random() * this.orbs.length)];
        }
      }

      if (ally.targetOrb) {
        const dx = ally.targetOrb.x - ally.x;
        const dy = ally.targetOrb.y - ally.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 5) {
          ally.x += (dx / dist) * 3.5 * (deltaMs / 16.6);
          ally.y += (dy / dist) * 3.5 * (deltaMs / 16.6);
          ally.angle = Math.atan2(dy, dx);
        } else {
          // Collect for Player 1
          const p1 = this.players[0];
          if (p1) this.collectOrb(p1, ally.targetOrb);
          const idx = this.orbs.indexOf(ally.targetOrb);
          if (idx !== -1) this.orbs.splice(idx, 1);
          ally.targetOrb = null;
        }

        // Ally drops a fake diversion echo trail
        if (Math.random() < 0.25) {
          this.trailPoints.push({
            x: ally.x,
            y: ally.y,
            createdAt: performance.now(),
            playerId: 888, // Ally ID
            color: '#a855f7',
            style: 'stardust',
            intensity: 0.8,
          });
        }
      }
    }
  }

  // --- Dynamic Endgame & Sudden Death ---
  private triggerSuddenDeath() {
    this.isSuddenDeath = true;
    soundEngine.playSuddenDeathAlert();
    this.addNotification('⚡ SUDDEN DEATH! VOID COLLAPSE! ⚡', '#f43f5e', this.width * 0.5, this.height * 0.4);

    // Spawn 2 Elite hunters immediately
    this.spawnEnemy('elite');
    this.spawnEnemy('stalker');

    storageService.unlockAchievement('sudden_death_survivor');
  }

  private handlePlayerCaptured(player: PlayerCharacter, enemy: EnemyEntity) {
    if (!player.isAlive) return;
    player.isAlive = false;
    soundEngine.playPlayerCaptured();

    // Death explosion shockwave
    this.createShockwave(player.x, player.y, '#f43f5e', 200);
    this.createSparkles(player.x, player.y, player.color, 30);

    // Record capture stroke for Death Art
    this.deathArtStrokes.push({
      points: [
        { x: enemy.x, y: enemy.y },
        { x: player.x, y: player.y },
      ],
      color: '#f43f5e',
      width: 6,
      alpha: 1,
      type: 'enemy_path',
    });

    if (this.settings.mode === 'hunter_runner') {
      const aliveRunners = this.players.filter(p => p.role === 'runner' && p.isAlive);
      if (aliveRunners.length === 0) {
        this.concludeMatch('hunters_win');
        return;
      }
    } else {
      // Solo Survival Game Over
      if (player.id === 1) {
        this.concludeMatch('captured');
      }
    }
  }

  private concludeMatch(reason: 'captured' | 'time_out' | 'hunters_win' | 'runners_win') {
    this.isRunning = false;
    soundEngine.stopMusic();

    const p1 = this.players[0];
    if (reason === 'time_out') {
      this.runStats.winnerTeam = 'runners';
    } else if (reason === 'hunters_win') {
      this.runStats.winnerTeam = 'hunters';
    }

    if (this.runStats.score >= 5000 && this.settings.difficulty === 'fast') {
      storageService.unlockAchievement('fast_champion');
    }
    if (this.runStats.survivalSeconds >= 45) {
      storageService.unlockAchievement('trail_master');
    }
    storageService.unlockAchievement('first_run');

    // Save leaderboard entry
    storageService.addLeaderboardEntry({
      playerName: p1 ? p1.name : 'V0ID_RUNNER',
      score: this.runStats.score,
      mode: this.settings.mode,
      difficulty: this.settings.difficulty,
      survivalTimeSeconds: this.runStats.survivalSeconds,
      avatarId: p1 ? p1.avatarId : 'cyber_fox',
      nearMisses: this.runStats.nearMisses,
    });

    // Callback with finalized vector Death Art
    this.callbacks.onGameOver(this.deathArtStrokes, this.runStats);
  }

  // --- Spawners & Helpers ---
  private spawnEnemy(type: EnemyType) {
    // Spawn around arena perimeter
    const side = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;

    if (side === 0) { x = Math.random() * this.width; y = 20; }
    else if (side === 1) { x = this.width - 20; y = Math.random() * this.height; }
    else if (side === 2) { x = Math.random() * this.width; y = this.height - 20; }
    else { x = 20; y = Math.random() * this.height; }

    let speed = 2.8;
    let radius = 16;
    let color = '#ef4444';
    let glow = 'rgba(239, 68, 68, 0.7)';

    if (this.settings.difficulty === 'slow') speed *= 0.8;
    if (this.settings.difficulty === 'fast') speed *= 1.35;

    if (type === 'stalker') {
      speed *= 1.25;
      color = '#ec4899';
      glow = 'rgba(236, 72, 153, 0.7)';
      radius = 14;
    } else if (type === 'hunter') {
      speed *= 0.95;
      radius = 20;
      color = '#f43f5e';
      glow = 'rgba(244, 63, 94, 0.8)';
    } else if (type === 'glitcher') {
      speed *= 1.1;
      color = '#8b5cf6';
      glow = 'rgba(139, 92, 246, 0.8)';
    } else if (type === 'elite') {
      speed *= 1.4;
      radius = 24;
      color = '#f59e0b';
      glow = 'rgba(245, 158, 11, 0.85)';
    }

    this.enemies.push({
      id: 'enemy_' + Math.random(),
      type,
      x,
      y,
      vx: 0,
      vy: 0,
      speed,
      angle: 0,
      radius,
      targetPoint: null,
      state: 'hunting',
      stunTimer: 0,
      color,
      glow,
      radarAngle: 0,
      eliteVariant: type === 'elite',
    });
  }

  private createShockwave(x: number, y: number, color: string, maxRadius: number) {
    this.shockwaves.push({
      x,
      y,
      radius: 5,
      maxRadius,
      color,
      width: 4,
      opacity: 1,
      damageRadius: maxRadius,
    });

    this.deathArtStrokes.push({
      points: [{ x, y }],
      color,
      width: 4,
      alpha: 0.9,
      type: 'burst_ring',
    });
  }

  private createSparkles(x: number, y: number, color: string, count: number = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color,
        life: 400 + Math.random() * 300,
        maxLife: 700,
        alpha: 1,
        shape: Math.random() > 0.5 ? 'spark' : 'circle',
      });
    }
  }

  private addNotification(text: string, color: string, x: number, y: number) {
    this.notifications.push({
      id: 'notif_' + Math.random(),
      text,
      x,
      y,
      color,
      alpha: 1,
      scale: 1,
      duration: 1200,
    });
  }

  private updateVfx(deltaMs: number) {
    // Shockwaves
    for (const sw of this.shockwaves) {
      sw.radius += (sw.maxRadius - sw.radius) * (deltaMs * 0.008);
      sw.opacity = Math.max(0, 1 - sw.radius / sw.maxRadius);
    }
    this.shockwaves = this.shockwaves.filter(sw => sw.opacity > 0.05);

    // Particles
    for (const p of this.particles) {
      p.life -= deltaMs;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.alpha = Math.max(0, p.life / p.maxLife);
    }
    this.particles = this.particles.filter(p => p.life > 0);

    // Notifications
    for (const n of this.notifications) {
      n.duration -= deltaMs;
      n.y -= 0.6;
      n.alpha = Math.max(0, n.duration / 1200);
    }
    this.notifications = this.notifications.filter(n => n.duration > 0);
  }

  private updateAudioTension() {
    const p1 = this.players[0];
    if (!p1 || !p1.isAlive) {
      soundEngine.setChaseIntensity(0);
      return;
    }

    let minEnemyDist = 9999;
    for (const enemy of this.enemies) {
      const d = Math.hypot(p1.x - enemy.x, p1.y - enemy.y);
      if (d < minEnemyDist) minEnemyDist = d;
    }

    // Danger zone is within 250px
    const danger = Math.max(0, Math.min(1, 1 - minEnemyDist / 250));
    soundEngine.setChaseIntensity(this.isSuddenDeath ? 1 : danger);
  }

  // --- Canvas Rendering ---
  private render(timeMs: number) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Procedural Cyberpunk Background Grid & Ambience
    this.renderCyberGrid(ctx, timeMs);

    // 2. Render Defensive Trail Walls
    this.renderTrailWalls(ctx, timeMs);

    // 3. Render 5-Second Echo Trails (Glowing Neon Lines & Glyphs)
    this.renderEchoTrails(ctx, timeMs);

    // 4. Render Decoy Flares
    this.renderFlares(ctx, timeMs);

    // 5. Render Collectible Orbs
    this.renderOrbs(ctx);

    // 6. Render Enemies & Radar Cones
    this.renderEnemies(ctx, timeMs);

    // 7. Render Echo Allies
    this.renderAllies(ctx, timeMs);

    // 8. Render Players (3D Cartoon Stylized Avatars)
    for (const player of this.players) {
      if (player.isAlive) {
        drawAvatar(ctx, player, timeMs);
      }
    }

    // 9. Shockwaves & Particles
    this.renderVfx(ctx);

    // 10. Floating Combat Notifications
    this.renderNotifications(ctx);

    // 11. Sudden Death Red Alert Vignette
    if (this.isSuddenDeath) {
      this.renderSuddenDeathVignette(ctx, timeMs);
    }
  }

  private renderCyberGrid(ctx: CanvasRenderingContext2D, timeMs: number) {
    ctx.save();
    // Dark void background
    ctx.fillStyle = '#05070d';
    ctx.fillRect(0, 0, this.width, this.height);

    // Dynamic isometric / parallax perspective lines
    const gridSize = 48;
    const offsetX = (timeMs * 0.015) % gridSize;
    const offsetY = (timeMs * 0.01) % gridSize;

    ctx.strokeStyle = 'rgba(14, 165, 233, 0.06)';
    ctx.lineWidth = 1;

    ctx.beginPath();
    for (let x = -gridSize + offsetX; x < this.width + gridSize; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
    }
    for (let y = -gridSize + offsetY; y < this.height + gridSize; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
    }
    ctx.stroke();

    // Subtle arena perimeter glow border
    ctx.strokeStyle = this.isSuddenDeath ? 'rgba(244, 63, 94, 0.5)' : 'rgba(6, 182, 212, 0.25)';
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, this.width - 16, this.height - 16);
    ctx.restore();
  }

  private renderEchoTrails(ctx: CanvasRenderingContext2D, timeMs: number) {
    if (this.trailPoints.length < 2) return;

    ctx.save();
    // Group trail points by player
    const playerIds = Array.from(new Set(this.trailPoints.map(p => p.playerId)));

    for (const pid of playerIds) {
      const points = this.trailPoints.filter(p => p.playerId === pid);
      if (points.length < 2) continue;

      const style = points[0].style;
      const color = points[0].color;

      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];

        // Age ratio: 1.0 (just created) down to 0.0 (5 seconds old)
        const age = timeMs - p1.createdAt;
        const alpha = Math.max(0.08, 1 - age / this.trailDurationMs);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        if (style === 'circuit') {
          ctx.strokeStyle = color;
          ctx.lineWidth = 3.5 * alpha;
          ctx.setLineDash([6, 3]);
        } else if (style === 'hex') {
          ctx.strokeStyle = color;
          ctx.lineWidth = 4 * alpha;
          ctx.setLineDash([2, 5]);
        } else if (style === 'flame') {
          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = 6 * alpha;
          ctx.setLineDash([]);
        } else {
          // Ribbon Stream (Default)
          ctx.strokeStyle = color;
          ctx.lineWidth = 4.5 * alpha;
          ctx.setLineDash([]);
        }

        ctx.globalAlpha = alpha;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10 * alpha;
        ctx.stroke();

        // Ghostly node pulses
        if (i % 4 === 0) {
          ctx.beginPath();
          ctx.arc(p1.x, p1.y, 2.5 * alpha, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
      }
    }
    ctx.restore();
  }

  private renderTrailWalls(ctx: CanvasRenderingContext2D, timeMs: number) {
    ctx.save();
    for (const wall of this.trailWalls) {
      const remaining = wall.durationMs - (timeMs - wall.createdAt);
      const alpha = Math.max(0.1, remaining / wall.durationMs);

      ctx.beginPath();
      ctx.moveTo(wall.p1.x, wall.p1.y);
      ctx.lineTo(wall.p2.x, wall.p2.y);
      ctx.strokeStyle = wall.color;
      ctx.lineWidth = 6;
      ctx.shadowColor = wall.color;
      ctx.shadowBlur = 16;
      ctx.globalAlpha = alpha;
      ctx.stroke();

      // Energy oscillation wave
      const midX = (wall.p1.x + wall.p2.x) / 2;
      const midY = (wall.p1.y + wall.p2.y) / 2;
      ctx.beginPath();
      ctx.arc(midX, midY, 6 + Math.sin(timeMs * 0.02) * 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
    ctx.restore();
  }

  private renderEnemies(ctx: CanvasRenderingContext2D, timeMs: number) {
    for (const enemy of this.enemies) {
      ctx.save();
      ctx.translate(enemy.x, enemy.y);
      ctx.rotate(enemy.angle);

      // Radar scanning cone (illustrates how they scan echo resonance)
      ctx.save();
      const sweepAngle = Math.PI * 0.35;
      const radarGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 75);
      radarGrad.addColorStop(0, 'rgba(239, 68, 68, 0.25)');
      radarGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 75, -sweepAngle / 2, sweepAngle / 2);
      ctx.closePath();
      ctx.fillStyle = radarGrad;
      ctx.fill();
      ctx.restore();

      // Enemy Body Shell
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(-enemy.radius * 0.3, -enemy.radius * 0.3, 2, 0, 0, enemy.radius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, enemy.color);
      grad.addColorStop(1, '#180309');
      ctx.fillStyle = grad;
      ctx.shadowColor = enemy.glow;
      ctx.shadowBlur = enemy.stunTimer > 0 ? 4 : 18;
      ctx.fill();

      // Enemy menacing red ocular eye
      ctx.beginPath();
      ctx.arc(enemy.radius * 0.4, 0, enemy.radius * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = enemy.stunTimer > 0 ? '#38bdf8' : '#ffffff';
      ctx.fill();

      // Spikes / Claws for Hunters & Elites
      if (enemy.type === 'hunter' || enemy.type === 'elite') {
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.moveTo(enemy.radius * 0.6, -enemy.radius * 0.7);
        ctx.lineTo(enemy.radius * 1.3, -enemy.radius * 0.4);
        ctx.lineTo(enemy.radius * 0.8, -enemy.radius * 0.2);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(enemy.radius * 0.6, enemy.radius * 0.7);
        ctx.lineTo(enemy.radius * 1.3, enemy.radius * 0.4);
        ctx.lineTo(enemy.radius * 0.8, enemy.radius * 0.2);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private renderOrbs(ctx: CanvasRenderingContext2D) {
    for (const orb of this.orbs) {
      ctx.save();
      const pulse = Math.sin(orb.pulsePhase) * 2;
      const r = orb.radius + pulse;

      ctx.beginPath();
      ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(orb.x - 3, orb.y - 3, 1, orb.x, orb.y, r);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, orb.color);
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.shadowColor = orb.color;
      ctx.shadowBlur = 14;
      ctx.fill();

      // Subtle orbiting electron ring
      ctx.beginPath();
      ctx.ellipse(orb.x, orb.y, r + 4, (r + 4) * 0.45, orb.pulsePhase, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }
  }

  private renderFlares(ctx: CanvasRenderingContext2D, timeMs: number) {
    for (const flare of this.flares) {
      ctx.save();
      const alpha = flare.life / flare.maxLife;
      ctx.globalAlpha = alpha;

      ctx.beginPath();
      ctx.arc(flare.x, flare.y, 14 + Math.sin(timeMs * 0.03) * 4, 0, Math.PI * 2);
      ctx.fillStyle = flare.color;
      ctx.shadowColor = flare.color;
      ctx.shadowBlur = 24;
      ctx.fill();

      // Holographic decoy rings
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(flare.x, flare.y, 28, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }
  }

  private renderAllies(ctx: CanvasRenderingContext2D, timeMs: number) {
    for (const ally of this.allies) {
      ctx.save();
      ctx.translate(ally.x, ally.y);
      ctx.rotate(ally.angle);

      // Cute holographic friendly orb drone
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fillStyle = '#a855f7';
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 15;
      ctx.fill();

      // Drone friendly sensor eye
      ctx.beginPath();
      ctx.arc(4, 0, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.restore();
    }
  }

  private renderVfx(ctx: CanvasRenderingContext2D) {
    ctx.save();
    // Shockwaves
    for (const sw of this.shockwaves) {
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = sw.width;
      ctx.globalAlpha = sw.opacity;
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 16;
      ctx.stroke();
    }

    // Particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  private renderNotifications(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.font = '700 15px "Orbitron", sans-serif';
    ctx.textAlign = 'center';

    for (const n of this.notifications) {
      ctx.globalAlpha = n.alpha;
      ctx.fillStyle = n.color;
      ctx.shadowColor = n.color;
      ctx.shadowBlur = 10;
      ctx.fillText(n.text, n.x, n.y);
    }
    ctx.restore();
  }

  private renderSuddenDeathVignette(ctx: CanvasRenderingContext2D, timeMs: number) {
    ctx.save();
    const pulse = Math.sin(timeMs * 0.008) * 0.15 + 0.25;
    const grad = ctx.createRadialGradient(
      this.width * 0.5,
      this.height * 0.5,
      this.width * 0.35,
      this.width * 0.5,
      this.height * 0.5,
      this.width * 0.7
    );
    grad.addColorStop(0, 'rgba(244, 63, 94, 0)');
    grad.addColorStop(1, `rgba(244, 63, 94, ${pulse})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  }

  // --- Input Listeners ---
  private handlePointerMove = (e: MouseEvent | TouchEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    this.pointerPos = {
      x: (clientX - rect.left) * (this.width / rect.width),
      y: (clientY - rect.top) * (this.height / rect.height),
    };
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keysPressed[e.code] = true;

    // Space or E: Echo Burst
    if (e.code === 'Space' || e.code === 'KeyE') {
      e.preventDefault();
      this.triggerAbility('burst');
    }
    // Q or F: Phantom Flare
    if (e.code === 'KeyQ' || e.code === 'KeyF') {
      e.preventDefault();
      this.triggerAbility('flare');
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keysPressed[e.code] = false;
  };

  private bindEvents() {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this.canvas.addEventListener('mousemove', this.handlePointerMove);
    this.canvas.addEventListener('touchmove', this.handlePointerMove, { passive: false });
    this.canvas.addEventListener('touchstart', this.handlePointerMove, { passive: false });
  }

  private unbindEvents() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.canvas.removeEventListener('mousemove', this.handlePointerMove);
    this.canvas.removeEventListener('touchmove', this.handlePointerMove);
    this.canvas.removeEventListener('touchstart', this.handlePointerMove);
  }

  private handleResize = () => {
    this.resizeCanvas();
  };

  private pointToSegmentDistance(p: Vector2D, v: Vector2D, w: Vector2D): number {
    const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
  }
}
