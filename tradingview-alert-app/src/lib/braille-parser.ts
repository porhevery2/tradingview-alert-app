// src/lib/braille-parser.ts

const SIGNALS = [
  { name: 'CC', value: 1 },
  { name: 'CD', value: 2 },
  { name: 'BP', value: 4 },
  { name: 'MA', value: 8 },
  { name: 'VO', value: 16 },
  { name: 'BA', value: 32 },
  { name: 'BB', value: 64 },
  { name: 'RS', value: 128 }
];

export function parseBraille(brailleChar: string): string[] {
  if (!brailleChar || brailleChar.length === 0) {
    return [];
  }
  
  const baseCodePoint = 0x2800;
  const charCodePoint = brailleChar.codePointAt(0);

  if (charCodePoint === undefined) {
    return [];
  }

  const signalValue = charCodePoint - baseCodePoint;
  
  const activeSignals = SIGNALS
    .filter(signal => (signalValue & signal.value) !== 0)
    .map(signal => signal.name);

  return activeSignals;
}