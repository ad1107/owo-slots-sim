
export enum SlotSymbol {
  EGGPLANT = "🍆",
  HEART = "❤️",
  CHERRY = "🍒",
  COWONCY = "💰",
  O_SYM = "🅾️",
  W_SYM = "🇼",
  SPINNING = "🎰", // Placeholder for spinning animation
}

export interface PayoutRule {
  symbols: [SlotSymbol, SlotSymbol, SlotSymbol];
  multiplier: number;
  name: string;
  display: string;
}

export type ReelsState = [SlotSymbol, SlotSymbol, SlotSymbol];

export enum SpinStage {
  IDLE, // Ready to spin or after result shown
  INITIAL_SPIN, // All reels spinning
  REVEAL_REEL_1, // First reel revealed
  REVEAL_REEL_3, // Third reel revealed (middle still spinning)
  REVEAL_REEL_2, // Second (middle) reel revealed
  ALL_REVEALED, // All reels shown, result calculated
}
