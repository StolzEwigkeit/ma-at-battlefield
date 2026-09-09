import { useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';
import SectionHeading from '@/components/SectionHeading';
import { boardTiles } from '@/data/maat';

const typeMeta: Record<string, { icon: string; hint: string }> = {
  храм: { icon: 'Landmark', hint: 'Территория бога' },
  логово: { icon: 'Mountain', hint: 'Дракон выбирает роль' },
  рынок: { icon: 'ArrowLeftRight', hint: 'Обмен и сделки' },
  весы: { icon: 'Scale', hint: 'Взвешивание спора' },
  пустыня: { icon: 'Wind', hint: 'Движение и риск' },
};

const tokenColors = [
  'hsl(var(--primary))',
  'hsl(var(--lapis))',
  'hsl(var(--glow))',
  'hsl(var(--beam))',
  'hsl(20 60% 55%)',
  'hsl(150 30% 40%)',
  'hsl(280 28% 52%)',
];

const BoardSection = () => {
  const [active, setActive] = useState(4);
  const [players, setPlayers] = useState(4);

  const tile = useMemo(() => boardTiles.find((t) => t.id === active) ?? boardTiles[0], [active]);

  return (
    <section id="board" className="relative overflow-hidden border-t border-border py-24 md:py-32">
      <div className="maat-grid-soft pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10 lg:px-16">
        <SectionHeading
          eyebrow="Игровое поле"
          title="Двенадцать клеток круга и фишки Избранных"
          description="Круг замкнут: каждый оборот заканчивается взвешиванием. Нажмите на клетку — увидите, что она делает с вашим ходом."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.35fr_1fr]">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {boardTiles.map((t) => {
              const meta = typeMeta[t.type];
              const isActive = t.id === active;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActive(t.id)}
                  aria-pressed={isActive}
                  className={`group relative flex min-h-[124px] flex-col justify-between rounded-sm border p-4 text-left transition-all duration-200 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    isActive
                      ? 'border-primary bg-primary/10 shadow-[0_16px_40px_-24px_hsl(var(--primary))]'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="label-mono">{String(t.id).padStart(2, '0')}</span>
                    <Icon
                      name={meta.icon}
                      size={16}
                      className={isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}
                    />
                  </div>
                  <div>
                    <div className="font-sans text-[0.92rem] font-semibold leading-tight text-card-foreground">
                      {t.name}
                    </div>
                    <div className="label-mono mt-1.5">{t.type}</div>
                  </div>
                  {isActive && (
                    <span className="absolute inset-x-0 bottom-0 h-[2px] bg-primary" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-5">
            <div className="rounded-sm border border-border bg-card p-6">
              <div className="label-mono">Клетка {String(tile.id).padStart(2, '0')}</div>
              <h3 className="mt-2 font-sans text-xl font-bold text-card-foreground">{tile.name}</h3>
              <div className="mt-3 inline-flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
                <Icon name={typeMeta[tile.type].icon} size={13} className="text-primary" />
                {typeMeta[tile.type].hint}
              </div>
              <p key={tile.id} className="mt-5 animate-fade-in text-[0.88rem] leading-relaxed text-muted-foreground">
                {tile.note}
              </p>
            </div>

            <div className="rounded-sm border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <span className="label-mono">Игроков за столом</span>
                <span className="font-sans text-2xl font-bold text-primary">{players}</span>
              </div>
              <input
                type="range"
                min={2}
                max={7}
                step={1}
                value={players}
                onChange={(e) => setPlayers(Number(e.target.value))}
                aria-label="Количество игроков"
                className="mt-4 h-1 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
              />
              <div className="mt-5 flex flex-wrap gap-2.5">
                {Array.from({ length: players }).map((_, i) => (
                  <span
                    key={i}
                    className="flex h-9 w-9 animate-scale-in items-center justify-center rounded-full border text-[0.68rem] font-semibold text-primary-foreground"
                    style={{ background: tokenColors[i], borderColor: tokenColors[i] }}
                  >
                    {i + 1}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-[0.78rem] leading-relaxed text-muted-foreground">
                {players <= 3
                  ? 'Малый стол: союзы почти не работают, партия быстрая и злая.'
                  : players <= 5
                    ? 'Классический стол: два альянса и один одиночка, который решает исход.'
                    : 'Большой стол: договоров больше, чем ходов. Весы работают на износ.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BoardSection;
