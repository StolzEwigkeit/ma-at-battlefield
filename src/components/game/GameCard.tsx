import Icon from '@/components/ui/icon';
import type { HandCard } from '@/lib/gameApi';

const ART: Record<string, string> = {
  quest: 'https://cdn.poehali.dev/projects/bfa830f0-f2cc-4b64-9f77-de1d82d4eb1b/files/9c555dfd-7667-4799-9166-ed723bf1412f.jpg',
  gear: 'https://cdn.poehali.dev/projects/bfa830f0-f2cc-4b64-9f77-de1d82d4eb1b/files/f760c465-eea7-48f4-879a-cd4d9a533ec3.jpg',
  intrigue: 'https://cdn.poehali.dev/projects/bfa830f0-f2cc-4b64-9f77-de1d82d4eb1b/files/8836a9ad-98a1-4e3f-8826-d3fba1ddeae8.jpg',
};

const KIND_LABEL: Record<string, string> = {
  quest: 'Задание',
  gear: 'Снаряжение',
  intrigue: 'Интрига',
};

const KIND_ICON: Record<string, string> = {
  quest: 'ScrollText',
  gear: 'Sword',
  intrigue: 'VenetianMask',
};

export const CARD_STATS: Record<string, { feathers: number; health: number; power: number }> = {
  'q-temple-three': { feathers: 3, health: 0, power: 0 },
  'q-scales': { feathers: 4, health: 0, power: 0 },
  'q-dragon-tribute': { feathers: 5, health: -2, power: 0 },
  'q-market-deal': { feathers: 2, health: 0, power: 0 },
  'q-desert-march': { feathers: 3, health: -1, power: 0 },
  'q-alliance-oath': { feathers: 3, health: 0, power: 0 },
  'q-night-vigil': { feathers: 2, health: 2, power: 0 },
  'q-lone-wolf': { feathers: 4, health: 0, power: 0 },
  'q-caravan': { feathers: 1, health: 0, power: 0 },
  'q-wounded-pilgrim': { feathers: 3, health: 3, power: 0 },
  'g-ankh': { feathers: 0, health: 4, power: 0 },
  'g-khopesh': { feathers: 0, health: 0, power: 3 },
  'g-spear': { feathers: 0, health: 0, power: 5 },
  'g-sandals': { feathers: 0, health: 0, power: 0 },
  'g-barque': { feathers: 0, health: 0, power: 0 },
  'g-amulet': { feathers: 1, health: 2, power: 0 },
  'g-scroll': { feathers: 0, health: 0, power: 0 },
  'g-shield': { feathers: 1, health: 3, power: 0 },
  'g-canopic': { feathers: 0, health: 6, power: 0 },
  'g-crown': { feathers: 3, health: 0, power: 0 },
  'i-theft': { feathers: 0, health: 0, power: 0 },
  'i-slander': { feathers: 1, health: 0, power: 0 },
  'i-sandstorm': { feathers: 0, health: 0, power: 0 },
  'i-plague': { feathers: 0, health: 0, power: 3 },
  'i-broken-oath': { feathers: 2, health: 0, power: 0 },
};

type Props = {
  card: HandCard;
  playable: boolean;
  selected?: boolean;
  onClick?: () => void;
};

const GameCard = ({ card, playable, selected, onClick }: Props) => {
  const stats = CARD_STATS[card.cardId] ?? { feathers: 0, health: 0, power: 0 };
  const art = ART[card.kind] ?? ART.gear;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group relative block w-full text-left transition-transform duration-200 ${
        onClick ? 'hover:-translate-y-2' : ''
      } ${selected ? '-translate-y-2' : ''}`}
    >
      <div
        className={`relative aspect-[5/7] overflow-hidden rounded-[10px] p-[3px] shadow-lg transition-shadow ${
          selected ? 'shadow-2xl ring-2 ring-primary ring-offset-2 ring-offset-card' : ''
        }`}
        style={{
          background: playable
            ? 'linear-gradient(150deg,#f2d492 0%,#c9962f 22%,#8a5c17 48%,#e8c878 70%,#a8741f 100%)'
            : 'linear-gradient(150deg,#b9ae95 0%,#8a7f68 40%,#6b6151 70%,#a09a88 100%)',
        }}
      >
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[7px] bg-[#1b1409]">
          <img
            src={art}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
          {!playable && <div className="absolute inset-0 bg-[#1b1409]/45 saturate-[0.35]" />}

          <div className="absolute inset-[5px] rounded-[5px] border border-[#e8c878]/45" />

          <div className="relative flex items-start justify-between p-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#e8c878] bg-gradient-to-b from-[#2a6fa8] to-[#123e63] font-sans text-[0.9rem] font-extrabold text-white shadow-md">
              {stats.feathers}
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#e8c878] bg-gradient-to-b from-[#3a2a12] to-[#160f05] text-[#f2d492] shadow-md">
              <Icon name={KIND_ICON[card.kind] ?? 'Sword'} fallback="Sword" size={13} />
            </span>
          </div>

          <div className="relative mt-auto px-2 pb-2">
            <div className="rounded-[4px] border border-[#e8c878]/60 bg-gradient-to-b from-[#f5e6c0] to-[#d9bf87] px-2 py-1.5 text-center shadow">
              <div className="truncate font-sans text-[0.78rem] font-extrabold uppercase tracking-[0.02em] text-[#4a2f0c]">
                {card.name}
              </div>
              <div className="truncate text-[0.56rem] uppercase tracking-[0.18em] text-[#8a6a2f]">
                {KIND_LABEL[card.kind] ?? ''}
              </div>
            </div>

            <div className="mt-1.5 flex items-center justify-between gap-1">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#e8c878] font-sans text-[0.72rem] font-extrabold text-white shadow ${
                  stats.health >= 0
                    ? 'bg-gradient-to-b from-[#2f7a3c] to-[#12401c]'
                    : 'bg-gradient-to-b from-[#a32b2b] to-[#5e1212]'
                }`}
                title="Здоровье"
              >
                {stats.health > 0 ? `+${stats.health}` : stats.health}
              </span>
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#e8c878] bg-gradient-to-b from-[#a32b2b] to-[#5e1212] font-sans text-[0.72rem] font-extrabold text-white shadow"
                title="Сила"
              >
                {stats.power}
              </span>
            </div>
          </div>

          {!playable && (
            <span className="absolute left-1/2 top-[38%] -translate-x-1/2 rounded-sm border border-[#e8c878]/60 bg-black/80 px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.16em] text-[#f2d492]">
              не готова
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default GameCard;