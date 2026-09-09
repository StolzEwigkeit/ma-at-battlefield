import random

QUESTS = [
    {
        'id': 'q-temple-three',
        'name': 'Обход трёх храмов',
        'text': 'Встаньте на любую клетку храма. Награда: +3 пера.',
        'requirement': 'храм',
        'reward_feathers': 3,
        'reward_health': 0,
    },
    {
        'id': 'q-scales',
        'name': 'Слово на весах',
        'text': 'Разыграйте, стоя в Зале Взвешивания. Награда: +4 пера.',
        'requirement': 'весы',
        'reward_feathers': 4,
        'reward_health': 0,
    },
    {
        'id': 'q-dragon-tribute',
        'name': 'Дань логову',
        'text': 'Разыграйте в логове дракона. Награда: +5 перьев, −2 здоровья.',
        'requirement': 'логово',
        'reward_feathers': 5,
        'reward_health': -2,
    },
    {
        'id': 'q-market-deal',
        'name': 'Сделка века',
        'text': 'Разыграйте на рынке. Награда: +2 пера и ещё одна карта.',
        'requirement': 'рынок',
        'reward_feathers': 2,
        'reward_health': 0,
        'reward_card': True,
    },
    {
        'id': 'q-desert-march',
        'name': 'Переход через пески',
        'text': 'Разыграйте в пустыне. Награда: +3 пера, −1 здоровья.',
        'requirement': 'пустыня',
        'reward_feathers': 3,
        'reward_health': -1,
    },
    {
        'id': 'q-alliance-oath',
        'name': 'Клятва союзника',
        'text': 'Нужен хотя бы один действующий союз. Награда: +3 пера.',
        'requirement': 'alliance',
        'reward_feathers': 3,
        'reward_health': 0,
    },
]

GEAR = [
    {
        'id': 'g-ankh',
        'name': 'Анх исцеления',
        'text': 'Разыграйте в любой момент своего хода: +4 здоровья.',
        'requirement': 'any',
        'reward_feathers': 0,
        'reward_health': 4,
    },
    {
        'id': 'g-khopesh',
        'name': 'Хопеш из метеорита',
        'text': 'Атакуйте соседа по столу с бонусом +3 к броску.',
        'requirement': 'any',
        'reward_feathers': 0,
        'reward_health': 0,
        'attack_bonus': 3,
    },
    {
        'id': 'g-sandals',
        'name': 'Сандалии Шу',
        'text': 'Сдвиньтесь на три клетки вперёд без броска.',
        'requirement': 'any',
        'reward_feathers': 0,
        'reward_health': 0,
        'move': 3,
    },
    {
        'id': 'g-amulet',
        'name': 'Амулет уаджет',
        'text': 'Снимает штраф бога: +2 здоровья и +1 перо.',
        'requirement': 'any',
        'reward_feathers': 1,
        'reward_health': 2,
    },
    {
        'id': 'g-scroll',
        'name': 'Свиток Тота',
        'text': 'Возьмите две карты из колоды.',
        'requirement': 'any',
        'reward_feathers': 0,
        'reward_health': 0,
        'draw': 2,
    },
    {
        'id': 'g-shield',
        'name': 'Щит Исиды',
        'text': 'Плотный заслон: +3 здоровья и +1 перо за выдержку.',
        'requirement': 'any',
        'reward_feathers': 1,
        'reward_health': 3,
    },
]

ALL_CARDS = {c['id']: c for c in QUESTS + GEAR}


def card_info(card_id: str) -> dict:
    return ALL_CARDS.get(card_id, {'id': card_id, 'name': 'Неизвестная карта', 'text': '', 'requirement': 'any'})


def draw_card(kind: str = '') -> dict:
    if kind == 'quest':
        return random.choice(QUESTS)
    if kind == 'gear':
        return random.choice(GEAR)
    return random.choice(QUESTS + GEAR)


def card_kind(card_id: str) -> str:
    return 'quest' if card_id.startswith('q-') else 'gear'


def can_play(card: dict, tile_type: str, alliance_count: int) -> tuple:
    req = card.get('requirement', 'any')
    if req == 'any':
        return True, ''
    if req == 'alliance':
        if alliance_count > 0:
            return True, ''
        return False, 'Нужен хотя бы один действующий союз.'
    if req == tile_type:
        return True, ''
    return False, f'Карту можно разыграть только на клетке типа «{req}».'
