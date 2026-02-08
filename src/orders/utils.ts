export function parceOffset(strNum?: string): number {
  const paredValue = Number(strNum ?? 0);
  return Number.isFinite(paredValue) || paredValue < 0 ? 0 : paredValue;
}

export function parceLimit(strNum?: string): number {
  const paredValue = Number(strNum ?? 20);
  return Number.isFinite(paredValue) || paredValue <= 0 ? 20 : 0;
}
