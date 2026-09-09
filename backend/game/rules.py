import random

BOARD = [
    {'id': 1, 'name': 'Врата Рассвета', 'type': 'храм'},
    {'id': 2, 'name': 'Песчаный тракт', 'type': 'пустыня'},
    {'id': 3, 'name': 'Рынок Мемфиса', 'type': 'рынок'},
    {'id': 4, 'name': 'Логово дракона', 'type': 'логово'},
    {'id': 5, 'name': 'Зал Взвешивания', 'type': 'весы'},
    {'id': 6, 'name': 'Храм Ра', 'type': 'храм'},
    {'id': 7, 'name': 'Русло Нила', 'type': 'пустыня'},
    {'id': 8, 'name': 'Некрополь', 'type': 'храм'},
    {'id': 9, 'name': 'Второе логово', 'type': 'логово'},
    {'id': 10, 'name': 'Соляной торг', 'type': 'рынок'},
    {'id': 11, 'name': 'Красная дюна', 'type': 'пустыня'},
    {'id': 12, 'name': 'Чаша Порядка', 'type': 'весы'},
]

BOARD_SIZE = len(BOARD)

VICTORY_FEATHERS = 20

DRAGON_ATTITUDE = {
    'ra': 'guardian',
    'anubis': 'messenger',
    'set': 'enemy',
    'osiris': 'guardian',
    'isis': 'trickster',
    'bast': 'messenger',
    'thoth': 'trickster',
}

DRAGON_NAMES = {
    'messenger': 'Посланник',
    'enemy': 'Враг',
    'trickster': 'Трикстер',
    'guardian': 'Хранитель',
}

GOD_NAMES = {
    'ra': 'Ра', 'anubis': 'Анубис', 'set': 'Сет', 'osiris': 'Осирис',
    'isis': 'Исида', 'bast': 'Баст', 'thoth': 'Тот',
}

CLASS_NAMES = {
    'vizier': 'Визирь', 'warrior': 'Воин', 'priest': 'Жрец', 'scribe': 'Писец',
}

CLASS_COMBAT = {'vizier': -1, 'warrior': 2, 'priest': 0, 'scribe': 0}


def tile(pos: int) -> dict:
    return BOARD[(pos - 1) % BOARD_SIZE]


def roll(sides: int = 6) -> int:
    return random.randint(1, sides)


def move_steps(god_id: str, class_id: str) -> int:
    steps = roll()
    if god_id == 'thoth':
        steps += 1
    return steps


def advance(pos: int, steps: int) -> int:
    return ((pos - 1 + steps) % BOARD_SIZE) + 1


def scales_weight(player: dict, alliance_count: int) -> dict:
    order = roll() + alliance_count
    chaos = roll() + player['feathers']
    if player['god_id'] == 'anubis':
        order += 1
    if player['god_id'] == 'set':
        chaos += 2
    return {'order': order, 'chaos': chaos}


def combat_power(player: dict) -> int:
    power = roll() + CLASS_COMBAT.get(player['class_id'], 0)
    if player['god_id'] == 'set':
        power += 2
    return power


def resolve_tile(player: dict, alliance_count: int) -> dict:
    """Считает эффект клетки, на которую встал Избранный."""
    t = tile(player['position'])
    kind = t['type']
    result = {
        'tile': t,
        'kind': kind,
        'health_delta': 0,
        'feathers_delta': 0,
        'cards_delta': 0,
        'extra_move': 0,
        'dragon': None,
        'scales': None,
        'text': '',
    }

    if kind == 'храм':
        heal = 2 if player['god_id'] in ('ra', 'bast', 'osiris') else 1
        result['health_delta'] = heal
        result['feathers_delta'] = 1
        result['text'] = f"{t['name']}: храм принимает Избранного. +{heal} здоровья, +1 перо."

    elif kind == 'пустыня':
        if t['id'] == 7:
            result['extra_move'] = 2
            result['text'] = f"{t['name']}: течение сносит фишку на две клетки вперёд."
        elif t['id'] == 11:
            result['health_delta'] = -1
            result['feathers_delta'] = 1 if player['god_id'] == 'set' else 0
            result['text'] = f"{t['name']}: территория Сета. −1 здоровья от бури."
        else:
            result['extra_move'] = 1
            result['text'] = f"{t['name']}: тракт ускоряет ход. +1 клетка движения."

    elif kind == 'рынок':
        gain = roll(3)
        result['cards_delta'] = 1
        result['feathers_delta'] = 1 if gain >= 2 else 0
        result['text'] = f"{t['name']}: сделка удалась. +1 карта" + (", +1 перо." if gain >= 2 else ".")

    elif kind == 'логово':
        role = DRAGON_ATTITUDE.get(player['god_id'], 'trickster')
        result['dragon'] = role
        if role == 'messenger':
            result['cards_delta'] = 1
            result['text'] = f"Дракон-Посланник отдаёт вам чужую закрытую карту и уходит без боя."
        elif role == 'enemy':
            power = combat_power(player)
            dragon_power = roll() + 3
            if power >= dragon_power:
                result['feathers_delta'] = 2
                result['text'] = f"Дракон-Враг напал ({power} против {dragon_power}). Победа: +2 пера трофеем."
            else:
                result['health_delta'] = -3
                result['text'] = f"Дракон-Враг напал ({power} против {dragon_power}). Поражение: −3 здоровья."
        elif role == 'trickster':
            result['extra_move'] = roll(4) - 2
            result['text'] = "Дракон-Трикстер меняет вас местами на поле: фишка сдвигается непредсказуемо."
        else:
            result['health_delta'] = 1
            result['feathers_delta'] = 1
            result['text'] = "Дракон-Хранитель закрывает локацию для остальных: +1 здоровья, +1 перо."

    elif kind == 'весы':
        w = scales_weight(player, alliance_count)
        result['scales'] = w
        diff = w['order'] - w['chaos']
        if diff > 1:
            result['feathers_delta'] = 2
            result['text'] = f"Взвешивание {w['order']}:{w['chaos']} — перевесил порядок. +2 пера."
        elif diff < -1:
            result['feathers_delta'] = 1
            result['health_delta'] = -1
            result['text'] = f"Взвешивание {w['order']}:{w['chaos']} — перевесил хаос. +1 перо, −1 здоровья."
        else:
            result['feathers_delta'] = 1
            result['text'] = f"Взвешивание {w['order']}:{w['chaos']} — равновесие. Перо истины ваше."

    return result


def victory_check(players: list) -> dict | None:
    alive = [p for p in players if not p['is_out']]
    if len(alive) == 1 and len(players) > 1:
        return {'winner_id': alive[0]['id'], 'reason': 'Остальные Избранные выбыли'}
    for p in alive:
        if p['feathers'] >= VICTORY_FEATHERS:
            return {'winner_id': p['id'], 'reason': f'Собрано {VICTORY_FEATHERS} перьев истины'}
    return None