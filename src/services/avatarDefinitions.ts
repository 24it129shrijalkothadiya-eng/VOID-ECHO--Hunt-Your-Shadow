/**
 * VOID ECHO - Avatar Definitions & 2.5D Stylized Character Rendering
 */

import { AvatarId, CosmeticId, PlayerCharacter, TrailStyle } from '../types/game';

export interface AvatarMeta {
  id: AvatarId;
  name: string;
  tagline: string;
  costShards: number;
  unlockedByDefault: boolean;
  baseColor: string;
  accentColor: string;
  glowColor: string;
  description: string;
  stats: {
    agility: number; // 1-5
    burstPower: number; // 1-5
    stealth: number; // 1-5
  };
}

export const AVATAR_REGISTRY: Record<AvatarId, AvatarMeta> = {
  cyber_fox: {
    id: 'cyber_fox',
    name: 'Cyber Fox',
    tagline: 'Swift Phantom of the Grid',
    costShards: 0,
    unlockedByDefault: true,
    baseColor: '#06b6d4',
    accentColor: '#38bdf8',
    glowColor: 'rgba(6, 182, 212, 0.6)',
    description: 'Equipped with dual neural sensor ears and an ion thruster tail for razor-sharp evasive pivots.',
    stats: { agility: 5, burstPower: 3, stealth: 4 },
  },
  astro_cat: {
    id: 'astro_cat',
    name: 'Astro Cat',
    tagline: 'Zero-G Cosmic Explorer',
    costShards: 0,
    unlockedByDefault: true,
    baseColor: '#a855f7',
    accentColor: '#c084fc',
    glowColor: 'rgba(168, 85, 247, 0.6)',
    description: 'Protected by an orbital helmet visor and antigrav whiskers that predict enemy trajectory arcs.',
    stats: { agility: 4, burstPower: 4, stealth: 3 },
  },
  robo_bunny: {
    id: 'robo_bunny',
    name: 'Robo Bunny',
    tagline: 'High-Frequency Pulse Leaper',
    costShards: 200,
    unlockedByDefault: false,
    baseColor: '#ec4899',
    accentColor: '#f472b6',
    glowColor: 'rgba(236, 72, 153, 0.6)',
    description: 'Boasts quantum antenna ears capable of sensing incoming shadow stalkers through dimensional rifts.',
    stats: { agility: 5, burstPower: 2, stealth: 5 },
  },
  neon_panda: {
    id: 'neon_panda',
    name: 'Neon Panda',
    tagline: 'Heavy Bulwark of the Core',
    costShards: 350,
    unlockedByDefault: false,
    baseColor: '#10b981',
    accentColor: '#34d399',
    glowColor: 'rgba(16, 185, 129, 0.6)',
    description: 'Armored with dense cyber plating and an harmonic laser ring that dampens hunter acoustic tracking.',
    stats: { agility: 3, burstPower: 5, stealth: 4 },
  },
  pixel_dragon: {
    id: 'pixel_dragon',
    name: 'Pixel Dragon',
    tagline: 'Ember Lord of the Void',
    costShards: 500,
    unlockedByDefault: false,
    baseColor: '#f97316',
    accentColor: '#fb923c',
    glowColor: 'rgba(249, 115, 22, 0.6)',
    description: 'Ignites the grid with draconic horn antennae and glowing jet tail flames that leave scorched decoy trails.',
    stats: { agility: 4, burstPower: 5, stealth: 2 },
  },
  shadow_ninja: {
    id: 'shadow_ninja',
    name: 'Shadow Ninja',
    tagline: 'Silent Digital Assassin',
    costShards: 650,
    unlockedByDefault: false,
    baseColor: '#6366f1',
    accentColor: '#818cf8',
    glowColor: 'rgba(99, 102, 241, 0.6)',
    description: 'Wraps in a flowing light-bending scarf, vanishing into echo resonance frequencies at high velocities.',
    stats: { agility: 5, burstPower: 4, stealth: 5 },
  },
  space_pirate: {
    id: 'space_pirate',
    name: 'Space Pirate',
    tagline: 'Outlaw Bounty Raider',
    costShards: 800,
    unlockedByDefault: false,
    baseColor: '#eab308',
    accentColor: '#facc15',
    glowColor: 'rgba(234, 179, 8, 0.6)',
    description: 'Features a targeting monocular eye implant and a golden solar compass calibrated to siphon enemy energy.',
    stats: { agility: 4, burstPower: 4, stealth: 3 },
  },
  void_knight: {
    id: 'void_knight',
    name: 'Void Knight',
    tagline: 'Paladin of Crystalline Aegis',
    costShards: 1000,
    unlockedByDefault: false,
    baseColor: '#f43f5e',
    accentColor: '#fb7185',
    glowColor: 'rgba(244, 63, 94, 0.6)',
    description: 'Encased in prismatic void-forged armor with an animated energy mantle that repels hunting radar waves.',
    stats: { agility: 4, burstPower: 5, stealth: 4 },
  },
};

export interface CosmeticMeta {
  id: CosmeticId;
  name: string;
  icon: string;
  costShards: number;
}

export const COSMETICS_LIST: CosmeticMeta[] = [
  { id: 'none', name: 'Standard Rig', icon: '👤', costShards: 0 },
  { id: 'visor', name: 'Cyber Visor', icon: '🕶️', costShards: 100 },
  { id: 'horns', name: 'Plasma Horns', icon: '😈', costShards: 180 },
  { id: 'halo', name: 'Antigrav Halo', icon: '😇', costShards: 250 },
  { id: 'scarf', name: 'Energy Scarf', icon: '🧣', costShards: 300 },
  { id: 'wings', name: 'Photon Wings', icon: '🪽', costShards: 450 },
];

export interface TrailMeta {
  style: TrailStyle;
  name: string;
  description: string;
  costShards: number;
}

export const TRAILS_LIST: TrailMeta[] = [
  { style: 'ribbon', name: 'Ribbon Stream', description: 'Smooth glowing neon stream with gradient alpha.', costShards: 0 },
  { style: 'circuit', name: 'Cyber Circuit', description: 'Angular tech pulses with rhythmic interconnect nodes.', costShards: 150 },
  { style: 'stardust', name: 'Stardust Sparkle', description: 'Glittering cosmic embers that slowly disperse.', costShards: 220 },
  { style: 'hex', name: 'Digital Hex', description: 'Holographic honeycomb matrix clusters.', costShards: 300 },
  { style: 'flame', name: 'Plasma Flame', description: 'Fiery turbulent plasma plumes with intense core heat.', costShards: 400 },
];

/**
 * Draws the 3D-styled animated cartoon/humanoid avatar onto HTML5 Canvas
 */
export function drawAvatar(
  ctx: CanvasRenderingContext2D,
  player: PlayerCharacter,
  timeMs: number,
  scale: number = 1
) {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.scale(scale, scale);

  // Subtle 3D bobbing and tilt
  const bobY = Math.sin(timeMs * 0.007 + player.id * 1.5) * 3;
  ctx.translate(0, bobY);

  // Directional angle rotation
  ctx.rotate(player.angle);

  const radius = player.radius;
  const primary = player.color || '#06b6d4';
  const expression = player.expression;

  // 1. Aura State Halo / Glow Effect
  if (player.aura !== 'neutral') {
    ctx.save();
    let auraColor = 'rgba(6, 182, 212, 0.4)';
    if (player.aura === 'frenzy_overdrive') auraColor = 'rgba(244, 63, 94, 0.55)';
    if (player.aura === 'zen_ghost') auraColor = 'rgba(234, 179, 8, 0.5)';
    if (player.aura === 'speed_surge') auraColor = 'rgba(56, 189, 248, 0.55)';

    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.8 + Math.sin(timeMs * 0.01) * 3, 0, Math.PI * 2);
    ctx.fillStyle = auraColor;
    ctx.shadowColor = auraColor;
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.restore();
  }

  // 2. Wings Cosmetic (Behind Character)
  if (player.cosmeticId === 'wings') {
    ctx.save();
    const wingFlap = Math.sin(timeMs * 0.012) * 0.3;
    ctx.strokeStyle = '#38bdf8';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 12;
    ctx.lineWidth = 3;

    // Left Wing
    ctx.beginPath();
    ctx.moveTo(-radius * 0.5, -radius * 0.2);
    ctx.quadraticCurveTo(-radius * 1.8, -radius * (1.2 + wingFlap), -radius * 2.2, -radius * 0.4);
    ctx.quadraticCurveTo(-radius * 1.2, -radius * 0.1, -radius * 0.4, 0);
    ctx.stroke();

    // Right Wing
    ctx.beginPath();
    ctx.moveTo(-radius * 0.5, radius * 0.2);
    ctx.quadraticCurveTo(-radius * 1.8, radius * (1.2 + wingFlap), -radius * 2.2, radius * 0.4);
    ctx.quadraticCurveTo(-radius * 1.2, radius * 0.1, -radius * 0.4, 0);
    ctx.stroke();
    ctx.restore();
  }

  // 3. Tails / Jet Propulsion / Back appendages based on Avatar
  drawAvatarBackDetails(ctx, player, radius, primary, timeMs);

  // 4. Character Main Body Shell (3D Spherical Shading)
  ctx.save();
  const bodyGrad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, radius * 0.1, 0, 0, radius);
  bodyGrad.addColorStop(0, '#ffffff');
  bodyGrad.addColorStop(0.35, primary);
  bodyGrad.addColorStop(1, '#090d16');

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.shadowColor = primary;
  ctx.shadowBlur = 15;
  ctx.fill();

  // Subtle metallic rim border
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = primary;
  ctx.stroke();
  ctx.restore();

  // 5. Avatar Unique Head & Face Features (Ears, Visors, Horns, Eyes)
  drawAvatarFrontFace(ctx, player, radius, primary, expression, timeMs);

  // 6. Cosmetics (Visor, Horns, Halo, Scarf)
  drawCosmetics(ctx, player, radius, timeMs);

  // 7. Role Indicator (Hunter vs Runner Ring)
  if (player.role === 'hunter') {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius + 5, 0, Math.PI * 2);
    ctx.strokeStyle = '#f43f5e';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

function drawAvatarBackDetails(
  ctx: CanvasRenderingContext2D,
  player: PlayerCharacter,
  radius: number,
  primary: string,
  timeMs: number
) {
  const avatarId = player.avatarId;

  if (avatarId === 'cyber_fox') {
    // Glowing Fox Tail with animated wag
    const wag = Math.sin(timeMs * 0.008) * 0.4;
    ctx.save();
    ctx.translate(-radius * 0.9, 0);
    ctx.rotate(wag);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-radius * 1.2, -radius * 0.6, -radius * 1.8, 0);
    ctx.quadraticCurveTo(-radius * 1.2, radius * 0.6, 0, 0);
    ctx.fillStyle = primary;
    ctx.shadowColor = primary;
    ctx.shadowBlur = 10;
    ctx.fill();

    // Fox tail white tip
    ctx.beginPath();
    ctx.moveTo(-radius * 1.3, -radius * 0.2);
    ctx.quadraticCurveTo(-radius * 1.8, 0, -radius * 1.3, radius * 0.2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();
  } else if (avatarId === 'pixel_dragon') {
    // Dragon Spikes & tail flame
    ctx.save();
    ctx.fillStyle = '#f97316';
    for (let i = 0; i < 3; i++) {
      const sx = -radius * 0.4 - i * 6;
      ctx.beginPath();
      ctx.moveTo(sx, -4);
      ctx.lineTo(sx - 7, 0);
      ctx.lineTo(sx, 4);
      ctx.fill();
    }
    // Flame plume
    const flameFlicker = Math.sin(timeMs * 0.02) * 4;
    ctx.beginPath();
    ctx.arc(-radius * 1.4, 0, 6 + flameFlicker, 0, Math.PI * 2);
    ctx.fillStyle = '#facc15';
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.restore();
  } else if (avatarId === 'astro_cat') {
    // Curled mechanical tail
    ctx.save();
    const curl = Math.sin(timeMs * 0.006) * 0.2;
    ctx.strokeStyle = primary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-radius * 0.8, 0);
    ctx.bezierCurveTo(-radius * 1.4, -radius * 0.8, -radius * 1.6, radius * (0.8 + curl), -radius * 1.2, radius * 1.1);
    ctx.stroke();
    // Tip bulb
    ctx.beginPath();
    ctx.arc(-radius * 1.2, radius * 1.1, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#c084fc';
    ctx.fill();
    ctx.restore();
  } else if (avatarId === 'void_knight') {
    // Energy cape fluttering behind
    ctx.save();
    const wave = Math.sin(timeMs * 0.01) * 3;
    ctx.beginPath();
    ctx.moveTo(-radius * 0.5, -radius * 0.7);
    ctx.lineTo(-radius * 1.7, -radius * 0.9 + wave);
    ctx.lineTo(-radius * 1.5, 0);
    ctx.lineTo(-radius * 1.7, radius * 0.9 - wave);
    ctx.lineTo(-radius * 0.5, radius * 0.7);
    ctx.closePath();
    ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();
  }
}

function drawAvatarFrontFace(
  ctx: CanvasRenderingContext2D,
  player: PlayerCharacter,
  radius: number,
  primary: string,
  expression: PlayerCharacter['expression'],
  timeMs: number
) {
  const avatarId = player.avatarId;

  // 1. Ears & Head Top Appendages
  if (avatarId === 'cyber_fox') {
    ctx.save();
    ctx.fillStyle = primary;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    // Left Ear
    ctx.beginPath();
    ctx.moveTo(radius * 0.2, -radius * 0.7);
    ctx.lineTo(radius * 0.9, -radius * 1.4);
    ctx.lineTo(radius * 0.6, -radius * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Right Ear
    ctx.beginPath();
    ctx.moveTo(radius * 0.2, radius * 0.7);
    ctx.lineTo(radius * 0.9, radius * 1.4);
    ctx.lineTo(radius * 0.6, radius * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  } else if (avatarId === 'robo_bunny') {
    // Tall mechanical antennae ears
    ctx.save();
    ctx.strokeStyle = primary;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    const twitch = Math.sin(timeMs * 0.009) * 0.1;
    // Ear 1
    ctx.beginPath();
    ctx.moveTo(0, -radius * 0.6);
    ctx.lineTo(radius * 0.4, -radius * (1.7 + twitch));
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(radius * 0.4, -radius * (1.7 + twitch), 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Ear 2
    ctx.beginPath();
    ctx.moveTo(0, radius * 0.6);
    ctx.lineTo(radius * 0.4, radius * (1.7 - twitch));
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(radius * 0.4, radius * (1.7 - twitch), 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (avatarId === 'pixel_dragon') {
    // Draconic Curved Horns
    ctx.save();
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(radius * 0.2, -radius * 0.6);
    ctx.quadraticCurveTo(radius * 0.5, -radius * 1.3, radius * 0.9, -radius * 1.2);
    ctx.lineTo(radius * 0.4, -radius * 0.4);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(radius * 0.2, radius * 0.6);
    ctx.quadraticCurveTo(radius * 0.5, radius * 1.3, radius * 0.9, radius * 1.2);
    ctx.lineTo(radius * 0.4, radius * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else if (avatarId === 'neon_panda') {
    // Cute Round Cyber Panda Ears
    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(radius * 0.3, -radius * 0.9, radius * 0.35, 0, Math.PI * 2);
    ctx.arc(radius * 0.3, radius * 0.9, radius * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // 2. Eyes & Facial Expressions
  ctx.save();
  ctx.fillStyle = '#020617';
  // Face mask / eye plate
  ctx.beginPath();
  ctx.ellipse(radius * 0.4, 0, radius * 0.45, radius * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye glow colors
  let eyeColor = '#38bdf8';
  if (expression === 'shocked') eyeColor = '#f43f5e';
  if (expression === 'focused') eyeColor = '#facc15';
  if (expression === 'victorious') eyeColor = '#34d399';

  ctx.fillStyle = eyeColor;
  ctx.shadowColor = eyeColor;
  ctx.shadowBlur = 8;

  const eyeSpread = radius * 0.3;
  const eyeX = radius * 0.45;

  if (expression === 'shocked') {
    // Wide shocked circles
    ctx.beginPath();
    ctx.arc(eyeX, -eyeSpread, 4.5, 0, Math.PI * 2);
    ctx.arc(eyeX, eyeSpread, 4.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (expression === 'focused') {
    // Slanted determined cyber slits
    ctx.fillRect(eyeX - 3, -eyeSpread - 4, 8, 3.5);
    ctx.fillRect(eyeX - 3, eyeSpread + 1, 8, 3.5);
  } else if (expression === 'victorious') {
    // Happy squint arches
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(eyeX, -eyeSpread, 4, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(eyeX, eyeSpread, 4, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
  } else {
    // Normal cartoon glowing cyber eyes
    ctx.beginPath();
    ctx.ellipse(eyeX, -eyeSpread, 4, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(eyeX, eyeSpread, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Tiny white highlight dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eyeX + 1, -eyeSpread - 1, 1.2, 0, Math.PI * 2);
    ctx.arc(eyeX + 1, eyeSpread - 1, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawCosmetics(
  ctx: CanvasRenderingContext2D,
  player: PlayerCharacter,
  radius: number,
  timeMs: number
) {
  const cosmetic = player.cosmeticId;

  if (cosmetic === 'visor') {
    ctx.save();
    ctx.fillStyle = '#f43f5e';
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.roundRect(radius * 0.25, -radius * 0.55, radius * 0.35, radius * 1.1, [3]);
    ctx.fill();
    // Visor reflection line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(radius * 0.35, -radius * 0.35);
    ctx.lineTo(radius * 0.5, -radius * 0.15);
    ctx.stroke();
    ctx.restore();
  } else if (cosmetic === 'halo') {
    ctx.save();
    const haloBob = Math.sin(timeMs * 0.008) * 2;
    ctx.strokeStyle = '#eab308';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 12;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 1.4, radius * 1.4, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  } else if (cosmetic === 'horns') {
    ctx.save();
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    // Horn 1
    ctx.beginPath();
    ctx.moveTo(0, -radius * 0.6);
    ctx.lineTo(radius * 0.6, -radius * 1.2);
    ctx.lineTo(radius * 0.3, -radius * 0.4);
    ctx.closePath();
    ctx.fill();
    // Horn 2
    ctx.beginPath();
    ctx.moveTo(0, radius * 0.6);
    ctx.lineTo(radius * 0.6, radius * 1.2);
    ctx.lineTo(radius * 0.3, radius * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else if (cosmetic === 'scarf') {
    ctx.save();
    const scarfWave = Math.sin(timeMs * 0.012) * 5;
    ctx.strokeStyle = '#a855f7';
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 8;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-radius * 0.5, -radius * 0.2);
    ctx.quadraticCurveTo(-radius * 1.2, -radius * 0.8 + scarfWave, -radius * 1.9, -radius * 0.4 + scarfWave);
    ctx.stroke();
    ctx.restore();
  }
}
