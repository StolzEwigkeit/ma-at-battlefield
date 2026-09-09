import func2url from '../../backend/func2url.json';

const API = (func2url as Record<string, string>).game;

export type GamePlayer = {
  id: number;
  nickname: string;
  godId: string;
  godName: string;
  classId: string;
  className: string;
  seat: number;
  position: number;
  health: number;
  feathers: number;
  cards: number;
  isHost: boolean;
  isOut: boolean;
  abilityUsed: boolean;
  isBot: boolean;
};

export type GameAlliance = {
  id: number;
  from: number;
  to: number;
  fromName: string;
  toName: string;
  status: 'pending' | 'active' | 'broken';
};

export type GameLogEntry = { id: number; round: number; kind: string; text: string };

export type HandCard = {
  id: number;
  cardId: string;
  kind: 'quest' | 'gear' | 'intrigue';
  name: string;
  text: string;
  requirement: string;
  needsTarget: boolean;
};

export type GameState = {
  table: {
    code: string;
    seats: number;
    status: 'lobby' | 'playing' | 'finished';
    round: number;
    difficulty: string;
    difficultyName: string;
    hasBots: boolean;
  };
  board: { id: number; name: string; type: string }[];
  players: GamePlayer[];
  alliances: GameAlliance[];
  log: GameLogEntry[];
  currentPlayerId: number | null;
  me: { id: number; isHost: boolean } | null;
  hand: HandCard[];
  handLimit: number;
  victoryFeathers: number;
};

async function call<T>(payload: Record<string, unknown>, token?: string): Promise<T> {
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'X-Auth-Token': token } : {}),
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка сервера');
  return data as T;
}

export const gameApi = {
  create: (payload: { nickname: string; seats: number; godId: string; classId: string }) =>
    call<{ code: string; token: string }>({ action: 'create', ...payload }),

  createSolo: (payload: {
    nickname: string;
    bots: number;
    godId: string;
    classId: string;
    difficulty: string;
  }) =>
    call<{ code: string; token: string }>({ action: 'create_solo', ...payload }),

  join: (payload: { code: string; nickname: string; godId: string; classId: string }) =>
    call<{ code: string; token: string; state: GameState }>({ action: 'join', ...payload }),

  state: async (code: string, token: string): Promise<GameState> => {
    const res = await fetch(`${API}?action=state&code=${encodeURIComponent(code)}&token=${encodeURIComponent(token)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Стол не найден');
    return data as GameState;
  },

  start: (code: string, token: string) => call<GameState>({ action: 'start', code }, token),
  move: (code: string, token: string) => call<GameState>({ action: 'move', code }, token),
  skip: (code: string, token: string) => call<GameState>({ action: 'skip', code }, token),
  ability: (code: string, token: string, targetId?: number) =>
    call<GameState>({ action: 'ability', code, targetId }, token),
  ally: (code: string, token: string, targetId: number) =>
    call<GameState>({ action: 'ally', code, targetId }, token),
  accept: (code: string, token: string, allianceId: number) =>
    call<GameState>({ action: 'accept', code, allianceId }, token),
  betray: (code: string, token: string, allianceId: number) =>
    call<GameState>({ action: 'betray', code, allianceId }, token),
  rematch: (code: string, token: string) =>
    call<{ code: string; token: string }>({ action: 'rematch', code }, token),
  playCard: (code: string, token: string, handId: number, targetId?: number) =>
    call<GameState>({ action: 'play_card', code, handId, targetId }, token),
};

export const TABLE_STORAGE_KEY = 'maat-table';

export type StoredSession = { code: string; token: string };

export function saveSession(session: StoredSession) {
  sessionStorage.setItem(TABLE_STORAGE_KEY, JSON.stringify(session));
}

export function loadSession(): StoredSession | null {
  const raw = sessionStorage.getItem(TABLE_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function clearSession() {
  sessionStorage.removeItem(TABLE_STORAGE_KEY);
}