import Icon from '@/components/ui/icon';
import { seatColors } from '@/components/game/GameBoard';
import type { GameAlliance, GamePlayer } from '@/lib/gameApi';

type Props = {
  players: GamePlayer[];
  currentPlayerId: number | null;
  meId: number | null;
  alliances: GameAlliance[];
  onAlly: (targetId: number) => void;
  busy: boolean;
  playing: boolean;
};

const PlayerList = ({ players, currentPlayerId, meId, alliances, onAlly, busy, playing }: Props) => {
  const hasBond = (id: number) =>
    alliances.some(
      (a) =>
        a.status !== 'broken' &&
        ((a.from === meId && a.to === id) || (a.to === meId && a.from === id)),
    );

  return (
    <div className="space-y-2.5">
      {players.map((p) => {
        const isMe = p.id === meId;
        const isTurn = p.id === currentPlayerId;
        return (
          <div
            key={p.id}
            className={`rounded-sm border p-4 transition-colors ${
              isTurn ? 'border-primary bg-primary/10' : 'border-border bg-card'
            } ${p.isOut ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-bold text-primary-foreground"
                style={{ background: seatColors[p.seat % seatColors.length] }}
              >
                {p.nickname.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-sans text-[0.9rem] font-semibold text-card-foreground">
                    {p.nickname}
                  </span>
                  {isMe && <span className="label-mono text-primary">вы</span>}
                  {p.isBot && <Icon name="Bot" size={13} className="shrink-0 text-muted-foreground" />}
                  {p.isHost && <Icon name="Crown" size={13} className="shrink-0 text-primary" />}
                </div>
                <div className="label-mono mt-0.5 truncate">
                  {p.godName} · {p.className}
                </div>
              </div>
              {p.isOut && <span className="label-mono text-destructive">выбыл</span>}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { icon: 'Heart', value: p.health, title: 'Здоровье' },
                { icon: 'Feather', value: p.feathers, title: 'Перья' },
                { icon: 'Layers', value: p.cards, title: 'Карты' },
              ].map((s) => (
                <span
                  key={s.icon}
                  title={s.title}
                  className="flex items-center justify-center gap-1.5 rounded-sm border border-border bg-background py-1.5 text-[0.78rem] font-semibold text-foreground"
                >
                  <Icon name={s.icon} size={13} className="text-primary" />
                  {s.value}
                </span>
              ))}
            </div>

            {playing && !isMe && !p.isOut && meId && !hasBond(p.id) && (
              <button
                type="button"
                disabled={busy}
                onClick={() => onAlly(p.id)}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-border px-3 py-2 text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-50"
              >
                <Icon name="Handshake" size={13} />
                Предложить союз
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PlayerList;