import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { seatColors } from '@/components/game/GameBoard';
import GameCard from '@/components/game/GameCard';
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
  onDiscard: (card: HandCard) => void;
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
  onDiscard,
}: Props) => {
  const [openId, setOpenId] = useState<number | null>(null);
  const [picking, setPicking] = useState(false);

  const targets = players.filter((p) => p.id !== meId && !p.isOut);
  const overflow = Math.max(0, hand.length - handLimit);

  const playable = (card: HandCard) => {
    if (card.requirement === 'any') return true;
    if (card.requirement === 'alliance') return hasAlliance;
    if (card.requirement === 'no_alliance') return !hasAlliance;
    if (card.requirement === 'wounded') return myHealth <= 7;
    return card.requirement === currentTileType;
  };

  const open = hand.find((c) => c.id === openId) ?? null;
  const openOk = open ? playable(open) : false;

  const play = (card: HandCard) => {
    if (card.needsTarget) {
      if (targets.length === 1) {
        setOpenId(null);
        onPlay(card, targets[0].id);
        return;
      }
      setPicking(true);
      return;
    }
    setOpenId(null);
    onPlay(card);
  };

  return (
    <div className="rounded-sm border border-border bg-card p-6">
      <div className="label-mono mb-4 flex items-center justify-between">
        <span>Ваша рука</span>
        <span className={overflow > 0 ? 'text-destructive' : hand.length >= handLimit ? 'text-primary' : ''}>
          {hand.length} / {handLimit}
        </span>
      </div>

      {overflow > 0 && (
        <div className="mb-4 flex items-start gap-3 rounded-sm border border-destructive/50 bg-destructive/10 p-4">
          <Icon name="TriangleAlert" size={16} className="mt-0.5 shrink-0 text-destructive" />
          <p className="text-[0.79rem] leading-relaxed text-foreground">
            Перебор на {overflow} {overflow === 1 ? 'карту' : 'карты'}. Сбросьте лишнее — иначе ход недоступен.
          </p>
        </div>
      )}

      {hand.length === 0 ? (
        <p className="text-[0.82rem] leading-relaxed text-muted-foreground">
          Рука пуста. Каждый ход вы тянете карту из колоды, а на рынке — сразу две.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-2">
            {hand.map((card) => (
              <GameCard
                key={card.id}
                card={card}
                playable={playable(card)}
                selected={openId === card.id}
                onClick={() => {
                  setPicking(false);
                  setOpenId(openId === card.id ? null : card.id);
                }}
              />
            ))}
          </div>

          {open && (
            <div className="mt-5 animate-fade-in rounded-sm border border-primary/50 bg-primary/5 p-5">
              <div className="font-sans text-[0.95rem] font-bold text-card-foreground">{open.name}</div>
              <p className="mt-2 text-[0.82rem] leading-relaxed text-muted-foreground">{open.text}</p>
              <div className={`label-mono mt-3 ${openOk ? 'text-primary' : 'text-destructive'}`}>
                {reqLabel[open.requirement] ?? open.requirement}
              </div>

              {picking ? (
                <div className="mt-4 border-t border-border pt-4">
                  <div className="label-mono mb-2">Против кого</div>
                  <div className="flex flex-wrap gap-2">
                    {targets.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setPicking(false);
                          setOpenId(null);
                          onPlay(open, t.id);
                        }}
                        className="inline-flex items-center gap-2 rounded-sm border border-border bg-background px-3 py-2 text-[0.72rem] text-foreground transition-colors hover:border-primary disabled:opacity-50"
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
              ) : (
                <div className="mt-4 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    disabled={!myTurn || !openOk || busy || overflow > 0 || (open.needsTarget && targets.length === 0)}
                    onClick={() => play(open)}
                    className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-[0.7rem] uppercase tracking-[0.14em] text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Icon name="Sparkles" size={13} />
                    {open.needsTarget ? 'Применить' : 'Разыграть'}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setOpenId(null);
                      onDiscard(open);
                    }}
                    className={`inline-flex items-center gap-2 rounded-sm border px-4 py-2.5 text-[0.7rem] uppercase tracking-[0.14em] transition-colors disabled:opacity-40 ${
                      overflow > 0
                        ? 'border-destructive bg-destructive/15 text-destructive hover:bg-destructive hover:text-primary-foreground'
                        : 'border-border text-muted-foreground hover:border-destructive hover:text-destructive'
                    }`}
                  >
                    <Icon name="Trash2" size={13} />
                    Сбросить
                  </button>
                </div>
              )}
            </div>
          )}

          {!open && (
            <p className="mt-4 text-[0.75rem] text-muted-foreground">
              Нажмите на карту, чтобы прочитать её и разыграть.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default HandCards;