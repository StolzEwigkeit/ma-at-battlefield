import json
import os
import random
import string

import psycopg2
import psycopg2.extras

from rules import (
    BOARD, BOARD_SIZE, CLASS_NAMES, DRAGON_NAMES, GOD_NAMES,
    advance, combat_power, move_steps, resolve_tile, tile, victory_check,
)
from cards import can_play, card_info, card_kind, draw_card

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Content-Type': 'application/json',
}

ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'


def esc(value) -> str:
    if value is None:
        return 'NULL'
    return "'" + str(value).replace("'", "''") + "'"


def conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def make_code() -> str:
    return ''.join(random.choice(ALPHABET) for _ in range(6))


def make_token() -> str:
    return ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(32))


def ok(data: dict, status: int = 200) -> dict:
    return {'statusCode': status, 'headers': CORS, 'body': json.dumps(data, ensure_ascii=False), 'isBase64Encoded': False}


def err(message: str, status: int = 400) -> dict:
    return ok({'error': message}, status)


def give_card(cur, table_id: int, player_id: int, round_num: int, kind: str = '') -> dict:
    card = draw_card(kind)
    cur.execute(
        f"INSERT INTO player_cards (table_id, player_id, card_id, kind, drawn_round) "
        f"VALUES ({table_id}, {player_id}, {esc(card['id'])}, {esc(card_kind(card['id']))}, {round_num})"
    )
    cur.execute(f"UPDATE players SET cards = cards + 1 WHERE id = {player_id}")
    return card


BOT_NAMES = [
    'Тень Писца', 'Хранитель Тьмы', 'Сухая Буря', 'Ночная Чаша',
    'Красный Пилигрим', 'Гость с Юга', 'Зелёный Прилив',
]

BOT_GODS = ['set', 'anubis', 'isis', 'osiris', 'bast', 'thoth', 'ra']
BOT_CLASSES = ['warrior', 'vizier', 'priest', 'scribe']

DIFFICULTY = {
    'cautious': {
        'name': 'осторожные',
        'attack_chance': 0.15,
        'betray_chance': 0.05,
        'ally_accept': 0.85,
        'ally_offer': 0.35,
        'heal_threshold': 8,
        'combat_bonus': 0,
        'god_pool': ['bast', 'isis', 'osiris', 'ra'],
        'class_pool': ['priest', 'vizier', 'scribe'],
    },
    'normal': {
        'name': 'обычные',
        'attack_chance': 0.35,
        'betray_chance': 0.2,
        'ally_accept': 0.6,
        'ally_offer': 0.25,
        'heal_threshold': 6,
        'combat_bonus': 0,
        'god_pool': BOT_GODS,
        'class_pool': BOT_CLASSES,
    },
    'aggressive': {
        'name': 'агрессивные',
        'attack_chance': 0.7,
        'betray_chance': 0.45,
        'ally_accept': 0.35,
        'ally_offer': 0.15,
        'heal_threshold': 4,
        'combat_bonus': 2,
        'god_pool': ['set', 'anubis', 'thoth', 'ra'],
        'class_pool': ['warrior', 'warrior', 'vizier', 'scribe'],
    },
}


def profile(name: str) -> dict:
    return DIFFICULTY.get(name, DIFFICULTY['normal'])


def perform_move(cur, table_id: int, round_num: int, player: dict) -> bool:
    """Проводит один ход Избранного: бросок, эффект клетки, добор карт. Возвращает True, если игрок выбыл."""
    cur.execute(
        f"SELECT COUNT(*) AS n FROM alliances WHERE table_id = {table_id} AND status = 'active' "
        f"AND (from_player_id = {player['id']} OR to_player_id = {player['id']})"
    )
    alliance_count = cur.fetchone()['n']

    steps = move_steps(player['god_id'], player['class_id'])
    moving = dict(player)
    moving['position'] = advance(moving['position'], steps)
    log(cur, table_id, round_num, 'move',
        f"{player['nickname']} бросает кости: {steps}. Фишка идёт на «{tile(moving['position'])['name']}».")

    effect = resolve_tile(moving, alliance_count)
    if effect['extra_move']:
        moving['position'] = advance(moving['position'], effect['extra_move'])

    health = max(0, min(12, moving['health'] + effect['health_delta']))
    feathers = max(0, moving['feathers'] + effect['feathers_delta'])
    is_out = health <= 0

    cur.execute(
        f"UPDATE players SET position = {moving['position']}, health = {health}, "
        f"feathers = {feathers}, is_out = {'TRUE' if is_out else 'FALSE'} WHERE id = {player['id']}"
    )
    log(cur, table_id, round_num, effect['kind'], effect['text'])

    if effect['cards_delta'] > 0 and not is_out:
        for _ in range(effect['cards_delta']):
            drawn = give_card(cur, table_id, player['id'], round_num)
            log(cur, table_id, round_num, 'card', f"{player['nickname']} тянет карту: «{drawn['name']}».")
    if effect['dragon']:
        log(cur, table_id, round_num, 'dragon',
            f"Роль дракона по отношениям с богом {GOD_NAMES.get(player['god_id'], '')}: {DRAGON_NAMES[effect['dragon']]}.")
    if is_out:
        log(cur, table_id, round_num, 'system', f"{player['nickname']} выбывает из партии.")
    return is_out


def pick_target(cur, table_id: int, bot: dict, mood: dict):
    """Выбирает жертву: агрессивные бьют лидера, осторожные — самого слабого."""
    cur.execute(
        f"SELECT * FROM players WHERE table_id = {table_id} AND is_out = FALSE AND id <> {bot['id']}"
    )
    others = [dict(p) for p in cur.fetchall()]
    if not others:
        return None
    if mood['attack_chance'] >= 0.6:
        return max(others, key=lambda p: p['feathers'])
    return min(others, key=lambda p: p['health'])


def bot_play_card(cur, table_id: int, round_num: int, bot: dict, mood: dict):
    """Бот разыгрывает карту с учётом характера: лечится, бьёт или копит перья."""
    cur.execute(f"SELECT * FROM player_cards WHERE player_id = {bot['id']} AND status = 'hand' ORDER BY id")
    hand = cur.fetchall()
    if not hand:
        return
    cur.execute(
        f"SELECT COUNT(*) AS n FROM alliances WHERE table_id = {table_id} AND status = 'active' "
        f"AND (from_player_id = {bot['id']} OR to_player_id = {bot['id']})"
    )
    alliance_count = cur.fetchone()['n']
    tile_type = tile(bot['position'])['type']

    playable = []
    for row in hand:
        card = card_info(row['card_id'])
        allowed, _ = can_play(card, tile_type, alliance_count)
        if allowed:
            playable.append((row, card))
    if not playable:
        return

    def score(item):
        _, card = item
        value = card.get('reward_feathers', 0) * 2 + card.get('draw', 0)
        if card.get('attack_bonus'):
            value += 6 if random.random() < mood['attack_chance'] else -6
        if card.get('reward_health', 0) > 0:
            value += 5 if bot['health'] <= mood['heal_threshold'] else 1
        if card.get('reward_health', 0) < 0:
            value -= 4 if bot['health'] <= mood['heal_threshold'] else 0
        return value

    row, card = max(playable, key=score)

    if card.get('attack_bonus'):
        if random.random() > mood['attack_chance']:
            return
        target = pick_target(cur, table_id, bot, mood)
        if not target:
            return
        mine = combat_power(bot) + card['attack_bonus'] + mood['combat_bonus']
        theirs = combat_power(target)
        cur.execute(f"UPDATE player_cards SET status = 'played' WHERE id = {row['id']}")
        cur.execute(f"UPDATE players SET cards = GREATEST(0, cards - 1) WHERE id = {bot['id']}")
        if mine >= theirs:
            target_health = max(0, target['health'] - 4)
            cur.execute(
                f"UPDATE players SET health = {target_health}, "
                f"is_out = {'TRUE' if target_health <= 0 else 'FALSE'} WHERE id = {target['id']}"
            )
            cur.execute(f"UPDATE players SET feathers = feathers + 2 WHERE id = {bot['id']}")
            log(cur, table_id, round_num, 'card',
                f"{bot['nickname']} бьёт «{card['name']}» ({mine} против {theirs}): {target['nickname']} теряет 4 здоровья.")
            if target_health <= 0:
                log(cur, table_id, round_num, 'system', f"{target['nickname']} выбывает из партии.")
        else:
            cur.execute(f"UPDATE players SET health = GREATEST(0, health - 2) WHERE id = {bot['id']}")
            log(cur, table_id, round_num, 'card',
                f"{bot['nickname']} бьёт «{card['name']}» ({mine} против {theirs}) и получает отпор: −2 здоровья.")
        return

    position = advance(bot['position'], card['move']) if card.get('move') else bot['position']
    health = max(0, min(12, bot['health'] + card.get('reward_health', 0)))
    feathers = max(0, bot['feathers'] + card.get('reward_feathers', 0))
    cur.execute(f"UPDATE player_cards SET status = 'played' WHERE id = {row['id']}")
    cur.execute(
        f"UPDATE players SET position = {position}, health = {health}, feathers = {feathers}, "
        f"cards = GREATEST(0, cards - 1), is_out = {'TRUE' if health <= 0 else 'FALSE'} WHERE id = {bot['id']}"
    )
    log(cur, table_id, round_num, 'card', f"{bot['nickname']} разыгрывает «{card['name']}».")
    for _ in range(card.get('draw', 0) + (1 if card.get('reward_card') else 0)):
        give_card(cur, table_id, bot['id'], round_num)


def bot_social(cur, table_id: int, round_num: int, bot: dict, mood: dict):
    """Бот решает, предать союзника или предложить новый союз."""
    cur.execute(
        f"SELECT a.*, pf.nickname AS from_name, pt.nickname AS to_name FROM alliances a "
        f"JOIN players pf ON pf.id = a.from_player_id JOIN players pt ON pt.id = a.to_player_id "
        f"WHERE a.table_id = {table_id} AND a.status = 'active' "
        f"AND (a.from_player_id = {bot['id']} OR a.to_player_id = {bot['id']})"
    )
    active = [dict(a) for a in cur.fetchall()]

    if active and random.random() < mood['betray_chance']:
        a = random.choice(active)
        other_id = a['to_player_id'] if a['from_player_id'] == bot['id'] else a['from_player_id']
        other_name = a['to_name'] if a['from_player_id'] == bot['id'] else a['from_name']
        cur.execute(f"UPDATE alliances SET status = 'broken' WHERE id = {a['id']}")
        cur.execute(f"UPDATE players SET feathers = feathers + 2 WHERE id = {bot['id']}")
        cur.execute(f"UPDATE players SET health = GREATEST(0, health - 2) WHERE id = {other_id}")
        cur.execute(f"UPDATE players SET is_out = TRUE WHERE id = {other_id} AND health <= 0")
        log(cur, table_id, round_num, 'betrayal',
            f"{bot['nickname']} разрывает союз с {other_name}: +2 пера себе, −2 здоровья бывшему союзнику.")
        return

    if not active and random.random() < mood['ally_offer']:
        cur.execute(
            f"SELECT * FROM players WHERE table_id = {table_id} AND is_out = FALSE AND id <> {bot['id']}"
        )
        others = [dict(p) for p in cur.fetchall()]
        candidates = []
        for p in others:
            cur.execute(
                f"SELECT id FROM alliances WHERE table_id = {table_id} AND status <> 'broken' "
                f"AND ((from_player_id = {bot['id']} AND to_player_id = {p['id']}) "
                f"OR (from_player_id = {p['id']} AND to_player_id = {bot['id']}))"
            )
            if not cur.fetchone():
                candidates.append(p)
        if not candidates:
            return
        target = random.choice(candidates)
        status = 'active' if target['is_bot'] else 'pending'
        cur.execute(
            f"INSERT INTO alliances (table_id, from_player_id, to_player_id, status, created_round) "
            f"VALUES ({table_id}, {bot['id']}, {target['id']}, {esc(status)}, {round_num})"
        )
        log(cur, table_id, round_num, 'alliance',
            f"{bot['nickname']} предлагает союз игроку {target['nickname']}.")


def run_bots(cur, table_id: int):
    """Проигрывает ходы ботов, пока очередь не дойдёт до живого игрока."""
    for _ in range(24):
        cur.execute(f"SELECT * FROM tables WHERE id = {table_id}")
        t = cur.fetchone()
        if not t or t['status'] != 'playing':
            return
        cur.execute(f"SELECT * FROM players WHERE table_id = {table_id} AND is_out = FALSE ORDER BY seat_index")
        alive = [dict(p) for p in cur.fetchall()]
        if not alive:
            return
        current = alive[t['turn_index'] % len(alive)]
        if not current['is_bot']:
            return

        mood = profile(t.get('difficulty', 'normal'))
        perform_move(cur, table_id, t['round_num'], current)
        cur.execute(f"SELECT * FROM players WHERE id = {current['id']}")
        refreshed = dict(cur.fetchone())
        if not refreshed['is_out']:
            bot_play_card(cur, table_id, t['round_num'], refreshed, mood)
            cur.execute(f"SELECT * FROM players WHERE id = {current['id']}")
            refreshed = dict(cur.fetchone())
            if not refreshed['is_out']:
                bot_social(cur, table_id, t['round_num'], refreshed, mood)

        cur.execute(f"SELECT * FROM players WHERE table_id = {table_id} ORDER BY seat_index")
        players_after = [dict(p) for p in cur.fetchall()]
        win = victory_check(players_after)
        if win:
            winner = next(p for p in players_after if p['id'] == win['winner_id'])
            cur.execute(f"UPDATE tables SET status = 'finished', updated_at = NOW() WHERE id = {table_id}")
            log(cur, table_id, t['round_num'], 'victory', f"Победа: {winner['nickname']}. {win['reason']}.")
            return
        alive_after = [p for p in players_after if not p['is_out']]
        next_turn(cur, table_id, t['turn_index'], t['round_num'], len(alive_after))


def log(cur, table_id: int, round_num: int, kind: str, text: str):
    cur.execute(
        f"INSERT INTO game_log (table_id, round_num, kind, text) "
        f"VALUES ({table_id}, {round_num}, {esc(kind)}, {esc(text)})"
    )


def fetch_state(cur, code: str, token: str = '') -> dict:
    cur.execute(f"SELECT * FROM tables WHERE code = {esc(code)}")
    t = cur.fetchone()
    if not t:
        return {}
    cur.execute(f"SELECT * FROM players WHERE table_id = {t['id']} ORDER BY seat_index")
    players = [dict(p) for p in cur.fetchall()]
    cur.execute(
        f"SELECT a.*, pf.nickname AS from_name, pt.nickname AS to_name "
        f"FROM alliances a "
        f"JOIN players pf ON pf.id = a.from_player_id "
        f"JOIN players pt ON pt.id = a.to_player_id "
        f"WHERE a.table_id = {t['id']} AND a.status <> 'broken' ORDER BY a.id"
    )
    alliances = [dict(a) for a in cur.fetchall()]
    cur.execute(f"SELECT * FROM game_log WHERE table_id = {t['id']} ORDER BY id DESC LIMIT 25")
    logs = [dict(row) for row in cur.fetchall()]

    alive = [p for p in players if not p['is_out']]
    current = None
    if alive and t['status'] == 'playing':
        current = alive[t['turn_index'] % len(alive)]

    me = next((p for p in players if p['token'] == token), None)

    hand = []
    if me:
        cur.execute(
            f"SELECT * FROM player_cards WHERE player_id = {me['id']} AND status = 'hand' ORDER BY id"
        )
        for row in cur.fetchall():
            info = card_info(row['card_id'])
            hand.append({
                'id': row['id'],
                'cardId': row['card_id'],
                'kind': row['kind'],
                'name': info.get('name', ''),
                'text': info.get('text', ''),
                'requirement': info.get('requirement', 'any'),
            })

    return {
        'table': {
            'code': t['code'], 'seats': t['seats'], 'status': t['status'],
            'round': t['round_num'],
            'difficulty': t.get('difficulty', 'normal'),
            'difficultyName': profile(t.get('difficulty', 'normal'))['name'],
            'hasBots': any(p.get('is_bot') for p in players),
        },
        'board': BOARD,
        'players': [
            {
                'id': p['id'], 'nickname': p['nickname'], 'godId': p['god_id'], 'godName': GOD_NAMES.get(p['god_id'], p['god_id']),
                'classId': p['class_id'], 'className': CLASS_NAMES.get(p['class_id'], p['class_id']),
                'seat': p['seat_index'], 'position': p['position'], 'health': p['health'],
                'feathers': p['feathers'], 'cards': p['cards'], 'isHost': p['is_host'],
                'isOut': p['is_out'], 'abilityUsed': p['ability_used'], 'isBot': p.get('is_bot', False),
            }
            for p in players
        ],
        'alliances': [
            {'id': a['id'], 'from': a['from_player_id'], 'to': a['to_player_id'],
             'fromName': a['from_name'], 'toName': a['to_name'], 'status': a['status']}
            for a in alliances
        ],
        'log': [{'id': r['id'], 'round': r['round_num'], 'kind': r['kind'], 'text': r['text']} for r in reversed(logs)],
        'currentPlayerId': current['id'] if current else None,
        'me': {'id': me['id'], 'isHost': me['is_host']} if me else None,
        'hand': hand,
    }


def next_turn(cur, table_id: int, turn_index: int, round_num: int, alive_count: int):
    new_index = turn_index + 1
    new_round = round_num
    if alive_count and new_index >= alive_count:
        new_index = 0
        new_round = round_num + 1
    cur.execute(
        f"UPDATE tables SET turn_index = {new_index}, round_num = {new_round}, updated_at = NOW() "
        f"WHERE id = {table_id}"
    )
    return new_index, new_round


def handler(event: dict, context) -> dict:
    """Онлайн-партия МААТ: создание стола, вход по коду, ходы, весы, драконы и союзы."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**CORS, 'Access-Control-Max-Age': '86400'}, 'body': ''}

    params = event.get('queryStringParameters') or {}
    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token') or params.get('token', '')

    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    action = params.get('action') or body.get('action') or 'state'
    code = (params.get('code') or body.get('code') or '').strip().upper()

    connection = conn()
    connection.autocommit = True
    cur = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        if action == 'state':
            if not code:
                return err('Не указан код стола')
            state = fetch_state(cur, code, token)
            if not state:
                return err('Стол не найден', 404)
            return ok(state)

        if action == 'create':
            nickname = (body.get('nickname') or 'Избранный').strip()[:24] or 'Избранный'
            seats = int(body.get('seats') or 4)
            seats = max(2, min(7, seats))
            god_id = body.get('godId') or 'ra'
            class_id = body.get('classId') or 'vizier'
            new_code = make_code()
            new_token = make_token()

            cur.execute(
                f"INSERT INTO tables (code, seats) VALUES ({esc(new_code)}, {seats}) RETURNING id"
            )
            table_id = cur.fetchone()['id']
            cur.execute(
                f"INSERT INTO players (table_id, token, nickname, god_id, class_id, seat_index, is_host) "
                f"VALUES ({table_id}, {esc(new_token)}, {esc(nickname)}, {esc(god_id)}, {esc(class_id)}, 0, TRUE)"
            )
            log(cur, table_id, 1, 'system', f'{nickname} собрал стол. Ждём игроков.')
            return ok({'code': new_code, 'token': new_token})

        if action == 'create_solo':
            nickname = (body.get('nickname') or 'Избранный').strip()[:24] or 'Избранный'
            bots = int(body.get('bots') or 2)
            bots = max(1, min(6, bots))
            god_id = body.get('godId') or 'ra'
            class_id = body.get('classId') or 'vizier'
            difficulty = body.get('difficulty') or 'normal'
            if difficulty not in DIFFICULTY:
                difficulty = 'normal'
            mood = profile(difficulty)
            new_code = make_code()
            new_token = make_token()

            cur.execute(
                f"INSERT INTO tables (code, seats, status, difficulty) "
                f"VALUES ({esc(new_code)}, {bots + 1}, 'playing', {esc(difficulty)}) RETURNING id"
            )
            table_id = cur.fetchone()['id']
            cur.execute(
                f"INSERT INTO players (table_id, token, nickname, god_id, class_id, seat_index, is_host, cards) "
                f"VALUES ({table_id}, {esc(new_token)}, {esc(nickname)}, {esc(god_id)}, {esc(class_id)}, 0, TRUE, 0) "
                f"RETURNING id"
            )
            human_id = cur.fetchone()['id']

            names = random.sample(BOT_NAMES, bots)
            bot_gods = [g for g in mood['god_pool'] if g != god_id] or BOT_GODS
            random.shuffle(bot_gods)
            for i in range(bots):
                bot_god = bot_gods[i % len(bot_gods)]
                bot_class = random.choice(mood['class_pool'])
                cur.execute(
                    f"INSERT INTO players (table_id, token, nickname, god_id, class_id, seat_index, is_bot, cards) "
                    f"VALUES ({table_id}, {esc(make_token())}, {esc(names[i])}, {esc(bot_god)}, "
                    f"{esc(bot_class)}, {i + 1}, TRUE, 0) RETURNING id"
                )
                bot_id = cur.fetchone()['id']
                for _ in range(3):
                    give_card(cur, table_id, bot_id, 1)

            hand_size = 2 if class_id == 'scribe' else 3
            for _ in range(hand_size):
                give_card(cur, table_id, human_id, 1)

            log(cur, table_id, 1, 'system',
                f"{nickname} садится играть один против {bots} соперников ({mood['name']}). Круг первый.")
            return ok({'code': new_code, 'token': new_token})

        if not code:
            return err('Не указан код стола')

        cur.execute(f"SELECT * FROM tables WHERE code = {esc(code)}")
        table = cur.fetchone()
        if not table:
            return err('Стол не найден', 404)
        table_id = table['id']

        if action == 'join':
            nickname = (body.get('nickname') or 'Избранный').strip()[:24] or 'Избранный'
            god_id = body.get('godId') or 'ra'
            class_id = body.get('classId') or 'vizier'

            cur.execute(f"SELECT COUNT(*) AS n FROM players WHERE table_id = {table_id}")
            count = cur.fetchone()['n']
            if table['status'] != 'lobby':
                return err('Партия уже началась')
            if count >= table['seats']:
                return err('За столом нет свободных мест')

            new_token = make_token()
            cur.execute(
                f"INSERT INTO players (table_id, token, nickname, god_id, class_id, seat_index) "
                f"VALUES ({table_id}, {esc(new_token)}, {esc(nickname)}, {esc(god_id)}, {esc(class_id)}, {count})"
            )
            log(cur, table_id, table['round_num'], 'system', f'{nickname} сел за стол.')
            return ok({'code': code, 'token': new_token, 'state': fetch_state(cur, code, new_token)})

        cur.execute(f"SELECT * FROM players WHERE table_id = {table_id} AND token = {esc(token)}")
        me = cur.fetchone()
        if not me:
            return err('Вы не за этим столом', 403)

        if action == 'start':
            if not me['is_host']:
                return err('Начать партию может только создатель стола', 403)
            cur.execute(f"SELECT COUNT(*) AS n FROM players WHERE table_id = {table_id}")
            if cur.fetchone()['n'] < 2:
                return err('Нужно минимум два игрока')
            cur.execute(
                f"UPDATE tables SET status = 'playing', turn_index = 0, round_num = 1, updated_at = NOW() "
                f"WHERE id = {table_id}"
            )
            cur.execute(f"SELECT id, class_id FROM players WHERE table_id = {table_id} ORDER BY seat_index")
            for row in cur.fetchall():
                cur.execute(f"UPDATE players SET cards = 0 WHERE id = {row['id']}")
                hand_size = 2 if row['class_id'] == 'scribe' else 3
                for _ in range(hand_size):
                    give_card(cur, table_id, row['id'], 1)
            log(cur, table_id, 1, 'system', 'Партия началась. Круг первый. Каждый получил стартовую руку.')
            return ok(fetch_state(cur, code, token))

        if table['status'] != 'playing':
            return err('Партия ещё не началась')

        cur.execute(f"SELECT * FROM players WHERE table_id = {table_id} AND is_out = FALSE ORDER BY seat_index")
        alive = [dict(p) for p in cur.fetchall()]
        current = alive[table['turn_index'] % len(alive)] if alive else None

        if action == 'move':
            if not current or current['id'] != me['id']:
                return err('Сейчас не ваш ход')

            perform_move(cur, table_id, table['round_num'], dict(me))

            cur.execute(f"SELECT * FROM players WHERE table_id = {table_id} ORDER BY seat_index")
            players_after = [dict(p) for p in cur.fetchall()]
            win = victory_check(players_after)
            if win:
                winner = next(p for p in players_after if p['id'] == win['winner_id'])
                cur.execute(f"UPDATE tables SET status = 'finished', updated_at = NOW() WHERE id = {table_id}")
                log(cur, table_id, table['round_num'], 'victory',
                    f"Победа: {winner['nickname']}. {win['reason']}.")
            else:
                alive_after = [p for p in players_after if not p['is_out']]
                next_turn(cur, table_id, table['turn_index'], table['round_num'], len(alive_after))
                run_bots(cur, table_id)

            return ok(fetch_state(cur, code, token))

        if action == 'skip':
            if not current or current['id'] != me['id']:
                return err('Сейчас не ваш ход')
            cur.execute(f"UPDATE players SET health = LEAST(12, health + 1) WHERE id = {me['id']}")
            log(cur, table_id, table['round_num'], 'system',
                f"{me['nickname']} пропускает ход и переводит дух. +1 здоровья.")
            next_turn(cur, table_id, table['turn_index'], table['round_num'], len(alive))
            run_bots(cur, table_id)
            return ok(fetch_state(cur, code, token))

        if action == 'ability':
            if not current or current['id'] != me['id']:
                return err('Сейчас не ваш ход')
            if me['ability_used']:
                return err('Способность уже использована в этой партии')
            text = ''
            if me['class_id'] == 'warrior':
                target_id = int(body.get('targetId') or 0)
                cur.execute(f"SELECT * FROM players WHERE id = {target_id} AND table_id = {table_id}")
                target = cur.fetchone()
                if not target or target['id'] == me['id'] or target['is_out']:
                    return err('Нужна цель для атаки')
                mine = combat_power(dict(me))
                theirs = combat_power(dict(target))
                if mine >= theirs:
                    new_health = max(0, target['health'] - 3)
                    cur.execute(
                        f"UPDATE players SET health = {new_health}, is_out = {'TRUE' if new_health <= 0 else 'FALSE'} "
                        f"WHERE id = {target['id']}"
                    )
                    cur.execute(f"UPDATE players SET feathers = feathers + 1 WHERE id = {me['id']}")
                    text = f"{me['nickname']} атакует ({mine} против {theirs}) и наносит {target['nickname']} 3 урона. +1 перо."
                else:
                    cur.execute(f"UPDATE players SET health = GREATEST(0, health - 1) WHERE id = {me['id']}")
                    text = f"{me['nickname']} атакует ({mine} против {theirs}) и получает отпор: −1 здоровья."
            elif me['class_id'] == 'priest':
                cur.execute(f"UPDATE players SET health = LEAST(12, health + 3) WHERE id = {me['id']}")
                text = f"{me['nickname']} усиливает бонус бога: +3 здоровья."
            elif me['class_id'] == 'scribe':
                names = []
                for _ in range(2):
                    names.append(give_card(cur, table_id, me['id'], table['round_num'])['name'])
                cur.execute(f"UPDATE players SET feathers = feathers + 1 WHERE id = {me['id']}")
                text = f"{me['nickname']} правит протокол: берёт «{names[0]}» и «{names[1]}», +1 перо."
            else:
                target_id = int(body.get('targetId') or 0)
                cur.execute(f"SELECT * FROM players WHERE id = {target_id} AND table_id = {table_id}")
                target = cur.fetchone()
                if not target or target['id'] == me['id']:
                    return err('Нужна цель для союза')
                cur.execute(
                    f"INSERT INTO alliances (table_id, from_player_id, to_player_id, status, created_round) "
                    f"VALUES ({table_id}, {me['id']}, {target['id']}, 'active', {table['round_num']})"
                )
                text = f"{me['nickname']} заключает союз с {target['nickname']} без согласия второй стороны."

            cur.execute(f"UPDATE players SET ability_used = TRUE WHERE id = {me['id']}")
            log(cur, table_id, table['round_num'], 'ability', text)
            return ok(fetch_state(cur, code, token))

        if action == 'play_card':
            if not current or current['id'] != me['id']:
                return err('Карту можно разыграть только в свой ход')
            hand_id = int(body.get('handId') or 0)
            cur.execute(
                f"SELECT * FROM player_cards WHERE id = {hand_id} AND player_id = {me['id']} AND status = 'hand'"
            )
            row = cur.fetchone()
            if not row:
                return err('Карты нет на руке')

            card = card_info(row['card_id'])
            cur.execute(
                f"SELECT COUNT(*) AS n FROM alliances WHERE table_id = {table_id} AND status = 'active' "
                f"AND (from_player_id = {me['id']} OR to_player_id = {me['id']})"
            )
            alliance_count = cur.fetchone()['n']
            tile_type = tile(me['position'])['type']

            allowed, reason = can_play(card, tile_type, alliance_count)
            if not allowed:
                return err(reason)

            position = me['position']
            if card.get('move'):
                position = advance(position, card['move'])

            health = max(0, min(12, me['health'] + card.get('reward_health', 0)))
            feathers = max(0, me['feathers'] + card.get('reward_feathers', 0))
            is_out = health <= 0

            if card.get('attack_bonus'):
                target_id = int(body.get('targetId') or 0)
                cur.execute(f"SELECT * FROM players WHERE id = {target_id} AND table_id = {table_id} AND is_out = FALSE")
                target = cur.fetchone()
                if not target or target['id'] == me['id']:
                    return err('Для этой карты нужна цель атаки')
                mine = combat_power(dict(me)) + card['attack_bonus']
                theirs = combat_power(dict(target))
                if mine >= theirs:
                    target_health = max(0, target['health'] - 4)
                    cur.execute(
                        f"UPDATE players SET health = {target_health}, "
                        f"is_out = {'TRUE' if target_health <= 0 else 'FALSE'} WHERE id = {target['id']}"
                    )
                    feathers += 2
                    log(cur, table_id, table['round_num'], 'card',
                        f"{me['nickname']} бьёт «{card['name']}» ({mine} против {theirs}): {target['nickname']} теряет 4 здоровья.")
                else:
                    health = max(0, health - 2)
                    is_out = health <= 0
                    log(cur, table_id, table['round_num'], 'card',
                        f"{me['nickname']} бьёт «{card['name']}» ({mine} против {theirs}) и получает отпор: −2 здоровья.")

            cur.execute(f"UPDATE player_cards SET status = 'played' WHERE id = {hand_id}")
            cur.execute(
                f"UPDATE players SET position = {position}, health = {health}, feathers = {feathers}, "
                f"cards = GREATEST(0, cards - 1), is_out = {'TRUE' if is_out else 'FALSE'} WHERE id = {me['id']}"
            )

            parts = []
            if card.get('reward_feathers'):
                parts.append(f"+{card['reward_feathers']} пера")
            if card.get('reward_health'):
                sign = '+' if card['reward_health'] > 0 else ''
                parts.append(f"{sign}{card['reward_health']} здоровья")
            if card.get('move'):
                parts.append(f"фишка идёт на «{tile(position)['name']}»")
            tail = (': ' + ', '.join(parts)) if parts else '.'
            log(cur, table_id, table['round_num'], 'card',
                f"{me['nickname']} разыгрывает «{card['name']}»{tail}")

            draws = card.get('draw', 0) + (1 if card.get('reward_card') else 0)
            for _ in range(draws):
                drawn = give_card(cur, table_id, me['id'], table['round_num'])
                log(cur, table_id, table['round_num'], 'card',
                    f"{me['nickname']} добирает карту: «{drawn['name']}».")

            if is_out:
                log(cur, table_id, table['round_num'], 'system', f"{me['nickname']} выбывает из партии.")

            cur.execute(f"SELECT * FROM players WHERE table_id = {table_id} ORDER BY seat_index")
            players_after = [dict(p) for p in cur.fetchall()]
            win = victory_check(players_after)
            if win:
                winner = next(p for p in players_after if p['id'] == win['winner_id'])
                cur.execute(f"UPDATE tables SET status = 'finished', updated_at = NOW() WHERE id = {table_id}")
                log(cur, table_id, table['round_num'], 'victory', f"Победа: {winner['nickname']}. {win['reason']}.")

            return ok(fetch_state(cur, code, token))

        if action == 'ally':
            target_id = int(body.get('targetId') or 0)
            cur.execute(f"SELECT * FROM players WHERE id = {target_id} AND table_id = {table_id}")
            target = cur.fetchone()
            if not target or target['id'] == me['id']:
                return err('Нужен другой игрок за столом')
            cur.execute(
                f"SELECT id FROM alliances WHERE table_id = {table_id} AND status <> 'broken' "
                f"AND ((from_player_id = {me['id']} AND to_player_id = {target['id']}) "
                f"OR (from_player_id = {target['id']} AND to_player_id = {me['id']}))"
            )
            if cur.fetchone():
                return err('С этим игроком уже есть договор')
            cur.execute(
                f"INSERT INTO alliances (table_id, from_player_id, to_player_id, created_round) "
                f"VALUES ({table_id}, {me['id']}, {target['id']}, {table['round_num']})"
            )
            log(cur, table_id, table['round_num'], 'alliance',
                f"{me['nickname']} предлагает союз игроку {target['nickname']}.")

            if target['is_bot']:
                if random.random() < profile(table.get('difficulty', 'normal'))['ally_accept']:
                    cur.execute(
                        f"UPDATE alliances SET status = 'active' WHERE table_id = {table_id} "
                        f"AND from_player_id = {me['id']} AND to_player_id = {target['id']} AND status = 'pending'"
                    )
                    cur.execute(
                        f"UPDATE players SET feathers = feathers + 1 WHERE id IN ({me['id']}, {target['id']})"
                    )
                    log(cur, table_id, table['round_num'], 'alliance',
                        f"{target['nickname']} принимает союз. Обе стороны получают по перу.")
                else:
                    cur.execute(
                        f"UPDATE alliances SET status = 'broken' WHERE table_id = {table_id} "
                        f"AND from_player_id = {me['id']} AND to_player_id = {target['id']} AND status = 'pending'"
                    )
                    log(cur, table_id, table['round_num'], 'alliance',
                        f"{target['nickname']} отклоняет союз: договор невыгоден.")

            return ok(fetch_state(cur, code, token))

        if action == 'accept':
            alliance_id = int(body.get('allianceId') or 0)
            cur.execute(
                f"SELECT * FROM alliances WHERE id = {alliance_id} AND table_id = {table_id} "
                f"AND to_player_id = {me['id']} AND status = 'pending'"
            )
            alliance = cur.fetchone()
            if not alliance:
                return err('Предложение не найдено')
            cur.execute(f"UPDATE alliances SET status = 'active' WHERE id = {alliance_id}")
            cur.execute(f"UPDATE players SET feathers = feathers + 1 WHERE id IN ({me['id']}, {alliance['from_player_id']})")
            log(cur, table_id, table['round_num'], 'alliance',
                f"{me['nickname']} принимает союз. Обе стороны получают по перу.")
            return ok(fetch_state(cur, code, token))

        if action == 'betray':
            alliance_id = int(body.get('allianceId') or 0)
            cur.execute(
                f"SELECT * FROM alliances WHERE id = {alliance_id} AND table_id = {table_id} "
                f"AND status = 'active' AND (from_player_id = {me['id']} OR to_player_id = {me['id']})"
            )
            alliance = cur.fetchone()
            if not alliance:
                return err('Активный союз не найден')
            other_id = alliance['to_player_id'] if alliance['from_player_id'] == me['id'] else alliance['from_player_id']
            cur.execute(f"UPDATE alliances SET status = 'broken' WHERE id = {alliance_id}")
            cur.execute(f"UPDATE players SET feathers = feathers + 2 WHERE id = {me['id']}")
            cur.execute(f"UPDATE players SET health = GREATEST(0, health - 2) WHERE id = {other_id}")
            cur.execute(f"SELECT nickname FROM players WHERE id = {other_id}")
            other_name = cur.fetchone()['nickname']
            log(cur, table_id, table['round_num'], 'betrayal',
                f"{me['nickname']} разрывает союз с {other_name}: +2 пера себе, −2 здоровья бывшему союзнику.")
            return ok(fetch_state(cur, code, token))

        return err('Неизвестное действие')
    finally:
        cur.close()
        connection.close()