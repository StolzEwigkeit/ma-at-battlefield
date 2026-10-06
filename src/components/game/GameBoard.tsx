import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '@/components/ui/icon';
import type { GamePlayer } from '@/lib/gameApi';
import { buildPath, tileSlot } from '@/components/game/boardPath';

const BOARD_ART =
  'https://cdn.poehali.dev/projects/bfa830f0-f2cc-4b64-9f77-de1d82d4eb1b/files/00a5ba1d-a22f-43f9-a30f-80d80efdec13.jpg';

const typeIcon: Record<string, string> = {
  храм: 'Landmark',
  логово: 'Flame',
  рынок: 'Coins',
  весы: 'Scale',
  пустыня: 'Wind',
};

const typeColor: Record<string, string> = {
  храм: '#2a6fa8',
  логово: '#a32b2b',
  рынок: '#c98a1f',
  весы: '#2f7a3c',
  пустыня: '#b4762f',
};

const seatColors = [
  'hsl(var(--primary))',
  'hsl(var(--lapis))',
  'hsl(var(--glow))',
  'hsl(20 60% 55%)',
  'hsl(150 30% 40%)',
  'hsl(280 28% 52%)',
  'hsl(200 45% 45%)',
];

const stepColors = ['#2a7f8a', '#c98a1f', '#a8432b', '#3f6f9e', '#5f8a3a'];

export const PAWNS: Record<string, string> = {
  priest: '/pawns/priest.png',
  warrior: '/pawns/warrior.png',
  vizier: '/pawns/vizier.png',
  scribe: '/pawns/scribe.png',
};

type Props = {
  board: { id: number; name: string; type: string }[];
  players: GamePlayer[];
  currentPlayerId: number | null;
  seed?: string;
};

const usePawnSlots = (players: GamePlayer[], total: number) => {
  const [shown, setShown] = useState<Record<number, number>>(() =>
    Object.fromEntries(players.map((p) => [p.id, tileSlot(p.position)])),
  );
  const ref = useRef(shown);
  ref.current = shown;

  const key = players.map((p) => `${p.id}:${p.position}`).join('|');

  useEffect(() => {
    const timer = window.setInterval(() => {
      const cur = ref.current;
      let changed = false;
      const next: Record<number, number> = { ...cur };
      for (const p of players) {
        const target = tileSlot(p.position);
        const at = cur[p.id];
        if (at === undefined) {
          next[p.id] = target;
          changed = true;
          continue;
        }
        if (at === target) continue;
        const fwd = (target - at + total) % total;
        const back = (at - target + total) % total;
        next[p.id] = fwd <= back ? (at + 1) % total : (at - 1 + total) % total;
        changed = true;
      }
      if (changed) setShown(next);
    }, 170);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, total]);

  return shown;
};

const GameBoard = ({ board, players, currentPlayerId, seed = 'maat' }: Props) => {
  const { slots, d } = useMemo(() => buildPath(seed, board.length), [seed, board.length]);
  const total = slots.length;
  const alive = players.filter((p) => !p.isOut);
  const shown = usePawnSlots(alive, total);

  const bySlot = new Map<number, GamePlayer[]>();
  for (const p of alive) {
    const s = shown[p.id] ?? tileSlot(p.position);
    bySlot.set(s, [...(bySlot.get(s) ?? []), p]);
  }

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[920px] overflow-hidden rounded-md border-[6px] border-[#5a3d17] bg-[#3a2810] shadow-2xl">
      <img src={BOARD_ART} alt="Поле Маат" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(30,18,6,0.55)_100%)]" />

      <svg viewBox="0 0 1000 1000" className="absolute inset-0 h-full w-full">
        <path d={d} fill="none" stroke="#2b1b08" strokeWidth={74} strokeLinejoin="round" opacity={0.55} />
        <path d={d} fill="none" stroke="#7a5426" strokeWidth={66} strokeLinejoin="round" />
        <path d={d} fill="none" stroke="#e6cc98" strokeWidth={56} strokeLinejoin="round" />

        {slots.map((p, i) => {
          if (i % 3 === 0) return null;
          const n = slots[(i + 1) % total];
          const ang = (Math.atan2(n.y - p.y, n.x - p.x) * 180) / Math.PI;
          return (
            <g key={i} transform={`translate(${p.x * 1000} ${p.y * 1000}) rotate(${ang})`}>
              <rect x={-17} y={-22} width={34} height={44} rx={5} fill={stepColors[i % stepColors.length]} stroke="#3a2810" strokeWidth={2.5} />
              <rect x={-12} y={-17} width={24} height={34} rx={3} fill="none" stroke="#f5e6c0" strokeOpacity={0.45} strokeWidth={1.5} />
            </g>
          );
        })}

        {board.map((tile) => {
          const p = slots[tileSlot(tile.id)];
          const color = typeColor[tile.type] ?? '#7a5426';
          return (
            <g key={tile.id} transform={`translate(${p.x * 1000} ${p.y * 1000})`}>
              <circle r={44} fill="#2b1b08" opacity={0.5} cy={4} />
              <circle r={40} fill="#d9b25c" stroke="#5a3d17" strokeWidth={4} />
              <circle r={31} fill={color} stroke="#f5e6c0" strokeWidth={2.5} />
              <text y={-46} textAnchor="middle" fontSize={15} fontWeight={800} fill="#f5e6c0" stroke="#2b1b08" strokeWidth={4} paintOrder="stroke">
                {String(tile.id).padStart(2, '0')}
              </text>
            </g>
          );
        })}
      </svg>

      {board.map((tile) => {
        const p = slots[tileSlot(tile.id)];
        return (
          <div
            key={tile.id}
            className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
          >
            <Icon name={typeIcon[tile.type] ?? 'Circle'} size={20} className="text-[#f5e6c0] drop-shadow" />
            <span className="absolute top-[calc(100%+22px)] whitespace-nowrap rounded-sm border border-[#d9b25c]/70 bg-[#2b1b08]/85 px-1.5 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.08em] text-[#f5e6c0] sm:text-[0.62rem]">
              {tile.name}
            </span>
          </div>
        );
      })}

      {[...bySlot.entries()].map(([slot, group]) =>
        group.map((pl, idx) => {
          const p = slots[slot];
          const offset = (idx - (group.length - 1) / 2) * 3.2;
          const active = pl.id === currentPlayerId;
          return (
            <div
              key={pl.id}
              title={`${pl.nickname} · ${pl.className} · ${pl.godName}`}
              className="absolute z-10 -translate-x-1/2 -translate-y-[88%] transition-[left,top] duration-150 ease-out"
              style={{ left: `calc(${p.x * 100}% + ${offset}%)`, top: `${p.y * 100}%` }}
            >
              <div className={`relative flex flex-col items-center ${active ? 'animate-bounce' : ''}`}>
                <img
                  src={PAWNS[pl.classId] ?? PAWNS.priest}
                  alt=""
                  className="h-[54px] w-auto drop-shadow-[0_6px_6px_rgba(0,0,0,0.6)] sm:h-[72px]"
                />
                <span
                  className="-mt-1 rounded-full border-2 border-[#f5e6c0] px-1.5 text-[0.55rem] font-bold leading-[1.35] text-white shadow sm:text-[0.6rem]"
                  style={{ background: seatColors[pl.seat % seatColors.length] }}
                >
                  {pl.nickname.slice(0, 8)}
                </span>
              </div>
            </div>
          );
        }),
      )}
    </div>
  );
};

export { seatColors };
export default GameBoard;
