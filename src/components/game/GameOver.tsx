import Icon from '@/components/ui/icon';
import { seatColors } from '@/components/game/GameBoard';
import type { GamePlayer, GameState } from '@/lib/gameApi';

const VICTORY_IMAGE =
  'https://cdn.poehali.dev/projects/bfa830f0-f2cc-4b64-9f77-de1d82d4eb1b/files/dc4b9f5b-f090-4d58-8089-30075e1471ee.jpg';

const medal = ['Trophy', 'Medal', 'Award'];

type Props = {
  state: GameState;
  me: GamePlayer | null;
  busy: boolean;
  onRestart: () => void;
  onLeave: () => void;
};

const GameOver = ({ state, me, busy, onRestart, onLeave }: Props) => {
  const standings = [...state.players].sort((a, b) => {
    if (a.isOut !== b.isOut) return a.isOut ? 1 : -1;
    if (b.feathers !== a.feathers) return b.feathers - a.feathers;
    return b.health - a.health;
  });

  const winner = standings[0];
  const iWon = !!me && winner?.id === me.id;
  const reason = state.log.find((l) => l.kind === 'victory')?.text ?? '';
  const rounds = state.table.round;

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 md:py-16">
      <div className="overflow-hidden rounded-sm border border-border bg-card">
        <div className="relative h-56 w-full overflow-hidden md:h-72">
          <img src={VICTORY_IMAGE} alt="" aria-hidden="true" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/45 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-7 md:p-9">
            <div className="label-mono text-primary">
              {iWon ? 'Ваша победа' : 'Партия окончена'} · круг {rounds}
            </div>
            <h1 className="mt-2 font-sans text-[clamp(1.7rem,4.6vw,2.7rem)] font-extrabold leading-tight tracking-[-0.03em] text-foreground">
              {winner ? winner.nickname : 'Весы взвешены'}
              {winner && <span className="text-primary"> — перевесил чашу</span>}
            </h1>
            {winner && (
              <div className="mt-1 font-display text-base italic text-muted-foreground">
                {winner.godName} · {winner.className}
              </div>
            )}
          </div>
        </div>

        <div className="p-7 md:p-9">
          {reason && (
            <p className="flex items-start gap-3 text-[0.88rem] leading-relaxed text-muted-foreground">
              <Icon name="Scale" size={16} className="mt-0.5 shrink-0 text-primary" />
              {reason}
            </p>
          )}

          <div className="mt-8">
            <div className="label-mono mb-4">Итоговая таблица перьев</div>
            <div className="overflow-hidden rounded-sm border border-border">
              <div className="grid grid-cols-[36px_1fr_auto] items-center gap-3 border-b border-border bg-secondary/50 px-4 py-2.5 text-[0.66rem] uppercase tracking-[0.16em] text-muted-foreground sm:grid-cols-[36px_1fr_90px_90px_90px]">
                <span>#</span>
                <span>Избранный</span>
                <span className="hidden text-right sm:block">Здоровье</span>
                <span className="hidden text-right sm:block">Карты</span>
                <span className="text-right">Перья</span>
              </div>

              {standings.map((p, i) => {
                const isMe = p.id === me?.id;
                return (
                  <div
                    key={p.id}
                    className={`grid grid-cols-[36px_1fr_auto] items-center gap-3 border-b border-border px-4 py-3.5 last:border-b-0 sm:grid-cols-[36px_1fr_90px_90px_90px] ${
                      isMe ? 'bg-primary/10' : i === 0 ? 'bg-primary/5' : 'bg-card'
                    } ${p.isOut ? 'opacity-60' : ''}`}
                  >
                    <span className="flex items-center">
                      {i < 3 ? (
                        <Icon
                          name={medal[i]}
                          size={16}
                          className={i === 0 ? 'text-primary' : 'text-muted-foreground'}
                        />
                      ) : (
                        <span className="label-mono">{i + 1}</span>
                      )}
                    </span>

                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.6rem] font-bold text-primary-foreground"
                        style={{ background: seatColors[p.seat % seatColors.length] }}
                      >
                        {p.nickname.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate font-sans text-[0.88rem] font-semibold text-card-foreground">
                            {p.nickname}
                          </span>
                          {isMe && <span className="label-mono text-primary">вы</span>}
                          {p.isBot && <Icon name="Bot" size={12} className="shrink-0 text-muted-foreground" />}
                          {p.isOut && <span className="label-mono text-destructive">выбыл</span>}
                        </span>
                        <span className="label-mono block truncate">
                          {p.godName} · {p.className}
                        </span>
                      </span>
                    </span>

                    <span className="hidden text-right text-[0.84rem] text-muted-foreground sm:block">{p.health}</span>
                    <span className="hidden text-right text-[0.84rem] text-muted-foreground sm:block">{p.cards}</span>
                    <span className="text-right font-sans text-[1rem] font-bold text-primary">{p.feathers}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onRestart}
              disabled={busy}
              className="inline-flex items-center gap-3 rounded-sm bg-primary px-7 py-4 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Сыграть заново
              <Icon name="RotateCcw" size={16} />
            </button>
            <button
              type="button"
              onClick={onLeave}
              className="inline-flex items-center gap-2.5 rounded-sm border border-border px-6 py-4 text-[0.78rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              <Icon name="LogOut" size={15} />
              В лобби
            </button>
            {state.table.hasBots && (
              <span className="label-mono">
                те же настройки · соперники {state.table.difficultyName}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-sm border border-border bg-card p-6">
        <div className="label-mono mb-4">Чем закончилась партия</div>
        <div className="space-y-3">
          {state.log.slice(-8).map((l) => (
            <p key={l.id} className="flex gap-3 text-[0.82rem] leading-relaxed text-muted-foreground">
              <Icon
                name={l.kind === 'victory' ? 'Trophy' : 'Dot'}
                size={14}
                className={`mt-0.5 shrink-0 ${l.kind === 'victory' ? 'text-primary' : ''}`}
              />
              {l.text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameOver;
