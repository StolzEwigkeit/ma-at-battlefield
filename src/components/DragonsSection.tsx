import { useState } from 'react';
import Icon from '@/components/ui/icon';
import SectionHeading from '@/components/SectionHeading';
import { dragonRoles } from '@/data/maat';

const DragonsSection = () => {
  const [flipped, setFlipped] = useState<string | null>(null);

  return (
    <section id="dragons" className="relative overflow-hidden border-t border-border bg-secondary/40 py-24 md:py-32">
      <div
        className="pointer-events-none absolute -left-40 top-1/3 h-[560px] w-[560px] rounded-full"
        style={{ background: 'radial-gradient(circle, hsl(var(--lapis) / 0.14) 0%, transparent 65%)' }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10 lg:px-16">
        <SectionHeading
          eyebrow="Драконы-Сфинксы"
          title="Одно логово — четыре разных встречи"
          description="Сфинкс не бросает кубик. Он смотрит, чей вы Избранный и что ваш бог когда-то ему пообещал. Наведите на карточку — узнаете условие."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dragonRoles.map((d, i) => {
            const open = flipped === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onMouseEnter={() => setFlipped(d.id)}
                onMouseLeave={() => setFlipped(null)}
                onFocus={() => setFlipped(d.id)}
                onBlur={() => setFlipped(null)}
                onClick={() => setFlipped(open ? null : d.id)}
                className={`group relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-sm border p-7 text-left transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  open ? 'border-primary bg-card -translate-y-1.5' : 'border-border bg-card/70'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="label-mono">{String(i + 1).padStart(2, '0')}</span>
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-sm border transition-colors ${
                      open ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-primary'
                    }`}
                  >
                    <Icon name={d.icon} size={18} />
                  </span>
                </div>

                <div className="mt-8">
                  <h3 className="font-sans text-xl font-extrabold tracking-[-0.02em] text-card-foreground">{d.name}</h3>
                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="label-mono mb-1">Когда приходит</div>
                      <p className="text-[0.8rem] leading-relaxed text-muted-foreground">{d.trigger}</p>
                    </div>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        open ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="label-mono mb-1 mt-3 text-primary">Что делает</div>
                      <p className="text-[0.8rem] leading-relaxed text-card-foreground">{d.effect}</p>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-10 flex items-start gap-3 text-[0.82rem] leading-relaxed text-muted-foreground">
          <Icon name="Info" size={15} className="mt-0.5 shrink-0 text-primary" />
          Логово — обоюдоострый механизм: один и тот же вход может принести вам чужую карту или выкинуть вашего
          Избранного на другой конец поля. Карты заданий и снаряжения расширят эти встречи в следующем обновлении.
        </p>
      </div>
    </section>
  );
};

export default DragonsSection;
