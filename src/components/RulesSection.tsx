import { useState } from 'react';
import Icon from '@/components/ui/icon';
import SectionHeading from '@/components/SectionHeading';
import ScalesOfMaat from '@/components/ScalesOfMaat';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { rules } from '@/data/maat';

const RulesSection = () => {
  const [order, setOrder] = useState(5);
  const [chaos, setChaos] = useState(3);

  const diff = order - chaos;
  const tilt = Math.max(-6, Math.min(6, -diff * 0.9));

  const verdict =
    diff > 1
      ? 'Перевешивает порядок: спор решён в пользу того, кто поставил на закон.'
      : diff < -1
        ? 'Перевешивает хаос: ставка игрока принята, локация меняет хозяина.'
        : 'Равновесие: перо истины добавляет свой вес — исход решает последняя карта.';

  return (
    <section id="rules" className="relative border-t border-border py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-16">
        <SectionHeading
          eyebrow="Правила и механики"
          title="Как устроена партия за космический закон"
          description="Четыре механики держат всю игру. Разверните блок — внутри короткий свод, которого хватает, чтобы сесть за стол."
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_460px]">
          <Accordion type="single" collapsible defaultValue="scales" className="w-full">
            {rules.map((r) => (
              <AccordionItem key={r.id} value={r.id} className="border-border">
                <AccordionTrigger className="py-6 text-left hover:no-underline">
                  <span className="flex items-start gap-4 pr-4">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-primary/40 bg-primary/10 text-primary">
                      <Icon name={r.icon} size={16} />
                    </span>
                    <span>
                      <span className="block font-sans text-[1.05rem] font-bold tracking-[-0.01em] text-foreground">
                        {r.title}
                      </span>
                      <span className="mt-1 block text-[0.8rem] font-normal leading-relaxed text-muted-foreground">
                        {r.short}
                      </span>
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-7 pl-[52px]">
                  <div className="mb-5 overflow-hidden rounded-sm border border-border">
                    <img
                      src={r.image}
                      alt={r.title}
                      loading="lazy"
                      className="h-44 w-full object-cover md:h-52"
                    />
                  </div>
                  <ul className="space-y-3">
                    {r.points.map((p) => (
                      <li key={p} className="flex gap-3 text-[0.85rem] leading-relaxed text-muted-foreground">
                        <Icon name="Minus" size={14} className="mt-1 shrink-0 text-primary" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="rounded-sm border border-border bg-card p-7">
            <div className="label-mono">Живой рандомайзер</div>
            <h3 className="mt-2 font-sans text-xl font-bold text-card-foreground">Попробуйте взвесить спор</h3>

            <div className="relative -my-4 flex justify-center">
              <ScalesOfMaat className="h-auto w-full max-w-[330px]" tilt={tilt} />
            </div>

            <div className="space-y-5">
              <div>
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="label-mono">Чаша порядка</span>
                  <span className="font-sans text-sm font-semibold text-foreground">{order}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  aria-label="Вес чаши порядка"
                  className="h-1 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
                />
              </div>
              <div>
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="label-mono">Чаша хаоса</span>
                  <span className="font-sans text-sm font-semibold text-primary">{chaos}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={chaos}
                  onChange={(e) => setChaos(Number(e.target.value))}
                  aria-label="Вес чаши хаоса"
                  className="h-1 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
                />
              </div>
            </div>

            <p className="mt-6 border-t border-border pt-5 text-[0.84rem] leading-relaxed text-muted-foreground">
              {verdict}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RulesSection;