import { useState } from 'react';
import Icon from '@/components/ui/icon';
import SectionHeading from '@/components/SectionHeading';
import { classes } from '@/data/maat';

const ClassesSection = () => {
  const [active, setActive] = useState(classes[0].id);
  const current = classes.find((c) => c.id === active) ?? classes[0];

  return (
    <section id="classes" className="relative overflow-hidden border-t border-border bg-secondary/40 py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-16">
        <SectionHeading
          eyebrow="Классы"
          title="Кем будет ваш Избранный"
          description="Класс определяет, как вы говорите со столом: голосом, мечом, верой или записью. Бог даёт силу — класс решает, во что она превратится."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-[280px_1fr]">
          <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {classes.map((c) => {
              const isActive = c.id === active;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActive(c.id)}
                  aria-pressed={isActive}
                  className={`flex min-w-[170px] items-center gap-3 rounded-sm border px-5 py-4 text-left transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-card-foreground hover:border-primary/60'
                  }`}
                >
                  <img
                    src={c.image}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className={`h-11 w-11 shrink-0 rounded-sm border object-cover transition-opacity ${
                      isActive ? 'border-primary-foreground/40' : 'border-border opacity-80'
                    }`}
                  />
                  <span>
                    <span className="block font-sans text-[0.95rem] font-semibold">{c.name}</span>
                    <span
                      className={`block text-[0.66rem] uppercase tracking-[0.16em] ${
                        isActive ? 'text-primary-foreground/75' : 'text-muted-foreground'
                      }`}
                    >
                      {c.role}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div key={current.id} className="animate-fade-in overflow-hidden rounded-sm border border-border bg-card">
            <div className="relative h-56 w-full overflow-hidden md:h-72">
              <img
                src={current.image}
                alt={`Класс: ${current.name}`}
                className="h-full w-full object-cover object-top"
              />
              <span
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/25 to-transparent"
                aria-hidden="true"
              />
            </div>

            <div className="p-8 pt-5 md:p-10 md:pt-6">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <div className="label-mono">{current.role}</div>
                <h3 className="mt-2 font-sans text-3xl font-extrabold tracking-[-0.02em] text-card-foreground">
                  {current.name}
                </h3>
              </div>
              <span className="flex h-14 w-14 items-center justify-center rounded-sm border border-primary/50 bg-primary/10 text-primary">
                <Icon name={current.icon} size={24} />
              </span>
            </div>

            <p className="mt-6 max-w-2xl text-[0.9rem] leading-relaxed text-muted-foreground">{current.description}</p>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <div className="label-mono mb-2 flex items-center gap-2">
                    <Icon name="Sparkles" size={13} className="text-primary" />
                    Сильная сторона
                  </div>
                  <p className="text-[0.85rem] leading-relaxed text-card-foreground">{current.strength}</p>
                </div>
                <div>
                  <div className="label-mono mb-2 flex items-center gap-2">
                    <Icon name="TriangleAlert" size={13} className="text-primary" />
                    Слабость
                  </div>
                  <p className="text-[0.85rem] leading-relaxed text-card-foreground">{current.weakness}</p>
                </div>
              </div>

              <div className="space-y-4">
                {current.stats.map((s) => (
                  <div key={s.label}>
                    <div className="mb-1.5 flex items-baseline justify-between">
                      <span className="label-mono">{s.label}</span>
                      <span className="font-sans text-sm font-semibold text-primary">{s.value}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
                        style={{ width: `${s.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClassesSection;