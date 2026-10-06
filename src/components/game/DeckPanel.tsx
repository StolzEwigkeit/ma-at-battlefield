import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/icon';
import type { DeckInfo } from '@/lib/gameApi';

const ART: Record<string, string> = {
  quest: 'https://cdn.poehali.dev/projects/bfa830f0-f2cc-4b64-9f77-de1d82d4eb1b/files/9c555dfd-7667-4799-9166-ed723bf1412f.jpg',
  gear: 'https://cdn.poehali.dev/projects/bfa830f0-f2cc-4b64-9f77-de1d82d4eb1b/files/f760c465-eea7-48f4-879a-cd4d9a533ec3.jpg',
  intrigue: 'https://cdn.poehali.dev/projects/bfa830f0-f2cc-4b64-9f77-de1d82d4eb1b/files/8836a9ad-98a1-4e3f-8826-d3fba1ddeae8.jpg',
};

const GOLD = 'linear-gradient(150deg,#f2d492 0%,#c9962f 25%,#8a5c17 50%,#e8c878 75%,#a8741f 100%)';

const CardBack = ({ style }: { style?: React.CSSProperties }) => (
  <div className="absolute inset-0 rounded-[7px] p-[2px] shadow-md" style={{ background: GOLD, ...style }}>
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[5px] bg-gradient-to-b from-[#1f3f6b] to-[#0b1a33]">
      <div className="absolute inset-[4px] rounded-[3px] border border-[#e8c878]/50" />
      <div className="absolute inset-[9px] rounded-[2px] border border-[#e8c878]/25" />
      <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#e8c878] bg-[#0b1a33] text-[#f2d492] shadow">
        <Icon name="Eye" size={16} />
      </span>
    </div>
  </div>
);

const Pile = ({
  label,
  count,
  children,
  flash,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
  flash?: boolean;
}) => (
  <div className="flex flex-col items-center">
    <div className={`relative aspect-[5/7] w-full ${flash ? 'animate-pulse' : ''}`}>{children}</div>
    <div className="mt-2 text-center">
      <div className="font-sans text-[0.95rem] font-extrabold leading-none text-foreground">{count}</div>
      <div className="label-mono mt-1">{label}</div>
    </div>
  </div>
);

const DeckPanel = ({ deck }: { deck?: DeckInfo }) => {
  const [flash, setFlash] = useState(false);
  const prev = useRef(deck?.reshuffles ?? 0);

  useEffect(() => {
    const now = deck?.reshuffles ?? 0;
    if (now > prev.current) {
      setFlash(true);
      const t = window.setTimeout(() => setFlash(false), 2400);
      prev.current = now;
      return () => window.clearTimeout(t);
    }
    prev.current = now;
  }, [deck?.reshuffles]);

  if (!deck) return null;

  const backLayers = Math.min(5, Math.ceil(deck.left / 8));
  const pileLayers = [...deck.discardTop].reverse();
  const extra = Math.min(3, Math.max(0, deck.discardCount - deck.discardTop.length));

  return (
    <div className="rounded-sm border border-border bg-card p-3">
      <div className="label-mono mb-3 flex items-center justify-between">
        <span>Колода</span>
        {deck.reshuffles > 0 && (
          <span className="flex items-center gap-1 text-primary" title="Сколько раз сброс возвращался в колоду">
            <Icon name="RefreshCw" size={10} />
            {deck.reshuffles}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Pile label="в колоде" count={deck.left} flash={flash}>
          {deck.left === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-[7px] border-2 border-dashed border-border text-muted-foreground">
              <Icon name="RefreshCw" size={16} />
            </div>
          ) : (
            Array.from({ length: backLayers }).map((_, i) => (
              <CardBack key={i} style={{ transform: `translate(${-i * 1.5}px, ${-i * 1.5}px)` }} />
            ))
          )}
        </Pile>

        <Pile label="сброс" count={deck.discardCount}>
          {deck.discardCount === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-[7px] border-2 border-dashed border-border text-muted-foreground">
              <Icon name="Trash2" size={16} />
            </div>
          ) : (
            <>
              {Array.from({ length: extra }).map((_, i) => (
                <div
                  key={`x${i}`}
                  className="absolute inset-0 rounded-[7px] bg-[#5a3d17] shadow"
                  style={{ transform: `rotate(${(i % 2 ? 1 : -1) * (6 + i * 3)}deg)` }}
                />
              ))}
              {pileLayers.map((c, i) => {
                const isTop = i === pileLayers.length - 1;
                const rot = isTop ? 0 : (i % 2 ? 7 : -8) + i;
                return (
                  <div
                    key={`${c.cardId}-${i}`}
                    title={c.name}
                    className="absolute inset-0 rounded-[7px] p-[2px] shadow-md"
                    style={{ background: GOLD, transform: `rotate(${rot}deg)` }}
                  >
                    <div className="relative h-full w-full overflow-hidden rounded-[5px] bg-[#1b1409]">
                      <img src={ART[c.kind] ?? ART.gear} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/85" />
                      {isTop && (
                        <div className="absolute inset-x-1 bottom-1 rounded-[3px] bg-gradient-to-b from-[#f5e6c0] to-[#d9bf87] px-1 py-0.5 text-center">
                          <div className="truncate text-[0.5rem] font-extrabold uppercase text-[#4a2f0c]">{c.name}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </Pile>
      </div>

      <p className="mt-3 text-[0.68rem] leading-snug text-muted-foreground">
        {flash
          ? 'Сброс перетасован и вернулся в колоду.'
          : deck.left <= 5
            ? 'Колода почти пуста — скоро сброс вернётся в игру.'
            : 'Сыгранные и сброшенные карты копятся здесь.'}
      </p>
    </div>
  );
};

export default DeckPanel;