import Icon from '@/components/ui/icon';
import type { GamePlayer } from '@/lib/gameApi';

const typeIcon: Record<string, string> = {
  храм: 'Landmark',
  логово: 'Mountain',
  рынок: 'ArrowLeftRight',
  весы: 'Scale',
  пустыня: 'Wind',
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

type Props = {
  board: { id: number; name: string; type: string }[];
  players: GamePlayer[];
  currentPlayerId: number | null;
};

const GameBoard = ({ board, players, currentPlayerId }: Props) => (
  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
    {board.map((tile) => {
      const here = players.filter((p) => p.position === tile.id && !p.isOut);
      return (
        <div
          key={tile.id}
          className={`relative flex min-h-[112px] flex-col justify-between rounded-sm border p-3.5 transition-colors ${
            here.some((p) => p.id === currentPlayerId)
              ? 'border-primary bg-primary/10'
              : 'border-border bg-card'
          }`}
        >
          <div className="flex items-start justify-between">
            <span className="label-mono">{String(tile.id).padStart(2, '0')}</span>
            <Icon name={typeIcon[tile.type] ?? 'Circle'} size={15} className="text-primary" />
          </div>
          <div>
            <div className="font-sans text-[0.82rem] font-semibold leading-tight text-card-foreground">
              {tile.name}
            </div>
            <div className="label-mono mt-1">{tile.type}</div>
          </div>
          {here.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {here.map((p) => (
                <span
                  key={p.id}
                  title={`${p.nickname} · ${p.godName}`}
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[0.6rem] font-bold text-primary-foreground ${
                    p.id === currentPlayerId ? 'ring-2 ring-foreground ring-offset-1 ring-offset-card' : ''
                  }`}
                  style={{ background: seatColors[p.seat % seatColors.length] }}
                >
                  {p.nickname.slice(0, 2).toUpperCase()}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    })}
  </div>
);

export { seatColors };
export default GameBoard;
