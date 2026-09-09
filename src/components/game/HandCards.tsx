import Icon from '@/components/ui/icon';
import type { HandCard } from '@/lib/gameApi';

const reqLabel: Record<string, string> = {
  any: 'В любой момент хода',
  храм: 'Только на храме',
  весы: 'Только на весах',
  логово: 'Только в логове',
  рынок: 'Только на рынке',
  пустыня: 'Только в пустыне',
  alliance: 'Нужен действующий союз',
};

type Props = {
  hand: HandCard[];
  myTurn: boolean;
  busy: boolean;
  currentTileType: string;
  hasAlliance: boolean;
  onPlay: (card: HandCard) => void;
};

const HandCards = ({ hand, myTurn, busy, currentTileType, hasAlliance, onPlay }: Props) => {
  const playable = (card: HandCard) => {
    if (card.requirement === 'any') return true;
    if (card.requirement === 'alliance') return hasAlliance;
    return card.requirement === currentTileType;
  };

  return (
    <div className="rounded-sm border border-border bg-card p-6">
      <div className="label-mono mb-4 flex items-center justify-between">
        <span>Ваша рука</span>
        <span>{hand.length} карт</span>
      </div>

      {hand.length === 0 ? (
        <p className="text-[0.82rem] leading-relaxed text-muted-foreground">
          Карт нет. Встаньте на клетку рынка, чтобы вытянуть новую.
        </p>
      ) : (
        <div className="space-y-2.5">
          {hand.map((card) => {
            const ok = playable(card);
            const isQuest = card.kind === 'quest';
            return (
              <div
                key={card.id}
                className={`rounded-sm border p-4 transition-colors ${
                  ok && myTurn ? 'border-primary/60 bg-primary/5' : 'border-border bg-background'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border ${
                      isQuest ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                    }`}
                  >
                    <Icon name={isQuest ? 'ScrollText' : 'Sword'} size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-sans text-[0.88rem] font-semibold text-card-foreground">{card.name}</div>
                    <div className="label-mono mt-0.5">{isQuest ? 'задание' : 'снаряжение'}</div>
                  </div>
                </div>

                <p className="mt-3 text-[0.79rem] leading-relaxed text-muted-foreground">{card.text}</p>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className={`label-mono ${ok ? 'text-primary' : ''}`}>
                    {reqLabel[card.requirement] ?? card.requirement}
                  </span>
                  <button
                    type="button"
                    disabled={!myTurn || !ok || busy}
                    onClick={() => onPlay(card)}
                    className="shrink-0 rounded-sm bg-primary px-4 py-1.5 text-[0.66rem] uppercase tracking-[0.14em] text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Разыграть
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HandCards;
