import random

HAND_LIMIT = 7

QUESTS = [
    {
        'id': 'q-temple-three',
        'name': 'Обход трёх храмов',
        'text': 'Разыграйте на любой клетке храма. Награда: +3 пера.',
        'requirement': 'храм',
        'reward_feathers': 3,
        'reward_health': 0,
        'weight': 3,
    },
    {
        'id': 'q-scales',
        'name': 'Слово на весах',
        'text': 'Разыграйте, стоя в Зале Взвешивания. Награда: +4 пера.',
        'requirement': 'весы',
        'reward_feathers': 4,
        'reward_health': 0,
        'weight': 3,
    },
    {
        'id': 'q-dragon-tribute',
        'name': 'Дань логову',
        'text': 'Разыграйте в логове дракона. Награда: +5 перьев, −2 здоровья.',
        'requirement': 'логово',
        'reward_feathers': 5,
        'reward_health': -2,
        'weight': 2,
    },
    {
        'id': 'q-market-deal',
        'name': 'Сделка века',
        'text': 'Разыграйте на рынке. Награда: +2 пера и ещё одна карта.',
        'requirement': 'рынок',
        'reward_feathers': 2,
        'reward_health': 0,
        'reward_card': True,
        'weight': 3,
    },
    {
        'id': 'q-desert-march',
        'name': 'Переход через пески',
        'text': 'Разыграйте в пустыне. Награда: +3 пера, −1 здоровья.',
        'requirement': 'пустыня',
        'reward_feathers': 3,
        'reward_health': -1,
        'weight': 3,
    },
    {
        'id': 'q-alliance-oath',
        'name': 'Клятва союзника',
        'text': 'Нужен хотя бы один действующий союз. Награда: +3 пера.',
        'requirement': 'alliance',
        'reward_feathers': 3,
        'reward_health': 0,
        'weight': 3,
    },
    {
        'id': 'q-night-vigil',
        'name': 'Ночное бдение',
        'text': 'Разыграйте в некрополе или храме. Награда: +2 пера, +2 здоровья.',
        'requirement': 'храм',
        'reward_feathers': 2,
        'reward_health': 2,
        'weight': 3,
    },
    {
        'id': 'q-lone-wolf',
        'name': 'Путь одиночки',
        'text': 'Нужен ход без единого союза. Награда: +4 пера.',
        'requirement': 'no_alliance',
        'reward_feathers': 4,
        'reward_health': 0,
        'weight': 2,
    },
    {
        'id': 'q-caravan',
        'name': 'Караван из Пунта',
        'text': 'Разыграйте на рынке. Награда: +1 перо и две карты.',
        'requirement': 'рынок',
        'reward_feathers': 1,
        'reward_health': 0,
        'draw': 2,
        'weight': 2,
    },
    {
        'id': 'q-wounded-pilgrim',
        'name': 'Раненый паломник',
        'text': 'Разыграйте с уроном на руках: чем хуже, тем щедрее. Награда: +3 пера, +3 здоровья.',
        'requirement': 'wounded',
        'reward_feathers': 3,
        'reward_health': 3,
        'weight': 2,
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
        'weight': 4,
    },
    {
        'id': 'g-khopesh',
        'name': 'Хопеш из метеорита',
        'text': 'Атакуйте соперника с бонусом +3 к броску.',
        'requirement': 'any',
        'reward_feathers': 0,
        'reward_health': 0,
        'attack_bonus': 3,
        'weight': 3,
    },
    {
        'id': 'g-spear',
        'name': 'Копьё Хора',
        'text': 'Точный удар с бонусом +5, но при промахе больно откатывает.',
        'requirement': 'any',
        'reward_feathers': 0,
        'reward_health': 0,
        'attack_bonus': 5,
        'weight': 2,
    },
    {
        'id': 'g-sandals',
        'name': 'Сандалии Шу',
        'text': 'Сдвиньтесь на три клетки вперёд без броска.',
        'requirement': 'any',
        'reward_feathers': 0,
        'reward_health': 0,
        'move': 3,
        'weight': 3,
    },
    {
        'id': 'g-barque',
        'name': 'Ладья Ра',
        'text': 'Пройдите пять клеток по течению без броска.',
        'requirement': 'any',
        'reward_feathers': 0,
        'reward_health': 0,
        'move': 5,
        'weight': 2,
    },
    {
        'id': 'g-amulet',
        'name': 'Амулет уаджет',
        'text': 'Снимает штраф бога: +2 здоровья и +1 перо.',
        'requirement': 'any',
        'reward_feathers': 1,
        'reward_health': 2,
        'weight': 3,
    },
    {
        'id': 'g-scroll',
        'name': 'Свиток Тота',
        'text': 'Возьмите две карты из колоды.',
        'requirement': 'any',
        'reward_feathers': 0,
        'reward_health': 0,
        'draw': 2,
        'weight': 3,
    },
    {
        'id': 'g-shield',
        'name': 'Щит Исиды',
        'text': 'Плотный заслон: +3 здоровья и +1 перо за выдержку.',
        'requirement': 'any',
        'reward_feathers': 1,
        'reward_health': 3,
        'weight': 3,
    },
    {
        'id': 'g-canopic',
        'name': 'Каноп с бальзамом',
        'text': 'Полное восстановление: +6 здоровья.',
        'requirement': 'any',
        'reward_feathers': 0,
        'reward_health': 6,
        'weight': 1,
    },
    {
        'id': 'g-crown',
        'name': 'Двойная корона',
        'text': 'Знак власти: +3 пера сразу.',
        'requirement': 'any',
        'reward_feathers': 3,
        'reward_health': 0,
        'weight': 1,
    },
]

INTRIGUES = [
    {
        'id': 'i-theft',
        'name': 'Ночная кража',
        'text': 'Заберите одну карту с руки соперника.',
        'requirement': 'any',
        'reward_feathers': 0,
        'reward_health': 0,
        'steal_card': True,
        'weight': 3,
    },
    {
        'id': 'i-slander',
        'name': 'Донос визиря',
        'text': 'Соперник теряет 2 пера, вы получаете 1.',
        'requirement': 'any',
        'reward_feathers': 1,
        'reward_health': 0,
        'steal_feathers': 2,
        'weight': 3,
    },
    {
        'id': 'i-sandstorm',
        'name': 'Песчаная буря',
        'text': 'Отбросьте соперника на три клетки назад.',
        'requirement': 'any',
        'reward_feathers': 0,
        'reward_health': 0,
        'push_back': 3,
        'weight': 3,
    },
    {
        'id': 'i-plague',
        'name': 'Кара Сехмет',
        'text': 'Соперник теряет 3 здоровья без боя.',
        'requirement': 'any',
        'reward_feathers': 0,
        'reward_health': 0,
        'direct_damage': 3,
        'weight': 2,
    },
    {
        'id': 'i-broken-oath',
        'name': 'Нарушенная клятва',
        'text': 'Разорвите чужой союз. Награда: +2 пера.',
        'requirement': 'any',
        'reward_feathers': 2,
        'reward_health': 0,
        'break_alliance': True,
        'weight': 2,
    },
]

ALL_CARDS = {c['id']: c for c in QUESTS + GEAR + INTRIGUES}

DECK = []
for _card in QUESTS + GEAR + INTRIGUES:
    DECK.extend([_card] * _card.get('weight', 1))


def card_info(card_id: str) -> dict:
    return ALL_CARDS.get(card_id, {'id': card_id, 'name': 'Неизвестная карта', 'text': '', 'requirement': 'any'})


def draw_card(kind: str = '') -> dict:
    if kind == 'quest':
        return random.choice(QUESTS)
    if kind == 'gear':
        return random.choice(GEAR)
    if kind == 'intrigue':
        return random.choice(INTRIGUES)
    return random.choice(DECK)


def card_kind(card_id: str) -> str:
    if card_id.startswith('q-'):
        return 'quest'
    if card_id.startswith('i-'):
        return 'intrigue'
    return 'gear'


def needs_target(card: dict) -> bool:
    return bool(
        card.get('attack_bonus')
        or card.get('steal_card')
        or card.get('steal_feathers')
        or card.get('push_back')
        or card.get('direct_damage')
        or card.get('break_alliance')
    )


def can_play(card: dict, tile_type: str, alliance_count: int, health: int = 12) -> tuple:
    req = card.get('requirement', 'any')
    if req == 'any':
        return True, ''
    if req == 'alliance':
        if alliance_count > 0:
            return True, ''
        return False, 'Нужен хотя бы один действующий союз.'
    if req == 'no_alliance':
        if alliance_count == 0:
            return True, ''
        return False, 'Карта работает только без союзов.'
    if req == 'wounded':
        if health <= 7:
            return True, ''
        return False, 'Нужно здоровье 7 или ниже.'
    if req == tile_type:
        return True, ''
    return False, f'Карту можно разыграть только на клетке типа «{req}».'
