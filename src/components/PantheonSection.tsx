import { useState } from 'react';
import Icon from '@/components/ui/icon';
import SectionHeading from '@/components/SectionHeading';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { gods, type God } from '@/data/maat';

const PantheonSection = () => {
  const [selected, setSelected] = useState<God | null>(null);

  return (
    <section id="pantheon" className="relative border-t border-border py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-16">
        <SectionHeading
          eyebrow="Пантеон"
          title="Семь богов, семь разных партий"
          description="Бог выбирается в начале партии и уже не меняется. Он даёт вам уникальный бонус — и уникальный штраф, который придётся терпеть до конца. Нажмите на имя, чтобы раскрыть карточку."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gods.map((god, i) => (
            <button
              key={god.id}
              type="button"
              onClick={() => setSelected(god)}
              className="group relative flex flex-col overflow-hidden rounded-sm border border-border bg-card text-left transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/70 hover:shadow-[0_28px_60px_-38px_hsl(var(--primary))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <div className="relative h-52 w-full overflow-hidden">
                <img
                  src={god.image}
                  alt={`Портрет: ${god.name}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/35 to-transparent"
                  aria-hidden="true"
                />
                <span className="label-mono absolute left-5 top-4 text-foreground/80">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="absolute right-5 top-3 font-display text-3xl leading-none text-primary">
                  {god.glyph}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-7 pt-3">
              <h3 className="font-sans text-2xl font-extrabold tracking-[-0.02em] text-card-foreground">
                {god.name}
              </h3>
              <div className="mt-1 font-display text-lg italic text-muted-foreground">{god.epithet}</div>

              <div className="mt-5 flex items-start gap-2 text-[0.8rem] leading-relaxed text-muted-foreground">
                <Icon name="Sparkles" size={14} className="mt-0.5 shrink-0 text-primary" />
                <span className="line-clamp-2">{god.bonus}</span>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <span className="label-mono">{god.domain}</span>
                <span className="inline-flex items-center gap-1.5 text-[0.68rem] uppercase tracking-[0.16em] text-primary">
                  Карточка
                  <Icon name="ArrowUpRight" size={13} />
                </span>
              </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-sm border-border bg-popover sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <div className="relative -mx-6 -mt-6 mb-4 h-56 overflow-hidden">
                  <img
                    src={selected.image}
                    alt={`Портрет: ${selected.name}`}
                    className="h-full w-full object-cover"
                  />
                  <span
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-popover via-popover/20 to-transparent"
                    aria-hidden="true"
                  />
                </div>
                <div className="mb-3 flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border border-primary/50 bg-primary/10 font-display text-2xl text-primary">
                    {selected.glyph}
                  </span>
                  <div>
                    <DialogTitle className="text-left font-sans text-2xl font-extrabold tracking-[-0.02em]">
                      {selected.name}
                    </DialogTitle>
                    <div className="font-display text-base italic text-muted-foreground">{selected.epithet}</div>
                  </div>
                </div>
                <DialogDescription className="text-left text-[0.88rem] leading-relaxed">
                  {selected.description}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-2 space-y-3">
                {[
                  { icon: 'Sparkles', label: 'Бонус', text: selected.bonus },
                  { icon: 'TriangleAlert', label: 'Штраф', text: selected.penalty },
                  { icon: 'Mountain', label: 'Драконы', text: selected.dragonAttitude },
                ].map((row) => (
                  <div key={row.label} className="rounded-sm border border-border bg-card p-4">
                    <div className="label-mono mb-2 flex items-center gap-2">
                      <Icon name={row.icon} size={13} className="text-primary" />
                      {row.label}
                    </div>
                    <p className="text-[0.85rem] leading-relaxed text-card-foreground">{row.text}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default PantheonSection;