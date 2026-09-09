import { useState } from 'react';
import Icon from '@/components/ui/icon';
import SectionHeading from '@/components/SectionHeading';

type Priest = {
  id: string;
  variant: string;
  title: string;
  image: string;
  scene: string;
  quote: string;
  description: string;
  abilities: { icon: string; name: string; text: string }[];
  gear: string[];
};

type Order = {
  id: string;
  name: string;
  god: string;
  icon: string;
  role: string;
  eyebrow: string;
  heading: string;
  intro: string;
  priests: Priest[];
};

const orders: Order[] = [
  {
    id: 'anubis',
    name: 'Орден Анпу',
    god: 'Анубис',
    icon: 'Scale',
    role: 'Суд и проводы',
    eyebrow: 'Жрецы Анубиса',
    heading: 'Жрецы Анпу — те, кто ведёт счёт душам',
    intro:
      'Они не воюют за трон: их дело — взвешивать сердца, помнить долги и провожать выбывших. Две версии образа, одна роль.',
    priests: [
      {
        id: 'anubis-male',
        variant: 'Мужская версия',
        title: 'Хем-нечер Анпу',
        image: 'https://cdn.poehali.dev/projects/bfa830f0-f2cc-4b64-9f77-de1d82d4eb1b/bucket/00c3c52f-4042-4285-8782-05fd66297a36.png',
        scene: 'https://cdn.poehali.dev/projects/bfa830f0-f2cc-4b64-9f77-de1d82d4eb1b/files/a00730b4-6a6b-487e-b99a-7bbf2917395a.jpg',
        quote: 'Я не сужу. Я лишь держу весы ровно.',
        description:
          'Бальзамировщик и проводник. Он идёт первым в логово дракона, потому что смерть для него — не конец хода, а часть ритуала. Там, где другие теряют Избранного, жрец Анпу забирает его перо.',
        abilities: [
          { icon: 'Skull', name: 'Проводник', text: 'Один раз за партию возвращает выбывшего Избранного на клетку Врат вместо выхода из игры.' },
          { icon: 'Scale', name: 'Взвешивание', text: 'Перед броском весов видит, какая чаша тяжелее, но не может изменить результат.' },
          { icon: 'Shield', name: 'Печать бальзама', text: 'Гасит один штраф бога до конца круга — свой или соседа по столу.' },
        ],
        gear: ['Маска шакала', 'Коса-анх', 'Оплечье усех', 'Сандалии с копьём'],
      },
      {
        id: 'anubis-female',
        variant: 'Женская версия',
        title: 'Хемет-нечер Анпут',
        image: 'https://cdn.poehali.dev/projects/bfa830f0-f2cc-4b64-9f77-de1d82d4eb1b/bucket/14b4331f-cc50-42aa-a38a-dd8e10ceddaf.png',
        scene: 'https://cdn.poehali.dev/projects/bfa830f0-f2cc-4b64-9f77-de1d82d4eb1b/files/06e5eb7e-5cf6-410a-8c57-732f43282770.jpg',
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
    ],
  },
  {
    id: 'bast',
    name: 'Орден Баст',
    god: 'Баст',
    icon: 'Cat',
    role: 'Поддержка и большие кошки',
    eyebrow: 'Жрецы Баст',
    heading: 'Жрецы Баст — те, кто держит стол на ногах',
    intro:
      'Класс поддержки: лечат, снимают штрафы и прикрывают союзников. И единственные, кто выводит на поле больших кошек — львиц и пантер, ходящих отдельной фишкой.',
    priests: [
      {
        id: 'bast-male',
        variant: 'Мужская версия',
        title: 'Хем-нечер Баст',
        image: 'https://cdn.poehali.dev/projects/bfa830f0-f2cc-4b64-9f77-de1d82d4eb1b/files/1af4d840-b7de-43a2-b8dc-16b9aa288892.jpg',
        scene: 'https://cdn.poehali.dev/projects/bfa830f0-f2cc-4b64-9f77-de1d82d4eb1b/files/e59a875e-aefc-4d7e-8584-84c26bee5b63.jpg',
        quote: 'Бей сколько хочешь. Мои встают быстрее, чем твои падают.',
        description:
          'Смотритель зверинца и целитель. Пока другие спорят у весов, он держит союзников в живых и спускает львицу на того, кто подошёл слишком близко к его лагерю.',
        abilities: [
          { icon: 'HeartPulse', name: 'Тёплый очаг', text: 'В начале хода лечит одного Избранного в радиусе двух клеток, включая себя.' },
          { icon: 'Cat', name: 'Львица на поводке', text: 'Выводит на поле большую кошку — отдельную фишку, которая ходит за вами и бьёт первой.' },
          { icon: 'Music', name: 'Систр', text: 'Снимает один штраф бога с любого союзника до конца круга.' },
        ],
        gear: ['Маска кошки', 'Посох-систр', 'Ошейник львицы', 'Оплечье из малахита'],
      },
      {
        id: 'bast-female',
        variant: 'Женская версия',
        title: 'Хемет-нечер Бастет',
        image: 'https://cdn.poehali.dev/projects/bfa830f0-f2cc-4b64-9f77-de1d82d4eb1b/files/b14847bd-a064-4932-ba4e-abcc82ca84e8.jpg',
        scene: 'https://cdn.poehali.dev/projects/bfa830f0-f2cc-4b64-9f77-de1d82d4eb1b/files/98b634b1-a17d-496f-9a04-82d699861e63.jpg',
        quote: 'Кошки идут за той, кто их кормит. Люди — тоже.',
        description:
          'Танцовщица и укротительница. Её систр слышно через всё поле: там, где звучит ритм, союзники ходят дальше, а чужие кошки перестают слушаться хозяина.',
        abilities: [
          { icon: 'Sparkles', name: 'Танец радости', text: 'Все союзники в радиусе трёх клеток получают +1 к движению на круг.' },
          { icon: 'PawPrint', name: 'Зов прайда', text: 'Раз за партию переманивает чужую большую кошку на свою сторону до конца круга.' },
          { icon: 'ShieldPlus', name: 'Домашний порог', text: 'Пока стоит на клетке храма, союзники рядом не получают урона от драконов.' },
        ],
        gear: ['Маска кошки', 'Систр', 'Ожерелье усех', 'Браслеты танцовщицы'],
      },
    ],
  },
];

const PriestsSection = () => {
  const [orderId, setOrderId] = useState(orders[0].id);
  const order = orders.find((o) => o.id === orderId) ?? orders[0];
  const [variantIndex, setVariantIndex] = useState(0);
  const current = order.priests[variantIndex] ?? order.priests[0];

  return (
    <section id="priests" className="relative overflow-hidden border-t border-border bg-background py-24 md:py-32">
      <div
        className="pointer-events-none absolute -right-32 top-24 h-[520px] w-[520px] rounded-full"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, transparent 68%)' }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10 lg:px-16">
        <SectionHeading
          eyebrow={order.eyebrow}
          title={order.heading}
          description={order.intro}
        />

        <div className="mt-12 flex flex-wrap gap-3">
          {orders.map((o) => {
            const isActive = o.id === order.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  setOrderId(o.id);
                  setVariantIndex(0);
                }}
                aria-pressed={isActive}
                className={`flex items-center gap-3 rounded-sm border px-5 py-3.5 text-left transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-card-foreground hover:border-primary/60'
                }`}
              >
                <Icon name={o.icon} size={18} className={isActive ? '' : 'text-primary'} />
                <span>
                  <span className="block font-sans text-[0.95rem] font-semibold">{o.name}</span>
                  <span
                    className={`block text-[0.66rem] uppercase tracking-[0.16em] ${
                      isActive ? 'text-primary-foreground/75' : 'text-muted-foreground'
                    }`}
                  >
                    {o.role}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 inline-flex rounded-sm border border-border bg-card p-1">
          {order.priests.map((p, i) => {
            const isActive = i === variantIndex;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setVariantIndex(i)}
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

          <div className="flex flex-col justify-between overflow-hidden rounded-sm border border-border bg-card">
            <div className="relative h-56 w-full shrink-0 overflow-hidden md:h-64">
              <img
                src={current.scene}
                alt={`${current.title} — сцена ордена`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <span
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/25 to-transparent"
                aria-hidden="true"
              />
            </div>

            <div className="flex flex-1 flex-col justify-between p-8 pt-5 md:p-10 md:pt-6">
            <div>
              <div className="label-mono">
                {order.name} · {current.variant}
              </div>
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
      </div>
    </section>
  );
};

export default PriestsSection;