import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { seatColors } from '@/components/game/GameBoard';
import type { GamePlayer, HandCard } from '@/lib/gameApi';

const reqLabel: Record<string, string> = {
  any: 'В любой момент хода',
  храм: 'Только на храме',
  весы: 'Только на весах',
  логово: 'Только в логове',
  рынок: 'Только на рынке',
  пустыня: 'Только в пустыне',
  alliance: 'Нужен действующий союз',
  no_alliance: 'Только без союзов',
  wounded: 'Нужно здоровье 7 и ниже',
};

const kindMeta: Record<string, { label: string; icon: string; accent: string }> = {
  quest: { label: 'задание', icon: 'ScrollText', accent: 'border-primary/50 bg-primary/10 text-primary' },
  gear: { label: 'снаряжение', icon: 'Sword', accent: 'border-border bg-secondary/60 text-foreground' },
  intrigue: { label: 'интрига', icon: 'VenetianMask', accent: 'border-destructive/50 bg-destructive/10 text-destructive' },
};

type Props = {
  hand: HandCard[];
  handLimit: number;
  players: GamePlayer[];
  meId: number | null;
  myTurn: boolean;
  busy: boolean;
  currentTileType: string;
  hasAlliance: boolean;
  myHealth: number;
  onPlay: (card: HandCard, targetId?: number) => void;
};

const HandCards = ({
  hand,
  handLimit,
  players,
  meId,
  myTurn,
  busy,
  currentTileType,
  hasAlliance,
  myHealth,
  onPlay,
}: Props) => {
  const [picking, setPicking] = useState<number | null>(null);

  const targets = players.filter((p) => p.id !== meId && !p.isOut);

  const playable = (card: HandCard) => {
    if (card.requirement === 'any') return true;
    if (card.requirement === 'alliance') return hasAlliance;
    if (card.requirement === 'no_alliance') return !hasAlliance;
    if (card.requirement === 'wounded') return myHealth <= 7;
    return card.requirement === currentTileType;
  };

  const handle = (card: HandCard) => {
    if (card.needsTarget) {
      if (targets.length === 1) {
        onPlay(card, targets[0].id);
        return;
      }
      setPicking(picking === card.id ? null : card.id);
      return;
    }
    onPlay(card);
  };

  return (
    <div className="rounded-sm border border-border bg-card p-6">
      <div className="label-mono mb-4 flex items-center justify-between">
        <span>Ваша рука</span>
        <span className={hand.length >= handLimit ? 'text-destructive' : ''}>
          {hand.length} / {handLimit}
        </span>
      </div>

      {hand.length === 0 ? (
        <p className="text-[0.82rem] leading-relaxed text-muted-foreground">
          Рука пуста. Каждый ход вы тянете карту из колоды, а на рынке — сразу две.
        </p>
      ) : (
        <div className="space-y-2.5">
          {hand.map((card) => {
            const ok = playable(card);
            const meta = kindMeta[card.kind] ?? kindMeta.gear;
            const isPicking = picking === card.id;
            return (
              <div
                key={card.id}
                className={`rounded-sm border p-4 transition-colors ${
                  ok && myTurn ? 'border-primary/60 bg-primary/5' : 'border-border bg-background'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border ${meta.accent}`}>
                    <Icon name={meta.icon} fallback="Sword" size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-sans text-[0.88rem] font-semibold text-card-foreground">{card.name}</div>
                    <div className="label-mono mt-0.5">{meta.label}</div>
                  </div>
                </div>

                <p className="mt-3 text-[0.79rem] leading-relaxed text-muted-foreground">{card.text}</p>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className={`label-mono ${ok ? 'text-primary' : ''}`}>
                    {reqLabel[card.requirement] ?? card.requirement}
                  </span>
                  <button
                    type="button"
                    disabled={!myTurn || !ok || busy || (card.needsTarget && targets.length === 0)}
                    onClick={() => handle(card)}
                    className="shrink-0 rounded-sm bg-primary px-4 py-1.5 text-[0.66rem] uppercase tracking-[0.14em] text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isPicking ? 'Выберите цель' : card.needsTarget ? 'Применить' : 'Разыграть'}
                  </button>
                </div>

                {isPicking && (
                  <div className="mt-3 animate-fade-in border-t border-border pt-3">
                    <div className="label-mono mb-2">Против кого</div>
                    <div className="flex flex-wrap gap-2">
                      {targets.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            setPicking(null);
                            onPlay(card, t.id);
                          }}
                          className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-[0.72rem] text-foreground transition-colors hover:border-primary disabled:opacity-50"
                        >
                          <span
                            className="flex h-5 w-5 items-center justify-center rounded-full text-[0.55rem] font-bold text-primary-foreground"
                            style={{ background: seatColors[t.seat % seatColors.length] }}
                          >
                            {t.nickname.slice(0, 2).toUpperCase()}
                          </span>
                          {t.nickname}
                          <span className="label-mono">{t.feathers}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HandCards;
