import Icon from '@/components/ui/icon';

const CallToActionSection = () => (
  <section id="join" className="relative overflow-hidden border-t border-border">
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <img
        src="https://cdn.poehali.dev/projects/bfa830f0-f2cc-4b64-9f77-de1d82d4eb1b/files/0db481f1-040f-4651-8b44-705435e3dda8.jpg"
        alt=""
        className="hero-bg h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-background/45 dark:bg-background/58" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/75 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>

    <div className="relative z-10 mx-auto max-w-[1440px] px-5 py-28 md:px-10 md:py-36 lg:px-16">
      <div className="max-w-2xl">
        <div className="eyebrow mb-6 flex items-center gap-3.5">
          <span className="h-px w-11 bg-primary" />
          Стол собирается сегодня
        </div>

        <h2 className="font-sans text-[clamp(2.1rem,5vw,3.4rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-foreground">
          Семь богов уже за столом.
          <br />
          <em className="not-italic text-primary">Свободно одно место</em>
        </h2>

        <p className="mt-6 max-w-[36em] text-[0.95rem] leading-relaxed text-muted-foreground">
          Выберите бога, класс и войдите по коду стола. Регистрация не нужна — партия начинается сразу, как соберётся
          второй игрок.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-5">
          <a
            href="#lobby"
            className="inline-flex items-center gap-3 rounded-sm bg-primary px-7 py-4 text-[0.8rem] font-medium uppercase tracking-[0.14em] text-primary-foreground shadow-[0_18px_44px_-18px_hsl(var(--primary)/0.85)] transition-transform hover:-translate-y-0.5"
          >
            <span>Собрать партию</span>
            <Icon name="ArrowRight" size={16} className="shrink-0" />
          </a>
          <a
            href="#rules"
            className="inline-flex items-center gap-2.5 rounded-sm border border-border bg-card/80 px-6 py-4 text-[0.8rem] font-medium uppercase tracking-[0.14em] text-card-foreground backdrop-blur transition-colors hover:border-primary/60"
          >
            <Icon name="BookOpen" size={15} className="shrink-0 text-primary" />
            Сначала правила
          </a>
        </div>

        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
          {[
            { icon: 'Users', text: '2–7 игроков' },
            { icon: 'Clock', text: 'Партия 40–70 минут' },
            { icon: 'UserX', text: 'Без регистрации' },
          ].map((b) => (
            <span key={b.text} className="label-mono flex items-center gap-2">
              <Icon name={b.icon} fallback="Check" size={13} className="text-primary" />
              {b.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default CallToActionSection;