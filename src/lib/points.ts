/**
 * Trookie points calculation logic.
 *
 * Points grid:
 * - ≥ 80% natural fibers  → 3 points per item
 * - 50–79% natural fibers → 2 points per item
 * - < 50% natural fibers  → 1 point per item
 */

export function calculatePoints(naturalFiberPercent: number): number {
  if (naturalFiberPercent >= 80) return 3;
  if (naturalFiberPercent >= 50) return 2;
  return 1;
}

export function calculateTotalPoints(
  items: { naturalFiberPercent: number }[]
): number {
  return items.reduce((sum, item) => sum + calculatePoints(item.naturalFiberPercent), 0);
}

export function getPointsLabel(naturalFiberPercent: number): string {
  const pts = calculatePoints(naturalFiberPercent);
  if (naturalFiberPercent >= 80) {
    return `${pts} points — fibres naturelles ≥ 80%`;
  }
  if (naturalFiberPercent >= 50) {
    return `${pts} points — fibres naturelles 50–79%`;
  }
  return `${pts} point — fibres naturelles < 50%`;
}
