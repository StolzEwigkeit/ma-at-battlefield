import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import GameBoard from '@/components/game/GameBoard';
import PlayerList from '@/components/game/PlayerList';
import GameLog from '@/components/game/GameLog';
import ActionPanel from '@/components/game/ActionPanel';
import HandCards from '@/components/game/HandCards';
import GameOver from '@/components/game/GameOver';
import { useToast } from '@/hooks/use-toast';
import { clearSession, gameApi, loadSession, saveSession, type GameState } from '@/lib/gameApi';

const Game = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const urlCode = (params.get('code') || '').toUpperCase();
  const stored = loadSession();
  const [code] = useState(urlCode || stored?.code || '');
  const urlToken = params.get('token') || '';
  const [token, setToken] = useState(
    urlToken || (stored && stored.code === (urlCode || stored.code) ? stored.token : ''),
  );

  const [state, setState] = useState<GameState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [nickname, setNickname] = useState('');
  const [needJoin, setNeedJoin] = useState(false);

  const refresh = useCallback(async () => {
    if (!code) return;
    try {
      const next = await gameApi.state(code, token);
      setState(next);
      setNeedJoin(!next.me && next.table.status === 'lobby' && next.players.length < next.table.seats);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Стол не найден');
    }
  }, [code, token]);

  const finished = state?.table.status === 'finished';

  useEffect(() => {
    refresh();
    if (finished) return;
    const timer = setInterval(refresh, 3000);
    return () => clearInterval(timer);
  }, [refresh, finished]);

  const act = async (fn: () => Promise<GameState>) => {
    setBusy(true);
    try {
      setState(await fn());
    } catch (e) {
      toast({ title: 'Не вышло', description: e instanceof Error ? e.message : 'Попробуйте ещё раз' });
    } finally {
      setBusy(false);
    }
  };

  const join = async () => {
    setBusy(true);
    try {
      const res = await gameApi.join({
        code,
        nickname: nickname.trim() || 'Избранный',
        godId: 'ra',
        classId: 'vizier',
      });
      setToken(res.token);
      saveSession({ code, token: res.token });
      setState(res.state);
      setNeedJoin(false);
    } catch (e) {
      toast({ title: 'Не вышло сесть за стол', description: e instanceof Error ? e.message : '' });
    } finally {
      setBusy(false);
    }
  };

  const leave = () => {
    clearSession();
    navigate('/');
  };

  const restart = async () => {
    setBusy(true);
    try {
      const res = await gameApi.rematch(code, token);
      saveSession({ code: res.code, token: res.token });
      navigate(`/game?code=${res.code}&token=${res.token}`);
      window.location.reload();
    } catch (e) {
      toast({ title: 'Не вышло начать заново', description: e instanceof Error ? e.message : '' });
    } finally {
      setBusy(false);
    }
  };

  if (!code) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <div className="max-w-md text-center">
          <h1 className="font-sans text-2xl font-bold text-foreground">Код стола не указан</h1>
          <p className="mt-3 text-[0.88rem] text-muted-foreground">
            Вернитесь в лобби и создайте стол или войдите по коду.
          </p>
          <button
            type="button"
            onClick={() => navigate('/#lobby')}
            className="mt-6 rounded-sm bg-primary px-6 py-3 text-[0.76rem] uppercase tracking-[0.14em] text-primary-foreground"
          >
            В лобби
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <div className="max-w-md text-center">
          <h1 className="font-sans text-2xl font-bold text-foreground">{error}</h1>
          <button
            type="button"
            onClick={leave}
            className="mt-6 rounded-sm bg-primary px-6 py-3 text-[0.76rem] uppercase tracking-[0.14em] text-primary-foreground"
          >
            В лобби
          </button>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Icon name="Loader" size={26} className="animate-spin text-primary" />
      </div>
    );
  }

  const me = state.players.find((p) => p.id === state.me?.id) ?? null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4 md:px-10">
          <div className="flex items-center gap-5">
            <span className="font-sans text-[0.95rem] font-extrabold uppercase tracking-[0.3em] text-foreground">
              МА<span className="text-primary">А</span>Т
            </span>
            <span className="label-mono hidden sm:inline">
              Стол {state.table.code} · круг {state.table.round}
            </span>
            {state.table.hasBots && (
              <span className="label-mono hidden text-primary sm:inline">
                соперники: {state.table.difficultyName}
              </span>
            )}
            {!me && !needJoin && <span className="label-mono text-primary">режим наблюдателя</span>}
          </div>
          <button
            type="button"
            onClick={leave}
            className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            <Icon name="LogOut" size={13} />
            Выйти
          </button>
        </div>
      </header>

      {state.table.status === 'finished' ? (
        <GameOver state={state} me={me} busy={busy} onRestart={restart} onLeave={leave} />
      ) : needJoin ? (
        <div className="mx-auto max-w-md px-5 py-24">
          <div className="rounded-sm border border-border bg-card p-7">
            <div className="label-mono">Стол {state.table.code}</div>
            <h1 className="mt-2 font-sans text-2xl font-bold text-card-foreground">Сесть за стол</h1>
            <p className="mt-3 text-[0.84rem] leading-relaxed text-muted-foreground">
              За столом {state.players.length} из {state.table.seats}. Введите имя — бог и класс назначатся по
              умолчанию, сменить их можно в лобби.
            </p>
            <input
              type="text"
              value={nickname}
              maxLength={24}
              placeholder="Имя за столом"
              onChange={(e) => setNickname(e.target.value)}
              className="mt-5 w-full rounded-sm border border-input bg-background px-4 py-3 text-[0.88rem] text-foreground outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={join}
              disabled={busy}
              className="mt-4 w-full rounded-sm bg-primary px-6 py-3.5 text-[0.76rem] uppercase tracking-[0.14em] text-primary-foreground disabled:opacity-50"
            >
              Занять место
            </button>
          </div>
        </div>
      ) : (
        <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-10">
          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <GameBoard board={state.board} players={state.players} currentPlayerId={state.currentPlayerId} />
              <div className="rounded-sm border border-border bg-card p-6">
                <div className="label-mono mb-4">Хроника партии</div>
                <GameLog entries={state.log} />
              </div>
            </div>

            <div className="space-y-6">
              <ActionPanel
                state={state}
                me={me}
                busy={busy}
                onStart={() => act(() => gameApi.start(code, token))}
                onMove={() => act(() => gameApi.move(code, token))}
                onSkip={() => act(() => gameApi.skip(code, token))}
                onAbility={() => {
                  const target = state.players.find((p) => p.id !== me?.id && !p.isOut);
                  return act(() => gameApi.ability(code, token, target?.id));
                }}
                onAccept={(id) => act(() => gameApi.accept(code, token, id))}
                onBetray={(id) => act(() => gameApi.betray(code, token, id))}
              />

              <HandCards
                hand={state.hand ?? []}
                busy={busy}
                myTurn={state.table.status === 'playing' && !!me && state.currentPlayerId === me.id && !me.isOut}
                currentTileType={state.board.find((t) => t.id === me?.position)?.type ?? ''}
                hasAlliance={state.alliances.some(
                  (a) => a.status === 'active' && (a.from === me?.id || a.to === me?.id),
                )}
                onPlay={(card) => {
                  const target = state.players.find((p) => p.id !== me?.id && !p.isOut);
                  return act(() => gameApi.playCard(code, token, card.id, target?.id));
                }}
              />

              <div>
                <div className="label-mono mb-3">Избранные за столом</div>
                <PlayerList
                  players={state.players}
                  currentPlayerId={state.currentPlayerId}
                  meId={me?.id ?? null}
                  alliances={state.alliances}
                  busy={busy}
                  playing={state.table.status === 'playing'}
                  onAlly={(id) => act(() => gameApi.ally(code, token, id))}
                />
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default Game;