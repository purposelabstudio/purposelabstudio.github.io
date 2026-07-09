// Pure noise-buffer fillers for the Web Audio white-noise player.
// Each fills a Float32Array in-place and returns it. `rng` (0..1) is injectable
// so the generators are deterministic and unit-testable; it defaults to Math.random.

export function fillWhite(out, rng = Math.random) {
  for (let i = 0; i < out.length; i++) out[i] = rng() * 2 - 1;
  return out;
}

// Paul Kellet's pink-noise approximation (−3 dB/octave), scaled to ~[-1, 1].
export function fillPink(out, rng = Math.random) {
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < out.length; i++) {
    const w = rng() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.96900 * b2 + w * 0.1538520;
    b3 = 0.86650 * b3 + w * 0.3104856;
    b4 = 0.55000 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.0168980;
    const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362;
    b6 = w * 0.115926;
    out[i] = Math.max(-1, Math.min(1, pink * 0.11));
  }
  return out;
}

// Brown/red noise (−6 dB/octave) via a leaky integrator of white noise, clamped.
export function fillBrown(out, rng = Math.random) {
  let last = 0;
  for (let i = 0; i < out.length; i++) {
    const w = rng() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    out[i] = Math.max(-1, Math.min(1, last * 3.5));
  }
  return out;
}

export const NOISE = { white: fillWhite, pink: fillPink, brown: fillBrown };
