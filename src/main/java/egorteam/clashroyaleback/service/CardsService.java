package egorteam.clashroyaleback.service;

import egorteam.clashroyaleback.api.ApiException;
import egorteam.clashroyaleback.api.Dtos;
import egorteam.clashroyaleback.external.ClashRoyaleClient;
import egorteam.clashroyaleback.persistence.JsonMapper;
import egorteam.clashroyaleback.persistence.entity.CardEntity;
import egorteam.clashroyaleback.persistence.repository.CardsRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class CardsService {
    private final CardsRepository cards;
    private final ClashRoyaleClient clashRoyaleClient;
    private final JsonMapper json;

    public CardsService(CardsRepository cards, ClashRoyaleClient clashRoyaleClient, JsonMapper json) {
        this.cards = cards;
        this.clashRoyaleClient = clashRoyaleClient;
        this.json = json;
    }

    @Transactional
    public void refreshFromApi() {
        for (Map<String, Object> source : clashRoyaleClient.getCards()) {
            cards.save(toEntity(toCard(source)));
        }
    }

    @Transactional
    public Dtos.CardsPageResponse list(String rarity, Integer elixirMin, Integer elixirMax, Integer arena,
                                       String search, int page, int size) {
        seedFallbackCardsIfEmpty();
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(1, Math.min(size, 100));
        List<Dtos.Card> filtered = cards.findAll().stream()
                .map(this::toDto)
                .filter(card -> rarity == null || rarity.equalsIgnoreCase(card.rarity()))
                .filter(card -> elixirMin == null || (card.elixir() != null && card.elixir() >= elixirMin))
                .filter(card -> elixirMax == null || (card.elixir() != null && card.elixir() <= elixirMax))
                .filter(card -> arena == null || Objects.equals(arena, card.arena()))
                .filter(card -> search == null || card.name().toLowerCase().contains(search.toLowerCase()))
                .sorted(Comparator.comparing(Dtos.Card::name))
                .toList();
        int from = Math.min(filtered.size(), safePage * safeSize);
        int to = Math.min(filtered.size(), from + safeSize);
        int totalPages = (int) Math.ceil(filtered.size() / (double) safeSize);
        return new Dtos.CardsPageResponse(safePage, safeSize, filtered.size(), totalPages, filtered.subList(from, to));
    }

    @Transactional
    public Dtos.Card get(int cardId) {
        seedFallbackCardsIfEmpty();
        return cards.findById(cardId)
                .map(this::toDto)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Card not found"));
    }

    public Dtos.CardShort shortCard(Integer cardId) {
        Dtos.Card card = get(cardId);
        return new Dtos.CardShort(card.id(), card.apiCardId(), card.name(), card.iconUrl());
    }

    private Dtos.Card toCard(Map<String, Object> source) {
        Integer apiId = number(source.get("id"));
        String name = String.valueOf(source.getOrDefault("name", "Unknown"));
        Integer elixir = number(source.get("elixirCost"));
        Integer id = apiId == null ? Math.abs(name.hashCode()) : apiId;
        String iconUrl = null;
        if (source.get("iconUrls") instanceof Map<?, ?> icons && icons.get("medium") != null) {
            iconUrl = String.valueOf(icons.get("medium"));
        }
        return new Dtos.Card(id, apiId, name, elixir, string(source.get("rarity")), null, iconUrl, null, source, Instant.now());
    }

    private Dtos.Card toDto(CardEntity entity) {
        return new Dtos.Card(entity.id, entity.apiCardId, entity.name, entity.elixir, entity.rarity, entity.arena,
                entity.iconUrl, entity.description, json.readMap(entity.dataJson), entity.updatedAt);
    }

    private CardEntity toEntity(Dtos.Card card) {
        CardEntity entity = new CardEntity();
        entity.id = card.id();
        entity.apiCardId = card.apiCardId();
        entity.name = card.name();
        entity.elixir = card.elixir();
        entity.rarity = card.rarity();
        entity.arena = card.arena();
        entity.iconUrl = card.iconUrl();
        entity.description = card.description();
        entity.dataJson = json.write(card.dataJson() == null ? Map.of() : card.dataJson());
        entity.updatedAt = card.updatedAt() == null ? Instant.now() : card.updatedAt();
        return entity;
    }

    private Integer number(Object value) {
        return value instanceof Number number ? number.intValue() : null;
    }

    private String string(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private void seedFallbackCardsIfEmpty() {
        if (cards.count() > 0) {
            return;
        }
        addSeed(26000000, "Knight", 3, "Common");
        addSeed(26000001, "Archers", 3, "Common");
        addSeed(26000002, "Goblins", 2, "Common");
        addSeed(26000003, "Giant", 5, "Rare");
        addSeed(26000004, "P.E.K.K.A", 7, "Epic");
        addSeed(26000005, "Minions", 3, "Common");
        addSeed(26000006, "Balloon", 5, "Epic");
        addSeed(26000007, "Witch", 5, "Epic");
        addSeed(26000008, "Barbarians", 5, "Common");
        addSeed(26000009, "Golem", 8, "Epic");
        addSeed(26000010, "Skeletons", 1, "Common");
        addSeed(26000011, "Valkyrie", 4, "Rare");
    }

    private void addSeed(int id, String name, int elixir, String rarity) {
        if (cards.existsById(id)) {
            return;
        }
        cards.save(toEntity(new Dtos.Card(id, id, name, elixir, rarity, null, null, null, Map.of(), Instant.now())));
    }
}
