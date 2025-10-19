// src/lib/types.ts

export interface AlertItem {
  exchange: string;
  symbol: string;
  timeframe: string;
  type: 'support' | 'resistance';
  message: string; // Braille character
  receivedAt: string; // ISO 8601 timestamp
}