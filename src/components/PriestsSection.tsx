import { useState } from 'react';
import Icon from '@/components/ui/icon';
import SectionHeading from '@/components/SectionHeading';

type Priest = {
  id: string;
  variant: string;
  title: string;
  image: string;
  quote: string;
  description: string;
  abilities: { icon: string; name: string; text: string }[];
  gear: string[];
};

const priests: Priest[] = [
  {
    id: 'male',
    variant: 'Мужская версия',
    title: 'Хем-нечер Анпу',
    image: 'https://cdn.poehali.dev/projects/bfa830f0-f2cc-4b64-9f77-de1d82d4eb1b/bucket/00c3c52f-4042-4285-8782-05fd66297a36.png',
    quote: 'Я не сужу. Я лишь держу весы ровно.',
    description:
      'Бальзамировщик и проводник. Он идёт первым в логово Сфинкса, потому что смерть для него — не конец хода, а часть ритуала. Там, где другие теряют Избранного, жрец Анпу забирает его перо.',
    abilities: [
      { icon: 'Skull', name: 'Проводник', text: 'Один раз за партию возвращает выбывшего Избранного на клетку Врат вместо выхода из игры.' },
      { icon: 'Scale', name: 'Взвешивание', text: 'Перед броском весов видит, какая чаша тяжелее, но не может изменить результат.' },
      { icon: 'Shield', name: 'Печать бальзама', text: 'Гасит один штраф бога до конца круга — свой или соседа по столу.' },
    ],
    gear: ['Маска шакала', 'Коса-анх', 'Оплечье усех', 'Сандалии с копьём'],
  },
  {
    id: 'female',
    variant: 'Женская версия',
    title: 'Хемет-нечер Анпут',
    image: 'https://cdn.poehali.dev/projects/bfa830f0-f2cc-4b64-9f77-de1d82d4eb1b/bucket/14b4331f-cc50-42aa-a38a-dd8e10ceddaf.png',
    quote: 'Каждое имя я помню. Ни одно не пропало.',
    description:
      'Плакальщица и хранительница списков. Она ведёт счёт долгам стола: кто кому обещал, кто нарушил слово. В конце партии её память превращается в очки — или в приговор.',
    abilities: [
      { icon: 'ScrollText', name: 'Список имён', text: 'Записывает одно обещание игрока. Нарушил — теряет перо в пользу жрицы.' },
      { icon: 'Feather', name: 'Плач по павшему', text: 'Когда чей-то Избранный выбывает, забирает одну его карту снаряжения.' },
      { icon: 'Eye', name: 'Ночное бдение', text: 'Проходит клетку Тьмы без проверки весов один раз за партию.' },
    ],
    gear: ['Маска шакала', 'Коса-анх', 'Ожерелье с сердоликом', 'Наручи писца'],
  },
];

const PriestsSection = () => {
  const [active, setActive] = useState(priests[0].id);
  const current = priests.find((p) => p.id === active) ?? priests[0];

  return (
    <section id="priests" className="relative overflow-hidden border-t border-border bg-background py-24 md:py-32">
      <div
        className="pointer-events-none absolute -right-32 top-24 h-[520px] w-[520px] rounded-full"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, transparent 68%)' }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10 lg:px-16">
        <SectionHeading
          eyebrow="Жрецы Анубиса"
          title="Жрецы Анпу — те, кто ведёт счёт душам"
          description="Отдельная фракция стола. Они не воюют за трон: их дело — взвешивать сердца, помнить долги и провожать выбывших. Две версии образа, одна роль."
        />

        <div className="mt-12 inline-flex rounded-sm border border-border bg-card p-1">
          {priests.map((p) => {
            const isActive = p.id === active;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActive(p.id)}
                aria-pressed={isActive}
                className={`rounded-sm px-5 py-2.5 text-[0.72rem] uppercase tracking-[0.16em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {p.variant}
              </button>
            );
          })}
        </div>

        <div key={current.id} className="mt-8 grid animate-fade-in gap-8 lg:grid-cols-[1.15fr_1fr]">
          <div className="relative overflow-hidden rounded-sm border border-border bg-secondary/50 p-4 md:p-6">
            <img
              src={current.image}
              alt={`${current.title} — три ракурса и снаряжение`}
              loading="lazy"
              className="w-full rounded-sm object-contain"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {current.gear.map((g) => (
                <span
                  key={g}
                  className="rounded-sm border border-border bg-card px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-sm border border-border bg-card p-8 md:p-10">
            <div>
              <div className="label-mono">{current.variant}</div>
              <h3 className="mt-2 font-sans text-3xl font-extrabold tracking-[-0.02em] text-card-foreground">
                {current.title}
              </h3>
              <p className="mt-5 border-l-2 border-primary pl-4 font-serif text-[1rem] italic leading-relaxed text-card-foreground">
                «{current.quote}»
              </p>
              <p className="mt-5 text-[0.9rem] leading-relaxed text-muted-foreground">{current.description}</p>
            </div>

            <div className="mt-8 space-y-5">
              {current.abilities.map((a) => (
                <div key={a.name} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-primary/50 bg-primary/10 text-primary">
                    <Icon name={a.icon} size={18} />
                  </span>
                  <div>
                    <div className="font-sans text-[0.95rem] font-semibold text-card-foreground">{a.name}</div>
                    <p className="mt-1 text-[0.82rem] leading-relaxed text-muted-foreground">{a.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PriestsSection;
