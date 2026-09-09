import Icon from '@/components/ui/icon';
import type { GameAlliance, GamePlayer, GameState } from '@/lib/gameApi';

const abilityLabel: Record<string, string> = {
  vizier: 'Навязать союз',
  warrior: 'Атаковать соседа',
  priest: 'Усилить бога',
  scribe: 'Править протокол',
};

type Props = {
  state: GameState;
  me: GamePlayer | null;
  busy: boolean;
  onMove: () => void;
  onSkip: () => void;
  onAbility: () => void;
  onAccept: (id: number) => void;
  onBetray: (id: number) => void;
  onStart: () => void;
};

const ActionPanel = ({ state, me, busy, onMove, onSkip, onAbility, onAccept, onBetray, onStart }: Props) => {
  const playing = state.table.status === 'playing';
  const myTurn = playing && me && state.currentPlayerId === me.id && !me.isOut;

  const incoming = state.alliances.filter((a: GameAlliance) => a.status === 'pending' && a.to === me?.id);
  const active = state.alliances.filter(
    (a: GameAlliance) => a.status === 'active' && (a.from === me?.id || a.to === me?.id),
  );

  return (
    <div className="rounded-sm border border-border bg-card p-6">
      {state.table.status === 'lobby' && (
        <>
          <div className="label-mono">Ожидание игроков</div>
          <p className="mt-3 text-[0.85rem] leading-relaxed text-muted-foreground">
            За столом {state.players.length} из {state.table.seats}. Партия начнётся, когда создатель стола её запустит.
          </p>
          {me?.isHost && (
            <button
              type="button"
              onClick={onStart}
              disabled={busy || state.players.length < 2}
              className="mt-5 inline-flex w-full items-center justify-center gap-3 rounded-sm bg-primary px-6 py-3.5 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Начать партию
              <Icon name="Play" size={15} />
            </button>
          )}
        </>
      )}

      {playing && (
        <>
          <div className="label-mono">
            Круг {state.table.round} ·{' '}
            {myTurn ? 'ваш ход' : `ходит ${state.players.find((p) => p.id === state.currentPlayerId)?.nickname ?? '—'}`}
          </div>
          <div className="mt-2 text-[0.78rem] text-muted-foreground">
            До победы: {Math.max(0, (state.victoryFeathers ?? 20) - (me?.feathers ?? 0))} перьев
          </div>

          <div className="mt-5 grid gap-2.5">
            <button
              type="button"
              onClick={onMove}
              disabled={!myTurn || busy}
              className="inline-flex items-center justify-center gap-3 rounded-sm bg-primary px-6 py-3.5 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Бросить кости и ходить
              <Icon name="Dices" size={15} />
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onAbility}
                disabled={!myTurn || busy || !!me?.abilityUsed}
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-border px-4 py-3 text-[0.7rem] uppercase tracking-[0.14em] text-foreground transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon name="Sparkles" size={14} className="text-primary" />
                {me ? abilityLabel[me.classId] ?? 'Способность' : 'Способность'}
              </button>
              <button
                type="button"
                onClick={onSkip}
                disabled={!myTurn || busy}
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-border px-4 py-3 text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon name="SkipForward" size={14} />
                Пропустить
              </button>
            </div>
          </div>

          {incoming.length > 0 && (
            <div className="mt-6 border-t border-border pt-5">
              <div className="label-mono mb-3">Предложения союза</div>
              <div className="space-y-2">
                {incoming.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-3 rounded-sm border border-border bg-background px-3 py-2.5">
                    <span className="truncate text-[0.82rem] text-foreground">{a.fromName}</span>
                    <button
                      type="button"
                      onClick={() => onAccept(a.id)}
                      disabled={busy}
                      className="shrink-0 rounded-sm bg-primary px-3 py-1.5 text-[0.66rem] uppercase tracking-[0.14em] text-primary-foreground disabled:opacity-50"
                    >
                      Принять
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active.length > 0 && (
            <div className="mt-6 border-t border-border pt-5">
              <div className="label-mono mb-3">Действующие союзы</div>
              <div className="space-y-2">
                {active.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-3 rounded-sm border border-border bg-background px-3 py-2.5">
                    <span className="truncate text-[0.82rem] text-foreground">
                      {a.from === me?.id ? a.toName : a.fromName}
                    </span>
                    <button
                      type="button"
                      onClick={() => onBetray(a.id)}
                      disabled={busy}
                      className="shrink-0 rounded-sm border border-destructive/60 px-3 py-1.5 text-[0.66rem] uppercase tracking-[0.14em] text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                    >
                      Предать
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {state.table.status === 'finished' && (
        <>
          <div className="label-mono text-primary">Партия окончена</div>
          <p className="mt-3 text-[0.85rem] leading-relaxed text-muted-foreground">
            {state.log.find((l) => l.kind === 'victory')?.text ?? 'Весы взвешены, круг закрыт.'}
          </p>
        </>
      )}
    </div>
  );
};

export default ActionPanel;