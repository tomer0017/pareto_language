/** Gentle haptic feedback — satisfaction, not noise. No-ops where unsupported. */
export function tap(): void {
  try {
    navigator.vibrate?.(8);
  } catch {
    /* unsupported — fine */
  }
}
export function success(): void {
  try {
    navigator.vibrate?.([10, 40, 18]);
  } catch {
    /* unsupported — fine */
  }
}
