export type Pt = { x: number; y: number };

const rng = (seedText: string) => {
  let h = 2166136261;
  for (let i = 0; i < seedText.length; i++) {
    h ^= seedText.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const catmull = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
};

export const STEPS_BETWEEN = 3;

export const buildPath = (seed: string, tiles: number) => {
  const rand = rng(seed || 'maat');
  const count = 16;
  const rot = rand() * Math.PI * 2;
  const lobes = 3 + Math.floor(rand() * 3);
  const phase = rand() * Math.PI * 2;
  const ctrl: Pt[] = [];
  for (let i = 0; i < count; i++) {
    const a = rot + (i / count) * Math.PI * 2;
    const r = 0.3 + 0.1 * Math.sin(lobes * a + phase) + (rand() - 0.5) * 0.04;
    ctrl.push({ x: 0.5 + Math.cos(a) * r * 1.05, y: 0.5 + Math.sin(a) * r });
  }

  const dense: Pt[] = [];
  for (let i = 0; i < count; i++) {
    const p0 = ctrl[(i - 1 + count) % count];
    const p1 = ctrl[i];
    const p2 = ctrl[(i + 1) % count];
    const p3 = ctrl[(i + 2) % count];
    for (let s = 0; s < 60; s++) dense.push(catmull(p0, p1, p2, p3, s / 60));
  }

  const lens = [0];
  for (let i = 1; i <= dense.length; i++) {
    const a = dense[i - 1];
    const b = dense[i % dense.length];
    lens.push(lens[i - 1] + Math.hypot(b.x - a.x, b.y - a.y));
  }
  const total = lens[lens.length - 1];

  const slotsCount = tiles * STEPS_BETWEEN;
  const slots: Pt[] = [];
  let j = 0;
  for (let k = 0; k < slotsCount; k++) {
    const target = (k / slotsCount) * total;
    while (lens[j + 1] < target) j++;
    const a = dense[j];
    const b = dense[(j + 1) % dense.length];
    const f = (target - lens[j]) / (lens[j + 1] - lens[j] || 1);
    slots.push({ x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f });
  }

  const d =
    dense.map((p, i) => `${i === 0 ? 'M' : 'L'}${(p.x * 1000).toFixed(1)} ${(p.y * 1000).toFixed(1)}`).join(' ') + ' Z';

  return { slots, d };
};

export const tileSlot = (position: number) => (position - 1) * STEPS_BETWEEN;