import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import SectionHeading from '@/components/SectionHeading';
import { useToast } from '@/hooks/use-toast';
import { classes, gods } from '@/data/maat';
import { gameApi, saveSession } from '@/lib/gameApi';

const LobbySection = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const [nickname, setNickname] = useState('');
  const [seats, setSeats] = useState(4);
  const [god, setGod] = useState(gods[0].id);
  const [cls, setCls] = useState(classes[0].id);
  const [code, setCode] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState('normal');
  const [mode, setMode] = useState<'solo' | 'friends'>('solo');

  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

  const nickError = useMemo(() => {
    if (!nickname) return '';
    if (nickname.trim().length < 2) return 'Слишком коротко — минимум 2 символа.';
    if (nickname.length > 16) return 'Максимум 16 символов.';
    if (!/^[\p{L}\p{N} _-]+$/u.test(nickname)) return 'Только буквы, цифры, пробел, дефис и подчёркивание.';
    return '';
  }, [nickname]);

  const inviteLink = code ? `${window.location.origin}/game?code=${code}` : '';

  const createTable = async () => {
    if (nickError || busy) return;
    setBusy(true);
    try {
      const res = await gameApi.create({
        nickname: nickname.trim() || 'Избранный',
        seats,
        godId: god,
        classId: cls,
      });
      setCode(res.code);
      saveSession({ code: res.code, token: res.token });
      toast({
        title: 'Стол собран',
        description: 'Отправьте код друзьям — и открывайте партию.',
      });
    } catch (e) {
      toast({ title: 'Не вышло собрать стол', description: e instanceof Error ? e.message : '' });
    } finally {
      setBusy(false);
    }
  };

  const openTable = () => {
    if (code) navigate(`/game?code=${code}`);
  };

  const startSolo = async () => {
    if (nickError || busy) return;
    setBusy(true);
    try {
      const res = await gameApi.createSolo({
        nickname: nickname.trim() || 'Избранный',
        bots: Math.max(1, seats - 1),
        godId: god,
        classId: cls,
        difficulty,
      });
      saveSession({ code: res.code, token: res.token });
      navigate(`/game?code=${res.code}`);
    } catch (e) {
      toast({ title: 'Не вышло начать партию', description: e instanceof Error ? e.message : '' });
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast({ title: 'Ссылка скопирована', description: 'Отправьте её друзьям любым удобным способом.' });
    } catch {
      toast({ title: 'Не вышло скопировать', description: 'Скопируйте код вручную — он в поле выше.' });
    }
  };

  const tryJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = joinCode.trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(value)) {
      setJoinError('Код стола — ровно 6 символов: буквы и цифры.');
      return;
    }
    setJoinError('');
    setBusy(true);
    try {
      const res = await gameApi.join({
        code: value,
        nickname: nickname.trim() || 'Избранный',
        godId: god,
        classId: cls,
      });
      saveSession({ code: value, token: res.token });
      navigate(`/game?code=${value}`);
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Стол не найден');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="lobby" className="relative overflow-hidden border-t border-border py-24 md:py-32">
      <div className="maat-grid-soft pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10 lg:px-16">
        <SectionHeading
          eyebrow="Лобби"
          title="Соберите стол за минуту"
          description="Без аккаунта, почты и пароля. Создайте стол и отправьте код друзьям — или начните партию прямо сейчас против соперников под управлением компьютера."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <div className="rounded-sm border border-border bg-card p-7 md:p-9">
            <div className="label-mono mb-4">С кем играем</div>

            <div className="mb-7 grid gap-3 sm:grid-cols-2">
              {[
                {
                  id: 'solo' as const,
                  name: 'С компьютером',
                  icon: 'Bot',
                  hint: 'Партия начнётся сразу — свободные места займут соперники-боты.',
                },
                {
                  id: 'friends' as const,
                  name: 'С друзьями по ссылке',
                  icon: 'Users',
                  hint: 'Получите код стола и отправьте его друзьям. Старт — когда все сядут.',
                },
              ].map((m) => {
                const isActive = mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    aria-pressed={isActive}
                    className={`rounded-sm border p-5 text-left transition-colors ${
                      isActive ? 'border-primary bg-primary/10' : 'border-border bg-background hover:border-primary/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon name={m.icon} size={17} className="text-primary" />
                      <span className="font-sans text-[0.95rem] font-semibold text-foreground">{m.name}</span>
                    </div>
                    <p className="mt-2 text-[0.75rem] leading-relaxed text-muted-foreground">{m.hint}</p>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label htmlFor="nick" className="label-mono mb-2 block">
                  Имя за столом · необязательно
                </label>
                <input
                  id="nick"
                  type="text"
                  value={nickname}
                  maxLength={24}
                  autoComplete="off"
                  placeholder="Избранный без имени"
                  onChange={(e) => setNickname(e.target.value)}
                  aria-invalid={!!nickError}
                  className="w-full rounded-sm border border-input bg-background px-4 py-3 text-[0.88rem] text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary"
                />
                {nickError ? (
                  <p className="mt-2 text-[0.75rem] text-destructive">{nickError}</p>
                ) : (
                  <p className="mt-2 text-[0.72rem] text-muted-foreground">
                    Видно только соседям по столу и только пока идёт партия.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="god" className="label-mono mb-2 block">
                  Ваш бог
                </label>
                <select
                  id="god"
                  value={god}
                  onChange={(e) => setGod(e.target.value)}
                  className="w-full rounded-sm border border-input bg-background px-4 py-3 text-[0.88rem] text-foreground outline-none transition-colors focus:border-primary"
                >
                  {gods.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} — {g.epithet}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="cls" className="label-mono mb-2 block">
                  Ваш класс
                </label>
                <select
                  id="cls"
                  value={cls}
                  onChange={(e) => setCls(e.target.value)}
                  className="w-full rounded-sm border border-input bg-background px-4 py-3 text-[0.88rem] text-foreground outline-none transition-colors focus:border-primary"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <div className="label-mono mb-3">
                  {mode === 'solo'
                    ? `Мест за столом: ${seats} · соперников ${Math.max(1, seats - 1)}`
                    : `Мест за столом: ${seats}`}
                </div>
                <div className="flex flex-wrap gap-2">
                  {[2, 3, 4, 5, 6, 7].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setSeats(n)}
                      aria-pressed={seats === n}
                      className={`h-11 w-11 rounded-sm border font-sans text-sm font-semibold transition-colors ${
                        seats === n
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background text-foreground hover:border-primary/60'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={mode === 'solo' ? startSolo : createTable}
                disabled={!!nickError || busy}
                className="inline-flex items-center gap-3 rounded-sm bg-primary px-7 py-4 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {mode === 'solo' ? 'Начать партию' : code ? 'Пересобрать стол' : 'Создать стол'}
                <Icon name={mode === 'solo' ? 'Play' : 'Dices'} size={16} />
              </button>

              {mode === 'friends' && (
                <span className="text-[0.75rem] text-muted-foreground">
                  После создания появится код — отправьте его друзьям.
                </span>
              )}
            </div>

            <div className={`mt-6 border-t border-border pt-6 ${mode === 'solo' ? '' : 'hidden'}`}>
              <div className="label-mono mb-3">Характер соперников</div>
              <div className="grid gap-2.5 sm:grid-cols-3">
                {[
                  {
                    id: 'cautious',
                    name: 'Осторожные',
                    icon: 'Shield',
                    hint: 'Почти не нападают, охотно идут в союз и редко предают.',
                  },
                  {
                    id: 'normal',
                    name: 'Обычные',
                    icon: 'Scale',
                    hint: 'Держат баланс: бьют по случаю, союзы разрывают редко.',
                  },
                  {
                    id: 'aggressive',
                    name: 'Агрессивные',
                    icon: 'Swords',
                    hint: 'Бьют лидера, дерутся с бонусом и предают почти каждый второй союз.',
                  },
                ].map((d) => {
                  const isActive = difficulty === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDifficulty(d.id)}
                      aria-pressed={isActive}
                      className={`rounded-sm border p-4 text-left transition-colors ${
                        isActive
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-background hover:border-primary/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon name={d.icon} size={15} className="text-primary" />
                        <span className="font-sans text-[0.86rem] font-semibold text-foreground">{d.name}</span>
                      </div>
                      <p className="mt-2 text-[0.72rem] leading-relaxed text-muted-foreground">{d.hint}</p>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-[0.75rem] leading-relaxed text-muted-foreground">
                Одиночная партия начнётся сразу: остальные {Math.max(1, seats - 1)} мест займут соперники под
                управлением компьютера.
              </p>
            </div>

            {code && mode === 'friends' && (
              <div className="mt-8 animate-fade-in rounded-sm border border-primary/50 bg-primary/10 p-6">
                <div className="label-mono">Код стола</div>
                <div className="mt-2 font-sans text-3xl font-extrabold tracking-[0.3em] text-foreground">{code}</div>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={openTable}
                    className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-[0.72rem] uppercase tracking-[0.14em] text-primary-foreground transition-transform hover:-translate-y-0.5"
                  >
                    <Icon name="Play" size={14} />
                    Открыть стол
                  </button>
                  <button
                    type="button"
                    onClick={copyLink}
                    className="inline-flex items-center gap-2 rounded-sm border border-border bg-background px-4 py-2.5 text-[0.72rem] uppercase tracking-[0.14em] text-foreground transition-colors hover:border-primary"
                  >
                    <Icon name="Link" size={14} />
                    Скопировать приглашение
                  </button>
                  <span className="text-[0.72rem] text-muted-foreground">
                    {gods.find((g) => g.id === god)?.name} · {classes.find((c) => c.id === cls)?.name} · {seats} мест
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <form onSubmit={tryJoin} className="rounded-sm border border-border bg-card p-7" noValidate>
              <div className="label-mono mb-4">Вход по коду</div>
              <label htmlFor="join" className="sr-only">
                Код стола
              </label>
              <input
                id="join"
                type="text"
                value={joinCode}
                maxLength={6}
                autoComplete="off"
                placeholder="XK4M9P"
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase());
                  if (joinError) setJoinError('');
                }}
                aria-invalid={!!joinError}
                className="w-full rounded-sm border border-input bg-background px-4 py-3 font-sans text-lg tracking-[0.35em] text-foreground outline-none transition-colors placeholder:tracking-[0.35em] placeholder:text-muted-foreground/60 focus:border-primary"
              />
              {joinError && <p className="mt-2 text-[0.75rem] text-destructive">{joinError}</p>}
              <button
                type="submit"
                disabled={busy}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-primary px-5 py-3 text-[0.72rem] uppercase tracking-[0.14em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
              >
                Сесть за стол
                <Icon name="ArrowRight" size={14} />
              </button>
            </form>

            <div className="rounded-sm border border-border bg-card p-7">
              <div className="label-mono mb-4 flex items-center gap-2">
                <Icon name="ShieldCheck" size={14} className="text-primary" />
                Приватность по умолчанию
              </div>
              <ul className="space-y-3">
                {[
                  'Ни регистрации, ни почты, ни пароля.',
                  'Персональные данные не собираются и не хранятся.',
                  'Код стола — шесть символов, ничего личного в нём нет.',
                  'Имя видно только соседям по столу и живёт до конца партии.',
                  'Никаких рекламных трекеров и профилирования.',
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-[0.82rem] leading-relaxed text-muted-foreground">
                    <Icon name="Check" size={14} className="mt-0.5 shrink-0 text-primary" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LobbySection;