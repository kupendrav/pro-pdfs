let counter = 0;

/** Stable, collision-free id without depending on crypto.randomUUID availability. */
export function uid(prefix = ''): string {
  counter = (counter + 1) % 10000;
  const rand =
    typeof crypto !== 'undefined' && 'getRandomValues' in crypto
      ? crypto.getRandomValues(new Uint32Array(1))[0].toString(36)
      : Math.random().toString(36).slice(2);
  return `${prefix}${Date.now().toString(36)}${counter.toString(36)}${rand}`;
}
