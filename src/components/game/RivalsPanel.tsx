import Icon from '@/components/ui/icon';
import { seatColors } from '@/components/game/GameBoard';
import { GOD_TINT, pawnFor } from '@/components/game/pawns';
import type { GameAlliance, GamePlayer } from '@/lib/gameApi';

type Props = {
  players: GamePlayer[];
  meId: number | null;
  currentPlayerId: number | null;
  alliances: GameAlliance[];
  victoryFeathers: number;
  handLimit: number;
};

const MAX_HEALTH = 12;

const Stat = ({ icon, value, color, title }: { icon: string; value: string | number; color: string; title: string }) => (
  <span
    title={title}
    className="flex items-center gap-1 rounded-full border border-[#e8c878]/70 px-1.5 py-[1px] text-[0.62rem] font-bold text-white shadow"
    style={{ background: color }}
  >
    <Icon name={icon} size={10} />
    {value}
  </span>
);

const RivalCard = ({
  p,
  active,
  ally,
  victoryFeathers,
  handLimit,
}: {
  p: GamePlayer;
  active: boolean;
  ally: boolean;
  victoryFeathers: number;
  handLimit: number;
}) => {
  const hp = Math.max(0, Math.min(MAX_HEALTH, p.health));
  const hpPct = (hp / MAX_HEALTH) * 100;
  const featherPct = Math.min(100, (p.feathers / Math.max(1, victoryFeathers)) * 100);

  return (
    <div
      className={`relative w-[150px] shrink-0 rounded-[9px] p-[2px] shadow-md transition-transform lg:w-full ${
        active ? 'scale-[1.03] shadow-xl' : ''
      } ${p.isOut ? 'opacity-50 grayscale' : ''}`}
      style={{
        background: active
          ? 'linear-gradient(150deg,#f2d492 0%,#c9962f 25%,#8a5c17 50%,#e8c878 75%,#a8741f 100%)'
          : 'linear-gradient(150deg,#c9b27a 0%,#8a6a2f 50%,#b8975a 100%)',
      }}
    >
      <div className="relative flex overflow-hidden rounded-[7px] bg-[#1b1409]">
        <div className={`relative w-[52px] shrink-0 bg-gradient-to-b ${GOD_TINT[p.godId] ?? 'from-[#5a3d17] to-[#1b1409]'}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(242,212,146,0.35),transparent_65%)]" />
          <img
            src={pawnFor(p.godId)}
            alt=""
            className={`absolute bottom-1 left-1/2 h-[62px] w-auto max-w-none -translate-x-1/2 drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)] ${
              active ? 'animate-bounce' : ''
            }`}
          />
          <span
            className="absolute left-1 top-1 h-2.5 w-2.5 rounded-full border border-[#f5e6c0]"
            style={{ background: seatColors[p.seat % seatColors.length] }}
          />
        </div>

        <div className="min-w-0 flex-1 px-2 py-1.5">
          <div className="flex items-center gap-1">
            <span className="truncate font-sans text-[0.72rem] font-extrabold text-[#f5e6c0]">{p.nickname}</span>
            {ally && <Icon name="Handshake" size={11} className="shrink-0 text-[#7fd18b]" />}
            {p.isBot && <Icon name="Bot" size={10} className="shrink-0 text-[#c9b27a]" />}
          </div>
          <div className="truncate text-[0.55rem] uppercase tracking-[0.1em] text-[#c9b27a]">
            {p.isOut ? 'выбыл' : `${p.godName} · ${p.className}`}
          </div>

          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/60" title={`Здоровье ${hp}/${MAX_HEALTH}`}>
            <div
              className={`h-full rounded-full ${hp <= 4 ? 'bg-[#d0453a]' : hp <= 8 ? 'bg-[#d9a23a]' : 'bg-[#4caf5c]'}`}
              style={{ width: `${hpPct}%` }}
            />
          </div>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-black/60" title={`Перья ${p.feathers}/${victoryFeathers}`}>
            <div className="h-full rounded-full bg-[#4a9ad9]" style={{ width: `${featherPct}%` }} />
          </div>

          <div className="mt-1.5 flex flex-wrap gap-1">
            <Stat icon="Heart" value={hp} color="#7a1f1a" title="Здоровье" />
            <Stat icon="Feather" value={p.feathers} color="#1f4f7a" title="Перья" />
            <Stat
              icon="Layers"
              value={p.cards}
              color={p.cards > handLimit ? '#a32b2b' : '#5a3d17'}
              title="Карт на руке"
            />
          </div>
        </div>

        {active && (
          <span className="absolute right-1 top-1 rounded-sm bg-primary px-1 text-[0.5rem] font-bold uppercase tracking-[0.1em] text-primary-foreground">
            ходит
          </span>
        )}
      </div>
    </div>
  );
};

const RivalsPanel = ({ players, meId, currentPlayerId, alliances, victoryFeathers, handLimit }: Props) => {
  const rivals = players.filter((p) => p.id !== meId);
  if (rivals.length === 0) return null;

  const allies = new Set(
    alliances
      .filter((a) => a.status === 'active' && (a.from === meId || a.to === meId))
      .map((a) => (a.from === meId ? a.to : a.from)),
  );

  const sorted = [...rivals].sort((a, b) => Number(a.isOut) - Number(b.isOut) || a.seat - b.seat);

  return (
    <aside aria-label="Соперники" className="min-w-0">
      <div className="label-mono mb-2 flex items-center justify-between">
        <span>Соперники</span>
        <span>{rivals.filter((r) => !r.isOut).length}</span>
      </div>
      <div className="flex gap-2.5 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {sorted.map((p) => (
          <RivalCard
            key={p.id}
            p={p}
            active={p.id === currentPlayerId}
            ally={allies.has(p.id)}
            victoryFeathers={victoryFeathers}
            handLimit={handLimit}
          />
        ))}
      </div>
    </aside>
  );
};

export default RivalsPanel;
