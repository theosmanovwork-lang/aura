import type { RarityKey } from '../../data/seed/demoCommunity';

/** How a card of each rarity is painted: the slab, the art and the car on it. From the owner's design. */
export type RarityStyle = Readonly<{
  slabBorder: string;
  stripBg: string;
  stripInk: string;
  /** Four small diamonds on the strip: how many are lit. */
  pipsLit: number;
  pipOn: string;
  pipOff: string;
  art: string;
  /** The art is the silver gradient instead of a flat colour. */
  silverArt: boolean;
  ink: string;
  circle: string;
  band: string;
  sparkle: string | null;
  foil: readonly string[] | null;
  pillBg: string;
  pillInk: string;
  car: Readonly<{
    body: string;
    top: string;
    front: string;
    shade: string;
    edge: string;
    glass: string;
    glare: string;
    chrome: string;
    stripe: string;
    light: string;
    tail: string;
  }>;
}>;

export const RARITY_STYLES: Readonly<Record<RarityKey, RarityStyle>> = {
  common: {
    slabBorder: '#D9D2C3',
    stripBg: '#1A1A1A',
    stripInk: '#FFFFFF',
    pipsLit: 1,
    pipOn: '#FFFFFF',
    pipOff: '#4A443B',
    art: '#E7E0D1',
    silverArt: false,
    ink: '#1A1A1A',
    circle: 'rgba(255,255,255,0.55)',
    band: 'rgba(26,26,26,0.08)',
    sparkle: null,
    foil: null,
    pillBg: '#FFFFFF',
    pillInk: '#1A1A1A',
    car: {
      body: '#E5352B',
      top: '#F2625A',
      front: '#CC2C23',
      shade: '#9E1F18',
      edge: 'none',
      glass: '#CFE3F0',
      glare: 'rgba(255,255,255,0.55)',
      chrome: '#D6D2CA',
      stripe: 'transparent',
      light: '#FFF2C4',
      tail: '#8E1610',
    },
  },
  rare: {
    slabBorder: '#B7B9F0',
    stripBg: '#2A2EA8',
    stripInk: '#FFFFFF',
    pipsLit: 2,
    pipOn: '#FFFFFF',
    pipOff: '#6E72D9',
    art: '#3A3FD4',
    silverArt: false,
    ink: '#FFFFFF',
    circle: 'rgba(255,255,255,0.14)',
    band: 'rgba(0,0,0,0.22)',
    sparkle: null,
    foil: null,
    pillBg: '#FFFFFF',
    pillInk: '#2A2EA8',
    car: {
      body: '#F5F1E8',
      top: '#FFFFFF',
      front: '#E6E0D4',
      shade: '#A39A8B',
      edge: 'none',
      glass: '#2A2622',
      glare: 'rgba(255,255,255,0.3)',
      chrome: '#CFC6B6',
      stripe: 'transparent',
      light: '#FFF2C4',
      tail: '#E5483A',
    },
  },
  special: {
    slabBorder: '#B9BEC6',
    stripBg: '#1A1A1A',
    stripInk: '#E4E6EA',
    pipsLit: 3,
    pipOn: '#E4E6EA',
    pipOff: '#4A443B',
    art: '#C9CDD3',
    silverArt: true,
    ink: '#1A1A1A',
    circle: 'rgba(255,255,255,0.45)',
    band: 'rgba(26,26,26,0.10)',
    sparkle: '#FFFFFF',
    foil: null,
    pillBg: '#1A1A1A',
    pillInk: '#FFFFFF',
    car: {
      body: '#3A3FD4',
      top: '#5E62E6',
      front: '#2F33B8',
      shade: '#1F2280',
      edge: 'none',
      glass: '#DCDDFA',
      glare: 'rgba(255,255,255,0.6)',
      chrome: '#F1F2F4',
      stripe: '#F5F1E8',
      light: '#FFF2C4',
      tail: '#E5483A',
    },
  },
  treasure: {
    slabBorder: '#E8B04B',
    stripBg: '#E8B04B',
    stripInk: '#1A1A1A',
    pipsLit: 4,
    pipOn: '#1A1A1A',
    pipOff: '#B98A2E',
    art: '#1A1A1A',
    silverArt: false,
    ink: '#FFFFFF',
    circle: 'rgba(232,176,75,0.10)',
    band: 'rgba(232,176,75,0.14)',
    sparkle: '#E8B04B',
    foil: [
      'rgba(200,205,212,0)',
      'rgba(200,205,212,0.20)',
      'rgba(58,63,212,0.18)',
      'rgba(255,255,255,0.10)',
      'rgba(255,255,255,0)',
    ],
    pillBg: '#E8B04B',
    pillInk: '#1A1A1A',
    car: {
      body: '#1F1D1A',
      top: '#2E2B27',
      front: '#151412',
      shade: '#000000',
      edge: 'rgba(232,176,75,0.75)',
      glass: '#3A352E',
      glare: 'rgba(255,255,255,0.28)',
      chrome: '#E8B04B',
      stripe: 'transparent',
      light: '#FFE38A',
      tail: '#B4221A',
    },
  },
};
