import random
from typing import Any, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Clash Royale AI Analytics")

class CardShort(BaseModel):
    id: Optional[int] = None
    apiCardId: Optional[int] = None
    name: Optional[str] = None
    iconUrl: Optional[str] = None

class DeckShort(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    deckType: Optional[str] = None
    strategy: Optional[str] = None
    qualityScore: Optional[float] = None
    cards: list[CardShort] = []

class DeckCardInput(BaseModel):
    cardId: int
    slotNumber: int

class DeckSelection(BaseModel):
    source: str
    deckId: Optional[int] = None
    cards: Optional[list[DeckCardInput]] = None

class CompareDecksRequest(BaseModel):
    leftDeck: DeckSelection
    rightDeck: DeckSelection

class AiCompareRequest(BaseModel):
    playerTag: Optional[str] = None
    leftDeck: DeckShort
    rightDeck: DeckShort
    originalRequest: CompareDecksRequest

class AiCompareResponse(BaseModel):
    leftScore: float
    rightScore: float
    leftBreakdown: dict[str, Any]
    rightBreakdown: dict[str, Any]
    winnerSide: str
    resultDescription: str

class GenerateDeckConstraints(BaseModel):
    strategy: Optional[str] = None
    favoriteCardIds: Optional[list[int]] = None
    excludedCardIds: Optional[list[int]] = None
    minElixir: Optional[float] = None
    maxElixir: Optional[float] = None
    saveResult: Optional[bool] = None

class Card(BaseModel):
    id: Optional[int] = None
    apiCardId: Optional[int] = None
    name: Optional[str] = None
    elixir: Optional[int] = None
    rarity: Optional[str] = None
    arena: Optional[int] = None
    iconUrl: Optional[str] = None
    description: Optional[str] = None
    dataJson: Optional[dict[str, Any]] = None
    updatedAt: Optional[str] = None

class AiGenerateDeckRequest(BaseModel):
    playerTag: str
    constraints: GenerateDeckConstraints
    availableCards: list[Card]

class AiGeneratedDeckResponse(BaseModel):
    cardIds: list[int]
    name: str
    strategy: str
    description: str
    qualityScore: float
    explanation: str
    breakdown: dict[str, Any]

STRATEGY_RULES: dict[str, dict[str, Any]] = {
    "Cycle": {
        "label": "Cycle",
        "ideal_elixir": 2.8,
        "desc": "Fast cycle deck with cheap cards for quick rotations",
        "prefer_low_elixir": True,
        "min_spells": 2,
        "win_conditions": ["Hog Rider", "Miner", "Wall Breakers", "Goblin Barrel", "Battle Ram",
                          "X-Bow", "Mortar", "Skeleton Barrel", "Graveyard"],
        "buildings": ["X-Bow", "Mortar", "Tesla", "Cannon", "Inferno Tower"],
        "anti_tank": ["Mini P.E.K.K.A", "Inferno Tower", "Inferno Dragon", "P.E.K.K.A",
                      "Barbarians", "Hunter", "Lumberjack"],
    },
    "Beatdown": {
        "label": "Beatdown",
        "ideal_elixir": 4.2,
        "desc": "Heavy beatdown deck with a tank and support",
        "prefer_low_elixir": False,
        "min_spells": 1,
        "win_conditions": ["Giant", "Golem", "P.E.K.K.A", "Royal Giant", "Mega Knight",
                          "Elite Barbarians", "Lava Hound", "Electro Giant"],
        "tanks": ["Giant", "Golem", "P.E.K.K.A", "Royal Giant", "Mega Knight",
                  "Lava Hound", "Electro Giant", "Rocket"],
        "support": ["Musketeer", "Wizard", "Electro Wizard", "Magic Archer", "Baby Dragon",
                    "Night Witch", "Minions", "Mega Minion", "Phoenix"],
    },
    "Control": {
        "label": "Control",
        "ideal_elixir": 3.5,
        "desc": "Balanced control deck with defense and counter-push",
        "prefer_low_elixir": False,
        "min_spells": 1,
        "win_conditions": ["Graveyard", "Miner", "Hog Rider", "Prince", "Dark Prince",
                          "Bandit", "Royal Hogs", "Wall Breakers"],
        "defensive": ["Knight", "Valkyrie", "Ice Wizard", "Tornado", "Tesla",
                      "Cannon", "Bomb Tower", "Goblin Cage", "Tombstone"],
        "anti_tank": ["Mini P.E.K.K.A", "P.E.K.K.A", "Inferno Dragon", "Hunter",
                      "Barbarians", "Cannon Cart"],
    },
    "Siege": {
        "label": "Siege",
        "ideal_elixir": 3.8,
        "desc": "Siege deck built around a building win condition",
        "prefer_low_elixir": False,
        "min_spells": 2,
        "win_conditions": ["X-Bow", "Mortar"],
        "buildings": ["X-Bow", "Mortar", "Tesla", "Cannon", "Inferno Tower",
                      "Bomb Tower", "Tornado", "Goblin Cage"],
        "defensive": ["Ice Wizard", "Knight", "Valkyrie", "Archers", "Tornado",
                      "Log", "Rocket", "Fireball"],
    },
}

def is_win_condition(name: str) -> bool:
    for rules in STRATEGY_RULES.values():
        if name in rules.get("win_conditions", []):
            return True
    return False

def pick_cards_by_strategy(cards: list[Card], strategy: str,
                           excluded: set[int], min_elixir: int, max_elixir: int,
                           favorites: list[int]) -> tuple[list[int], str]:
    rules = STRATEGY_RULES.get(strategy, STRATEGY_RULES["Cycle"])

    candidates = [c for c in cards
                  if c.id not in excluded
                  and (c.elixir is None or (min_elixir <= c.elixir <= max_elixir))]

    if not candidates:
        candidates = [c for c in cards if c.id not in excluded]

    cards_by_id = {c.id: c for c in cards}
    random.shuffle(candidates)
    picked: list[int] = []
    picked_names: set[str] = set()

    def try_add(card: Card) -> bool:
        if card.id not in picked and card.name not in picked_names:
            picked.append(card.id)
            picked_names.add(card.name)
            return True
        return False

    for fid in favorites:
        for c in candidates:
            if c.id == fid:
                try_add(c)
                break

    if strategy == "Cycle":
        cheap = [c for c in candidates if c.elixir is not None and c.elixir <= 3
                 and c.name not in picked_names]
        spells = [c for c in cheap if c.name in {"Zap", "Log", "Fireball", "Poison",
                  "Rocket", "Tornado", "Arrows", "Barbarian Barrel", "Snowball",
                  "Goblin Barrel", "Mirror", "Clone", "Heal Spirit", "Rage"}]
        for s in spells:
            spell_count = sum(1 for x in picked if cards_by_id[x].name in {
                "Zap", "Log", "Fireball", "Poison", "Rocket", "Tornado", "Arrows",
                "Barbarian Barrel", "Snowball", "Goblin Barrel", "Mirror", "Clone",
                "Heal Spirit", "Rage"})
            if spell_count < rules["min_spells"]:
                try_add(s)

        candidates.sort(key=lambda c: c.elixir if c.elixir is not None else 99)
        for c in candidates:
            if len(picked) >= 8:
                break
            try_add(c)

    elif strategy == "Siege":
        buildings = [c for c in candidates if c.name in rules.get("buildings", [])]
        for b in buildings:
            if len(picked) >= 8:
                break
            try_add(b)
        anti = [c for c in candidates if c.name in rules.get("defensive", [])]
        for a in anti:
            if len(picked) >= 8:
                break
            try_add(a)
        candidates.sort(key=lambda c: -(c.elixir if c.elixir is not None else 0))
        for c in candidates:
            if len(picked) >= 8:
                break
            try_add(c)

    elif strategy == "Beatdown":
        tanks = [c for c in candidates if c.name in rules.get("tanks", [])]
        for t in tanks:
            if len(picked) >= 8:
                break
            try_add(t)
        supp = [c for c in candidates if c.name in rules.get("support", [])]
        for s in supp:
            if len(picked) >= 8:
                break
            try_add(s)
        candidates.sort(key=lambda c: -(c.elixir if c.elixir is not None else 0))
        for c in candidates:
            if len(picked) >= 8:
                break
            try_add(c)

    else:
        anti = [c for c in candidates if c.name in rules.get("anti_tank", [])]
        for a in anti:
            if len(picked) >= 8:
                break
            try_add(a)
        wc = [c for c in candidates if c.name in rules.get("win_conditions", [])]
        for w in wc:
            if len(picked) >= 8:
                break
            try_add(w)
        candidates.sort(key=lambda c: abs((c.elixir if c.elixir is not None else 5) - 3.5))
        for c in candidates:
            if len(picked) >= 8:
                break
            try_add(c)

    while len(picked) < 8 and candidates:
        c = random.choice(candidates)
        try_add(c)
        candidates = [x for x in candidates if x.id != c.id and x.name not in picked_names]

    while len(picked) < 8:
        for c in cards:
            if c.id not in picked and c.name not in picked_names:
                picked.append(c.id)
                picked_names.add(c.name)
                if len(picked) >= 8:
                    break

    return picked[:8], rules["desc"]


def rate_deck(deck: list[Card]) -> dict[str, Any]:
    if not deck:
        return {"avgElixir": 0, "score": 0, "winConditions": 0, "spells": 0, "buildings": 0}

    elixirs = [c.elixir for c in deck if c.elixir is not None]
    avg_elixir = sum(elixirs) / len(elixirs) if elixirs else 0
    wc_count = sum(1 for c in deck if is_win_condition(c.name))
    spell_count = sum(1 for c in deck if c.name in {
        "Zap", "Log", "Fireball", "Poison", "Rocket", "Tornado", "Arrows",
        "Barbarian Barrel", "Snowball", "Goblin Barrel", "Mirror", "Clone",
        "Heal Spirit", "Rage", "Freeze", "Lightning", "Earthquake", "Giant Snowball",
        "The Log"})
    building_count = sum(1 for c in deck if c.name in {
        "X-Bow", "Mortar", "Tesla", "Cannon", "Inferno Tower", "Bomb Tower",
        "Tombstone", "Goblin Cage", "Goblin Hut", "Barbarian Hut", "Furnace",
        "Elixir Collector"})
    anti_tank = sum(1 for c in deck if c.name in {
        "Mini P.E.K.K.A", "P.E.K.K.A", "Inferno Dragon", "Inferno Tower",
        "Hunter", "Barbarians", "Lumberjack", "Cannon Cart", "Mega Knight",
        "Prince", "Dark Prince"})
    splash = sum(1 for c in deck if c.name in {
        "Wizard", "Executioner", "Baby Dragon", "Magic Archer", "Princess",
        "Firecracker", "Bowler", "Valkyrie", "Dark Prince", "Mega Knight"})

    elixir_score = max(0, 40 - abs(avg_elixir - 3.5) * 10)
    wc_score = min(20, wc_count * 10)
    spell_score = min(10, spell_count * 3)
    building_score = min(10, building_count * 3)
    anti_tank_score = min(10, anti_tank * 3)
    splash_score = min(10, splash * 3)
    total = min(100, elixir_score + wc_score + spell_score + building_score + anti_tank_score + splash_score)

    return {
        "avgElixir": round(avg_elixir, 1),
        "score": round(total, 1),
        "winConditions": wc_count,
        "spells": spell_count,
        "buildings": building_count,
        "antiTank": anti_tank,
        "splash": splash,
    }


COUNTERS: dict[str, list[str]] = {
    "Hog Rider": ["Tornado", "Cannon", "Tesla", "Inferno Tower", "Bomb Tower",
                   "Tombstone", "Goblin Cage", "Mini P.E.K.K.A", "P.E.K.K.A",
                   "Hunter", "Barbarians"],
    "Giant": ["Inferno Tower", "Inferno Dragon", "Mini P.E.K.K.A", "P.E.K.K.A",
              "Hunter", "Barbarians", "Cannon Cart", "Mega Knight"],
    "Golem": ["Inferno Tower", "Inferno Dragon", "Mini P.E.K.K.A", "P.E.K.K.A",
              "Hunter", "Tornado", "Barbarians"],
    "Balloon": ["Tornado", "Hunter", "Mega Minion", "Minions", "Ice Wizard",
                "Tesla", "Cannon", "Inferno Tower"],
    "X-Bow": ["Rocket", "Lightning", "Earthquake", "Tornado", "Royal Giant",
              "Goblin Giant", "Hog Rider", "Battle Ram"],
    "Mortar": ["Rocket", "Lightning", "Earthquake", "Miner", "Royal Giant",
               "Goblin Giant", "Hog Rider"],
    "Mega Knight": ["P.E.K.K.A", "Mini P.E.K.K.A", "Inferno Dragon", "Knight",
                    "Valkyrie", "Barbarians", "Cannon Cart"],
    "P.E.K.K.A": ["Mini P.E.K.K.A", "Inferno Dragon", "Inferno Tower",
                  "Hunter", "Barbarians", "Swarm"],
    "Royal Giant": ["Inferno Tower", "Inferno Dragon", "Mini P.E.K.K.A",
                    "P.E.K.K.A", "Hunter", "Barbarians", "Cannon"],
    "Graveyard": ["Arrows", "Poison", "Barbarian Barrel", "Valkyrie",
                  "Baby Dragon", "Ice Wizard", "Tornado", "Firecracker",
                  "Princess", "Magic Archer"],
    "Miner": ["Knight", "Valkyrie", "Archers", "Cannon", "Tesla",
              "Goblins", "Bomber"],
    "Goblin Barrel": ["Arrows", "Log", "Barbarian Barrel", "Zap", "Snowball",
                      "Princess", "Firecracker", "Magic Archer"],
}


def compare_single(left: list[Card], right: list[Card]) -> dict[str, Any]:
    lr = rate_deck(left)
    rr = rate_deck(right)

    left_names = set(c.name for c in left)
    right_names = set(c.name for c in right)

    left_counters_right = 0
    for rn in right_names:
        if rn in COUNTERS:
            for counter in COUNTERS[rn]:
                if counter in left_names:
                    left_counters_right += 1

    right_counters_left = 0
    for ln in left_names:
        if ln in COUNTERS:
            for counter in COUNTERS[ln]:
                if counter in right_names:
                    right_counters_left += 1

    left_defense = sum(1 for c in left if c.name in {
        "Tornado", "Cannon", "Tesla", "Inferno Tower", "Inferno Dragon",
        "Mini P.E.K.K.A", "P.E.K.K.A", "Hunter", "Barbarians", "Tombstone",
        "Goblin Cage", "Bomb Tower", "Knight", "Valkyrie"})
    right_defense = sum(1 for c in right if c.name in {
        "Tornado", "Cannon", "Tesla", "Inferno Tower", "Inferno Dragon",
        "Mini P.E.K.K.A", "P.E.K.K.A", "Hunter", "Barbarians", "Tombstone",
        "Goblin Cage", "Bomb Tower", "Knight", "Valkyrie"})

    l_elixir = lr["avgElixir"]
    r_elixir = rr["avgElixir"]

    elixir_advantage = 0
    if abs(l_elixir - r_elixir) > 0.5:
        if l_elixir < r_elixir:
            elixir_advantage = 5
        else:
            elixir_advantage = -5

    left_total = lr["score"] + left_counters_right * 4 + elixir_advantage + left_defense * 1.5
    right_total = rr["score"] + right_counters_left * 4 - elixir_advantage + right_defense * 1.5

    # Cap final scores at 100 for percentage display
    left_total = min(100, left_total)
    right_total = min(100, right_total)

    return {
        "leftScore": round(left_total, 1),
        "rightScore": round(right_total, 1),
        "leftBreakdown": {
            "baseScore": lr["score"],
            "counters": left_counters_right,
            "defenseCards": left_defense,
            "avgElixir": l_elixir,
            "winConditions": lr["winConditions"],
            "spells": lr["spells"],
            "buildings": lr["buildings"],
        },
        "rightBreakdown": {
            "baseScore": rr["score"],
            "counters": right_counters_left,
            "defenseCards": right_defense,
            "avgElixir": r_elixir,
            "winConditions": rr["winConditions"],
            "spells": rr["spells"],
            "buildings": rr["buildings"],
        },
    }


@app.post("/generate-deck")
async def generate_deck(request: AiGenerateDeckRequest) -> AiGeneratedDeckResponse:
    cards = request.availableCards
    cons = request.constraints
    strategy = (cons.strategy or "Cycle").capitalize()
    if strategy not in STRATEGY_RULES:
        strategy = "Cycle"

    excluded = set(cons.excludedCardIds or [])
    favorites = cons.favoriteCardIds or []
    min_el = cons.minElixir or 1
    max_el = cons.maxElixir or 8

    picked_ids, hint = pick_cards_by_strategy(
        cards, strategy, excluded, min_el, max_el, favorites
    )

    picked_cards = [c for c in cards if c.id in picked_ids]
    # maintain original order
    picked_cards.sort(key=lambda c: picked_ids.index(c.id))

    rating = rate_deck(picked_cards)
    avg_el = rating["avgElixir"]
    ideal = STRATEGY_RULES[strategy]["ideal_elixir"]
    quality = max(5, min(100, rating["score"] - abs(avg_el - ideal) * 8))

    has_wc = any(is_win_condition(c.name) for c in picked_cards)
    desc_parts = [f"{strategy} deck ({avg_el:.1f} avg elixir)"]
    if has_wc:
        desc_parts.append("with win condition")
    else:
        desc_parts.append("(no clear win condition)")
    description = " - ".join(desc_parts)

    wc_names = [c.name for c in picked_cards if is_win_condition(c.name)]
    explanation_parts = [f"Generated a {strategy.lower()} deck"]
    if wc_names:
        explanation_parts.append(f"win condition: {', '.join(wc_names[:2])}")
    explanation_parts.append(f"avg elixir {avg_el:.1f}")
    explanation = ". ".join(explanation_parts) + "."

    deck_name_parts = [strategy]
    if wc_names:
        deck_name_parts.append(wc_names[0])
    deck_name = " ".join(deck_name_parts)

    return AiGeneratedDeckResponse(
        cardIds=picked_ids,
        name=deck_name,
        strategy=strategy,
        description=description,
        qualityScore=round(quality, 1),
        explanation=explanation,
        breakdown=rating,
    )


@app.post("/compare")
async def compare(request: AiCompareRequest) -> AiCompareResponse:
    def to_card(cs: CardShort) -> Card:
        return Card(
            id=cs.id,
            apiCardId=cs.apiCardId,
            name=cs.name,
            iconUrl=cs.iconUrl,
            elixir=guess_elixir(cs.name),
        )

    left = [to_card(cs) for cs in (request.leftDeck.cards or [])]
    right = [to_card(cs) for cs in (request.rightDeck.cards or [])]

    result = compare_single(left, right)

    if result["leftScore"] > result["rightScore"] + 3:
        winner = "LEFT"
        desc = "Left deck has the advantage"
    elif result["rightScore"] > result["leftScore"] + 3:
        winner = "RIGHT"
        desc = "Right deck has the advantage"
    else:
        winner = "DRAW"
        desc = "Both decks are evenly matched"

    return AiCompareResponse(
        leftScore=result["leftScore"],
        rightScore=result["rightScore"],
        leftBreakdown=result["leftBreakdown"],
        rightBreakdown=result["rightBreakdown"],
        winnerSide=winner,
        resultDescription=desc,
    )


ELIXIR_MAP: dict[str, int] = {}

def guess_elixir(name: str) -> int:
    if not ELIXIR_MAP:
        _build_elixir_map()
    return ELIXIR_MAP.get(name, 4)


def _build_elixir_map() -> None:
    global ELIXIR_MAP
    data = [
        (1, ["Skeletons", "Ice Spirit", "Electro Spirit", "Heal Spirit", "Fire Spirit",
             "Bats", "Goblins", "Spear Goblins", "Zap", "Snowball", "Arrows",
             "Barbarian Barrel", "Giant Snowball", "Bomber", "Berserker",
             "Tower Princess", "Dagger Duchess"]),
        (2, ["Knight", "Archers", "Minions", "Goblin Gang", "Rascals", "Wall Breakers",
             "Cannon", "Tombstone", "Log", "Poison", "Goblin Barrel", "Skeleton Barrel",
             "Barbarians", "Tesla", "Firecracker", "Royal Recruits", "Goblins", "Bomber",
             "Zap", "Bats", "Ice Spirit", "Electro Spirit", "Heal Spirit",
             "Rage", "Clone", "Mirror"]),
        (3, ["Knight", "Valkyrie", "Mini P.E.K.K.A", "Hog Rider", "Battle Ram",
             "Miner", "Bandit", "Royal Ghost", "Fisherman", "Lumberjack",
             "Ice Wizard", "Princess", "Electro Wizard", "Magic Archer",
             "Mega Minion", "Minion Horde", "Goblin Cage", "Tornado",
             "Barbarian Barrel", "Snowball", "Arrows", "Fireball",
             "Bomb Tower", "Inferno Tower", "Tesla", "Cannon",
             "Dark Prince", "Prince", "Wall Breakers", "Rascals",
             "Spear Goblins", "Goblins", "Skeleton Barrel", "Bats",
             "Fire Spirit", "Giant Snowball", "Heal Spirit",
             "Elixir Collector", "Barbarian Hut", "Goblin Hut",
             "Furnace", "Earthquake", "Freeze"]),
        (4, ["Musketeer", "Wizard", "Baby Dragon", "Hunter", "Mini P.E.K.K.A",
             "P.E.K.K.A", "Mega Knight", "Royal Giant", "Giant", "Goblin Giant",
             "Electro Giant", "Lava Hound", "Golem", "Rocket", "Lightning",
             "Fireball", "Poison", "Graveyard", "X-Bow", "Mortar",
             "Cannon Cart", "Dark Prince", "Prince", "Valkyrie",
             "Skeleton Army", "Guards", "Minion Horde",
             "Furnace", "Tombstone", "Goblin Cage", "Bomb Tower",
             "Inferno Tower", "Tesla", "Cannon", "Tornado",
             "Elixir Collector", "Barbarian Hut", "Goblin Hut",
             "Clone", "Mirror", "Rage"]),
        (5, ["Musketeer", "Wizard", "Executioner", "Baby Dragon", "Phoenix",
             "Prince", "Dark Prince", "Wall Breakers", "Royal Hogs",
             "Flying Machine", "Cannon Cart", "Lightning", "Poison",
             "Archer Queen", "Golden Knight", "Skeleton King",
             "Barbarian Hut", "Goblin Hut", "Furnace", "Elixir Collector",
             "Tombstone", "Bomb Tower"]),
        (6, ["Giant", "Golem", "P.E.K.K.A", "Mega Knight", "Royal Giant",
             "Electro Giant", "Lava Hound", "Goblin Giant", "Rocket",
             "Lightning", "Three Musketeers", "Elite Barbarians",
             "Royal Hogs", "Barbarian Hut", "Goblin Hut"]),
        (7, ["Golem", "P.E.K.K.A", "Mega Knight", "Royal Giant", "Electro Giant",
             "Lava Hound", "Three Musketeers", "Rocket"]),
        (8, ["Golem", "Elixir Golem"]),
    ]
    for elixir, names in data:
        for name in names:
            ELIXIR_MAP[name] = elixir


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
