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
/** Stronger, more insistent pattern for a wrong answer — felt, not just seen. */
export function error(): void {
  try {
    navigator.vibrate?.([28, 30, 28]);
  } catch {
    /* unsupported — fine */
  }
}
