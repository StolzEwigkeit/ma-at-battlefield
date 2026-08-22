import { useState } from 'react';
import Icon from '@/components/ui/icon';
import SectionHeading from '@/components/SectionHeading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const leaders = [
  { rank: 1, alias: 'Красный Писец', god: 'Сет', cls: 'Писец', weight: 1284, games: 61, betrayals: 19 },
  { rank: 2, alias: 'Тихий Визирь', god: 'Тот', cls: 'Визирь', weight: 1240, games: 54, betrayals: 4 },
  { rank: 3, alias: 'Ночная Чаша', god: 'Анубис', cls: 'Жрец', weight: 1197, games: 72, betrayals: 11 },
  { rank: 4, alias: 'Гость с Юга', god: 'Ра', cls: 'Воин', weight: 1163, games: 38, betrayals: 2 },
  { rank: 5, alias: 'Зелёный Прилив', god: 'Осирис', cls: 'Жрец', weight: 1140, games: 45, betrayals: 7 },
  { rank: 6, alias: 'Крылатая Тень', god: 'Исида', cls: 'Визирь', weight: 1118, games: 50, betrayals: 1 },
  { rank: 7, alias: 'Сухая Буря', god: 'Сет', cls: 'Воин', weight: 1094, games: 33, betrayals: 14 },
];

const history = [
  {
    id: 'MT-0412',
    date: '21 августа, вечер',
    seats: 6,
    turns: 41,
    winner: 'Тихий Визирь · Тот',
    twist: 'Альянс из трёх распался на предпоследнем ходу: весы засчитали разрыв как перевес хаоса.',
  },
  {
    id: 'MT-0411',
    date: '20 августа, ночь',
    seats: 4,
    turns: 27,
    winner: 'Ничья · равновесие',
    twist: 'Обе чаши сошлись в ноль. Маат довольна, стол — не очень.',
  },
  {
    id: 'MT-0409',
    date: '19 августа, вечер',
    seats: 7,
    turns: 58,
    winner: 'Красный Писец · Сет',
    twist: 'Сфинкс пришёл Трикстером и поменял местами двух лидеров прямо перед взвешиванием.',
  },
  {
    id: 'MT-0407',
    date: '18 августа, день',
    seats: 3,
    turns: 22,
    winner: 'Ночная Чаша · Анубис',
    twist: 'Четыре жетона головы подряд — самое быстрое взвешивание плейтеста.',
  },
];

const RankingSection = () => {
  const [expanded, setExpanded] = useState<string | null>(history[0].id);

  return (
    <section id="ranking" className="relative border-t border-border bg-secondary/40 py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-16">
        <SectionHeading
          eyebrow="Рейтинг и хроника"
          title="Кто перевесил чашу на этой неделе"
          description="Рейтинг ведётся по псевдонимам стола: ни имён, ни почт, ни привязки к устройству. Это летопись партий, а не досье на игроков."
        />

        <Tabs defaultValue="leaders" className="mt-12">
          <TabsList className="rounded-sm bg-card">
            <TabsTrigger value="leaders" className="rounded-sm text-[0.72rem] uppercase tracking-[0.14em]">
              Таблица веса
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-sm text-[0.72rem] uppercase tracking-[0.14em]">
              История партий
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaders" className="mt-7">
            <div className="overflow-x-auto rounded-sm border border-border bg-card">
              <table className="w-full min-w-[680px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border">
                    {['#', 'Псевдоним', 'Бог', 'Класс', 'Вес', 'Партий', 'Предательств'].map((h) => (
                      <th key={h} className="px-5 py-4 text-[0.66rem] uppercase tracking-[0.18em] text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leaders.map((l) => (
                    <tr key={l.rank} className="border-b border-border/60 transition-colors last:border-0 hover:bg-primary/5">
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-sm text-[0.72rem] font-semibold ${
                            l.rank <= 3 ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground'
                          }`}
                        >
                          {l.rank}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-sans text-[0.9rem] font-semibold text-card-foreground">{l.alias}</td>
                      <td className="px-5 py-4 text-[0.82rem] text-muted-foreground">{l.god}</td>
                      <td className="px-5 py-4 text-[0.82rem] text-muted-foreground">{l.cls}</td>
                      <td className="px-5 py-4 font-sans text-[0.9rem] font-bold text-primary">{l.weight}</td>
                      <td className="px-5 py-4 text-[0.82rem] text-muted-foreground">{l.games}</td>
                      <td className="px-5 py-4 text-[0.82rem] text-muted-foreground">{l.betrayals}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-7">
            <div className="space-y-3">
              {history.map((h) => {
                const open = expanded === h.id;
                return (
                  <div key={h.id} className="rounded-sm border border-border bg-card">
                    <button
                      type="button"
                      onClick={() => setExpanded(open ? null : h.id)}
                      aria-expanded={open}
                      className="flex w-full flex-wrap items-center justify-between gap-4 px-6 py-5 text-left"
                    >
                      <span className="flex items-center gap-4">
                        <span className="label-mono">{h.id}</span>
                        <span className="font-sans text-[0.95rem] font-semibold text-card-foreground">{h.winner}</span>
                      </span>
                      <span className="flex items-center gap-5">
                        <span className="label-mono hidden sm:inline">{h.date}</span>
                        <span className="label-mono">{h.seats} игроков</span>
                        <span className="label-mono">{h.turns} ходов</span>
                        <Icon
                          name="ChevronDown"
                          size={16}
                          className={`text-primary transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                        />
                      </span>
                    </button>
                    {open && (
                      <p className="animate-fade-in border-t border-border px-6 py-5 text-[0.85rem] leading-relaxed text-muted-foreground">
                        {h.twist}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        <p className="mt-8 flex items-start gap-3 text-[0.8rem] leading-relaxed text-muted-foreground">
          <Icon name="EyeOff" size={15} className="mt-0.5 shrink-0 text-primary" />
          Показаны результаты закрытого плейтеста. Псевдоним не связан ни с каким аккаунтом: удалить свою строку можно
          одним словом в чате стола.
        </p>
      </div>
    </section>
  );
};

export default RankingSection;
