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

    return {
        'table': {
            'code': t['code'], 'seats': t['seats'], 'status': t['status'],
            'round': t['round_num'],
        },
        'board': BOARD,
        'players': [
            {
                'id': p['id'], 'nickname': p['nickname'], 'godId': p['god_id'], 'godName': GOD_NAMES.get(p['god_id'], p['god_id']),
                'classId': p['class_id'], 'className': CLASS_NAMES.get(p['class_id'], p['class_id']),
                'seat': p['seat_index'], 'position': p['position'], 'health': p['health'],
                'feathers': p['feathers'], 'cards': p['cards'], 'isHost': p['is_host'],
                'isOut': p['is_out'], 'abilityUsed': p['ability_used'],
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
            log(cur, table_id, 1, 'system', 'Партия началась. Круг первый.')
            return ok(fetch_state(cur, code, token))

        if table['status'] != 'playing':
            return err('Партия ещё не началась')

        cur.execute(f"SELECT * FROM players WHERE table_id = {table_id} AND is_out = FALSE ORDER BY seat_index")
        alive = [dict(p) for p in cur.fetchall()]
        current = alive[table['turn_index'] % len(alive)] if alive else None

        if action == 'move':
            if not current or current['id'] != me['id']:
                return err('Сейчас не ваш ход')

            cur.execute(
                f"SELECT COUNT(*) AS n FROM alliances WHERE table_id = {table_id} AND status = 'active' "
                f"AND (from_player_id = {me['id']} OR to_player_id = {me['id']})"
            )
            alliance_count = cur.fetchone()['n']

            steps = move_steps(me['god_id'], me['class_id'])
            player = dict(me)
            player['position'] = advance(player['position'], steps)
            log(cur, table_id, table['round_num'], 'move',
                f"{me['nickname']} бросает кости: {steps}. Фишка идёт на «{tile(player['position'])['name']}».")

            effect = resolve_tile(player, alliance_count)
            if effect['extra_move']:
                player['position'] = advance(player['position'], effect['extra_move'])

            health = max(0, min(12, player['health'] + effect['health_delta']))
            feathers = max(0, player['feathers'] + effect['feathers_delta'])
            cards = max(0, player['cards'] + effect['cards_delta'])
            is_out = health <= 0

            cur.execute(
                f"UPDATE players SET position = {player['position']}, health = {health}, "
                f"feathers = {feathers}, cards = {cards}, is_out = {'TRUE' if is_out else 'FALSE'} "
                f"WHERE id = {me['id']}"
            )
            log(cur, table_id, table['round_num'], effect['kind'], effect['text'])
            if effect['dragon']:
                log(cur, table_id, table['round_num'], 'dragon',
                    f"Роль дракона по отношениям с богом {GOD_NAMES.get(me['god_id'], '')}: {DRAGON_NAMES[effect['dragon']]}.")
            if is_out:
                log(cur, table_id, table['round_num'], 'system', f"{me['nickname']} выбывает из партии.")

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

            return ok(fetch_state(cur, code, token))

        if action == 'skip':
            if not current or current['id'] != me['id']:
                return err('Сейчас не ваш ход')
            cur.execute(f"UPDATE players SET health = LEAST(12, health + 1) WHERE id = {me['id']}")
            log(cur, table_id, table['round_num'], 'system',
                f"{me['nickname']} пропускает ход и переводит дух. +1 здоровья.")
            next_turn(cur, table_id, table['turn_index'], table['round_num'], len(alive))
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
                cur.execute(f"UPDATE players SET cards = cards + 2, feathers = feathers + 1 WHERE id = {me['id']}")
                text = f"{me['nickname']} правит протокол: +2 карты, +1 перо."
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
