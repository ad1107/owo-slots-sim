
import { SlotSymbol, PayoutRule } from './types';

export const MAX_BET = 250000;
export const INITIAL_COWONCY = 10000;
export const MIN_BET = 1;

export const REVEAL_DELAY_1 = 1000; // ms, for first reel
export const REVEAL_DELAY_2 = 700;  // ms, for third reel
export const REVEAL_DELAY_3 = 1000; // ms, for second reel

export const ALL_SYMBOLS: SlotSymbol[] = [ // Still useful for general symbol reference if needed elsewhere
  SlotSymbol.EGGPLANT,
  SlotSymbol.HEART,
  SlotSymbol.CHERRY,
  SlotSymbol.COWONCY,
  SlotSymbol.O_SYM,
  SlotSymbol.W_SYM,
];

export const PAYOUT_RULES: PayoutRule[] = [
  { name: "Eggplants", symbols: [SlotSymbol.EGGPLANT, SlotSymbol.EGGPLANT, SlotSymbol.EGGPLANT], multiplier: 1, display: `${SlotSymbol.EGGPLANT}${SlotSymbol.EGGPLANT}${SlotSymbol.EGGPLANT}` },
  { name: "Hearts", symbols: [SlotSymbol.HEART, SlotSymbol.HEART, SlotSymbol.HEART], multiplier: 2, display: `${SlotSymbol.HEART}${SlotSymbol.HEART}${SlotSymbol.HEART}` },
  { name: "Cherries", symbols: [SlotSymbol.CHERRY, SlotSymbol.CHERRY, SlotSymbol.CHERRY], multiplier: 3, display: `${SlotSymbol.CHERRY}${SlotSymbol.CHERRY}${SlotSymbol.CHERRY}` },
  { name: "Cowoncies", symbols: [SlotSymbol.COWONCY, SlotSymbol.COWONCY, SlotSymbol.COWONCY], multiplier: 4, display: `${SlotSymbol.COWONCY}${SlotSymbol.COWONCY}${SlotSymbol.COWONCY}` },
  { name: "OwO Jackpot", symbols: [SlotSymbol.O_SYM, SlotSymbol.W_SYM, SlotSymbol.O_SYM], multiplier: 10, display: `${SlotSymbol.O_SYM}${SlotSymbol.W_SYM}${SlotSymbol.O_SYM}` },
];


