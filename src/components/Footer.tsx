import Icon from '@/components/ui/icon';
import ThemeToggle from '@/components/ThemeToggle';

const Footer = () => (
  <footer className="relative border-t border-border py-16">
    <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-16">
      <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="font-sans text-[1.05rem] font-extrabold uppercase tracking-[0.34em] text-foreground">
            МА<span className="text-primary">А</span>Т
          </div>
          <p className="mt-5 max-w-sm text-[0.84rem] leading-relaxed text-muted-foreground">
            Тактическая онлайн-настолка про битву египетских пантеонов за космический закон. Игра для веселья, а не для
            слежки: без регистрации и без сбора персональных данных.
          </p>
          <div className="mt-6">
            <ThemeToggle />
          </div>
        </div>

        <nav className="flex flex-col gap-3">
          <div className="label-mono mb-1">Разделы</div>
          {[
            ['#board', 'Игровое поле'],
            ['#pantheon', 'Пантеон богов'],
            ['#classes', 'Классы'],
            ['#rules', 'Правила'],
            ['#dragons', 'Драконы-Сфинксы'],
            ['#lobby', 'Лобби'],
            ['#ranking', 'Рейтинг'],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="w-fit text-[0.82rem] text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-3">
          <div className="label-mono mb-1">Приватность</div>
          {[
            ['UserX', 'Аккаунты не нужны'],
            ['DatabaseZap', 'Данные не хранятся'],
            ['CookieIcon', 'Трекеров нет'],
            ['Lock', 'Код стола — локально'],
          ].map(([icon, label]) => (
            <span key={label} className="flex items-center gap-2.5 text-[0.82rem] text-muted-foreground">
              <Icon name={icon} fallback="Check" size={14} className="text-primary" />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-14 flex flex-col gap-3 border-t border-border pt-7 text-[0.66rem] uppercase tracking-[0.2em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center">
          <span className="mr-2.5 inline-block h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--glow))]" />
          Закрытый плейтест · {new Date().getFullYear()}
        </div>
        <div>Сфинксы: посланник · враг · трикстер · хранитель</div>
      </div>
    </div>
  </footer>
);

export default Footer;
