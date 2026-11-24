export const sma = (a, n) => a.length < n ? null : a.slice(-n).reduce((x, y) => x + y, 0) / n;
export function ema(a, n) { const k = 2 / (n + 1); let e = a[0]; const o = [e]; for (let i = 1; i < a.length; i++) { e = a[i] * k + e * (1 - k); o.push(e); } return o; }
export function rsi(c, n = 14) {
  if (c.length < n + 1) return null;
  let g = 0, l = 0;
  for (let i = 1; i <= n; i++) { const d = c[i] - c[i - 1]; d >= 0 ? g += d : l -= d; }
  g /= n; l /= n;
  for (let i = n + 1; i < c.length; i++) { const d = c[i] - c[i - 1]; g = (g * (n - 1) + Math.max(d, 0)) / n; l = (l * (n - 1) + Math.max(-d, 0)) / n; }
  return l === 0 ? 100 : 100 - 100 / (1 + g / l);
}
export function macdHist(c) { const a = ema(c, 12), b = ema(c, 26), m = a.map((v, i) => v - b[i]), s = ema(m, 9); return m.at(-1) - s.at(-1); }
export function atr(h, l, c, n = 14) {
  const t = []; for (let i = 1; i < c.length; i++) t.push(Math.max(h[i] - l[i], Math.abs(h[i] - c[i - 1]), Math.abs(l[i] - c[i - 1])));
  const s = t.slice(-n); return s.reduce((x, y) => x + y, 0) / s.length;
}
export function techScore(c) {
  const p = c.at(-1), s50 = sma(c, 50), s200 = sma(c, 200), r = rsi(c), m = macdHist(c);
  let s = 50;
  if (s50) s += p > s50 ? 15 : -15;
  if (s200) s += p > s200 ? 10 : -10;
  if (s50 && s200) s += s50 > s200 ? 10 : -10;
  if (r != null) s += r > 75 ? -10 : r < 30 ? 5 : r >= 45 && r <= 65 ? 5 : 0;
  s += m > 0 ? 10 : -5;
  return Math.max(0, Math.min(100, Math.round(s)));
}
