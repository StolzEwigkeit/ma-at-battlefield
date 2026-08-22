import Icon from '@/components/ui/icon';
import useTheme from '@/hooks/use-theme';

const ThemeToggle = ({ className = '' }: { className?: string }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
      title={isDark ? 'Светлая тема' : 'Тёмная тема'}
      className={`group relative inline-flex h-9 w-[68px] items-center rounded-sm border border-border bg-secondary/60 px-1 transition-colors hover:border-primary/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${className}`}
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary text-primary-foreground shadow-sm transition-transform duration-300"
        style={{ transform: isDark ? 'translateX(32px)' : 'translateX(0)' }}
      >
        <Icon name={isDark ? 'Moon' : 'Sun'} size={15} />
      </span>
      <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-[10px] text-muted-foreground">
        <Icon name="Sun" size={13} className={isDark ? 'opacity-60' : 'opacity-0'} />
        <Icon name="Moon" size={13} className={isDark ? 'opacity-0' : 'opacity-60'} />
      </span>
    </button>
  );
};

export default ThemeToggle;
