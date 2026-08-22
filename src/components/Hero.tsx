import Icon from '@/components/ui/icon';
import ScalesOfMaat from '@/components/ScalesOfMaat';

const Hero = () => {
  return (
    <section id="top" className="relative flex min-h-screen flex-col overflow-hidden px-5 pb-8 pt-[92px] md:px-10 lg:px-16">
      <div className="maat-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-[14%] right-[2%] h-[760px] w-[760px] rounded-full"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.16) 0%, transparent 62%)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-[1440px] flex-1 items-center gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
        <div>
          <div className="rise d2 eyebrow mb-6 flex items-center gap-3.5">
            <span className="h-px w-11 bg-primary" />
            Тактическая настолка · 2–7 игроков
          </div>

          <h1 className="rise d2 font-sans text-[clamp(2.6rem,7.4vw,4.75rem)] font-extrabold leading-[1.06] tracking-[-0.035em] text-foreground">
            Спор решают
            <br />
            <em className="not-italic text-primary">весы</em>, а не кубик
          </h1>

          <p className="rise d3 mt-6 max-w-[34em] text-[0.95rem] leading-relaxed text-muted-foreground">
            Вы ведёте Избранного и возвышаете своего бога: Ра, Сет, Исида, Анубис, Осирис или Тот.{' '}
            <b className="font-medium text-foreground">
              Союзы держатся ровно до того хода, когда становятся невыгодны.
            </b>
          </p>

          <div className="rise d4 mt-10 flex flex-wrap items-center gap-5">
            <a
              href="#lobby"
              className="inline-flex items-center gap-3 rounded-sm bg-primary px-7 py-4 text-[0.8rem] font-medium uppercase tracking-[0.14em] text-primary-foreground shadow-[0_18px_44px_-18px_hsl(var(--primary)/0.85)] transition-transform hover:-translate-y-0.5"
            >
              <span>Собрать партию</span>
              <Icon name="ArrowRight" size={16} className="shrink-0" />
            </a>
            <span className="label-mono">Вход по коду стола · без регистрации</span>
          </div>

          <div className="rise d5 mt-10 flex flex-wrap gap-x-8 gap-y-3">
            {[
              { icon: 'UserX', text: 'Без аккаунта' },
              { icon: 'DatabaseZap', text: 'Без сбора данных' },
              { icon: 'CookieIcon', text: 'Без трекеров' },
            ].map((b) => (
              <span key={b.text} className="label-mono flex items-center gap-2">
                <Icon name={b.icon} fallback="Check" size={13} className="text-primary" />
                {b.text}
              </span>
            ))}
          </div>
        </div>

        <div className="rise d3 relative flex items-center justify-center" aria-hidden="true">
          <ScalesOfMaat className="h-auto w-full max-w-[520px]" />
          <div className="absolute -left-1 top-[64%] hidden text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground sm:block">
            Чаша порядка
            <b className="block font-normal tracking-[0.14em] text-foreground">Перо истины</b>
          </div>
          <div className="absolute -right-1 top-[64%] hidden text-right text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground sm:block">
            Чаша хаоса
            <b className="block font-normal tracking-[0.14em] text-primary">Ставка игрока</b>
          </div>
        </div>
      </div>

      <div className="rise d4 relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-2 pt-6 text-[0.66rem] uppercase tracking-[0.2em] text-muted-foreground sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center">
          <span className="mr-2.5 inline-block h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--glow))]" />
          Закрытый плейтест · новые столы каждый вечер
        </div>
        <div>Сфинксы: посланник · враг · трикстер · хранитель</div>
      </div>
    </section>
  );
};

export default Hero;