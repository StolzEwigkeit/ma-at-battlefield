import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import ThemeToggle from '@/components/ThemeToggle';

const links = [
  { href: '#board', label: 'Поле' },
  { href: '#pantheon', label: 'Боги' },
  { href: '#classes', label: 'Классы' },
  { href: '#priests', label: 'Жрецы' },
  { href: '#rules', label: 'Правила' },
  { href: '#dragons', label: 'Драконы' },
  { href: '#lobby', label: 'Лобби' },
  { href: '#ranking', label: 'Рейтинг' },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? 'border-b border-border bg-background/85 backdrop-blur-md' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 md:px-10 lg:px-16">
        <a
          href="#top"
          className="font-sans text-[1.05rem] font-extrabold uppercase tracking-[0.34em] text-foreground"
        >
          МА<span className="text-primary">А</span>Т
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="border-b border-transparent pb-[3px] text-[0.72rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-primary/70 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href="#lobby"
            className="hidden items-center gap-3 rounded-sm bg-primary px-6 py-3 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-primary-foreground transition-transform hover:-translate-y-0.5 md:inline-flex"
          >
            Собрать партию
            <Icon name="ArrowRight" size={14} />
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={open}
            className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border text-foreground lg:hidden"
          >
            <Icon name={open ? 'X' : 'Menu'} size={18} />
          </button>
        </div>
      </div>

      {open && (
        <div className="animate-fade-in border-t border-border bg-background/98 backdrop-blur-md lg:hidden">
          <nav className="mx-auto flex max-w-[1440px] flex-col px-5 py-4 md:px-10">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-3 text-[0.8rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#lobby"
              onClick={() => setOpen(false)}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-5 py-3.5 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-primary-foreground"
            >
              Собрать партию
              <Icon name="ArrowRight" size={14} />
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;