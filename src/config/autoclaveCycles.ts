export interface AutoclaveCycle {
  name: string;
  temp: string;
  sterilizeTime: number;
  dryTime: number;
  totalTime: number;
  duration: number;
}

export interface AutoclaveCycles {
  [key: string]: AutoclaveCycle;
}

export const AUTOCLAVE_CYCLES: AutoclaveCycles = {
  unwrapped: {
    name: 'Unwrapped',
    temp: '132°C (270°F)',
    sterilizeTime: 3,
    dryTime: 30,
    totalTime: 15,
    duration: 15 * 60,
  },
  pouches: {
    name: 'Pouches',
    temp: '132°C (270°F)',
    sterilizeTime: 5,
    dryTime: 30,
    totalTime: 17,
    duration: 17 * 60,
  },
  packs: {
    name: 'Packs',
    temp: '121°C (250°F)',
    sterilizeTime: 30,
    dryTime: 30,
    totalTime: 40,
    duration: 40 * 60,
  },
  handpieces: {
    name: 'Handpieces',
    temp: '132°C (270°F)',
    sterilizeTime: 6,
    dryTime: 30,
    totalTime: 16,
    duration: 16 * 60,
  },
};

export const getAutoclaveCycle = (
  cycleKey: string
): AutoclaveCycle | undefined => {
  return AUTOCLAVE_CYCLES[cycleKey];
};

export const getDefaultAutoclaveCycle = (): string => {
  return 'pouches';
};
