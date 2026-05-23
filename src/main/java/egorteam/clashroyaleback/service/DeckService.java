package egorteam.clashroyaleback.service;

import egorteam.clashroyaleback.api.ApiException;
import egorteam.clashroyaleback.api.Dtos;
import egorteam.clashroyaleback.persistence.JsonMapper;
import egorteam.clashroyaleback.persistence.entity.DeckEntity;
import egorteam.clashroyaleback.persistence.entity.PublicDeckEntity;
import egorteam.clashroyaleback.persistence.repository.DecksRepository;
import egorteam.clashroyaleback.persistence.repository.PublicDecksRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class DeckService {
    private final DecksRepository decks;
    private final PublicDecksRepository publicDecks;
    private final CardsService cardsService;
    private final JsonMapper json;

    public DeckService(DecksRepository decks, PublicDecksRepository publicDecks, CardsService cardsService, JsonMapper json) {
        this.decks = decks;
        this.publicDecks = publicDecks;
        this.cardsService = cardsService;
        this.json = json;
    }

    public Dtos.DeckListResponse list(String ownerPlayerTag, String deckType) {
        List<DeckEntity> found = deckType == null
                ? decks.findByOwnerPlayerTagOrderByCreatedAtDesc(ownerPlayerTag)
                : decks.findByOwnerPlayerTagAndDeckTypeIgnoreCaseOrderByCreatedAtDesc(ownerPlayerTag, deckType);
        return new Dtos.DeckListResponse(found.stream().map(this::toDto).map(this::shortDeck).toList());
    }

    public Dtos.DeckDetails getOwned(long deckId, String ownerPlayerTag) {
        Dtos.DeckDetails deck = get(deckId);
        if (!deck.ownerPlayerTag().equals(ownerPlayerTag)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Deck not found");
        }
        return deck;
    }

    public Dtos.DeckDetails get(long deckId) {
        return decks.findById(deckId)
                .map(this::toDto)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Deck not found"));
    }

    @Transactional
    public Dtos.DeckDetails create(String ownerPlayerTag, Dtos.CreateDeckRequest request, String deckType) {
        validateEightCards(request.cards());
        Instant now = Instant.now();
        DeckEntity entity = new DeckEntity();
        entity.ownerPlayerTag = ownerPlayerTag;
        entity.name = request.name();
        entity.deckType = deckType;
        entity.strategy = request.strategy();
        entity.qualityScore = score(request.cards());
        entity.createdAt = now;
        entity.updatedAt = now;
        entity.cardsJson = json.write(toViews(request.cards()));
        entity.metricsJson = json.write(metrics(request.cards()));
        return toDto(decks.save(entity));
    }

    @Transactional
    public Dtos.DeckDetails update(long deckId, String ownerPlayerTag, Dtos.UpdateDeckRequest request) {
        DeckEntity entity = decks.findById(deckId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Deck not found"));
        if (!entity.ownerPlayerTag.equals(ownerPlayerTag)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Deck not found");
        }
        if (request.name() != null) {
            entity.name = request.name();
        }
        if (request.strategy() != null) {
            entity.strategy = request.strategy();
        }
        if (request.cards() != null) {
            entity.cardsJson = json.write(toViews(request.cards()));
            entity.metricsJson = json.write(metrics(request.cards()));
            entity.qualityScore = score(request.cards());
        }
        entity.updatedAt = Instant.now();
        return toDto(decks.save(entity));
    }

    @Transactional
    public void delete(long deckId, String ownerPlayerTag) {
        getOwned(deckId, ownerPlayerTag);
        decks.deleteById(deckId);
    }

    @Transactional
    public Dtos.DeckDetails applyAnalytics(long deckId, String ownerPlayerTag, Double qualityScore,
                                           String description, Map<String, Object> metrics) {
        DeckEntity entity = decks.findById(deckId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Deck not found"));
        if (!entity.ownerPlayerTag.equals(ownerPlayerTag)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Deck not found");
        }
        if (qualityScore != null) {
            entity.qualityScore = qualityScore;
        }
        if (description != null) {
            entity.description = description;
        }
        if (metrics != null) {
            entity.metricsJson = json.write(metrics);
        }
        entity.updatedAt = Instant.now();
        return toDto(decks.save(entity));
    }

    @Transactional
    public Dtos.PublishDeckResponse publish(long deckId, String ownerPlayerTag) {
        getOwned(deckId, ownerPlayerTag);
        String token = UUID.randomUUID().toString();
        PublicDeckEntity entity = new PublicDeckEntity();
        entity.token = token;
        entity.deckId = deckId;
        entity.publicUrl = "/api/public/decks/" + token;
        entity.publishedAt = Instant.now();
        publicDecks.save(entity);
        return new Dtos.PublishDeckResponse(entity.deckId, entity.token, entity.publicUrl, entity.publishedAt);
    }

    public Dtos.PublicDeckResponse publicDeck(String token) {
        PublicDeckEntity published = publicDecks.findById(token)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Public deck not found"));
        Dtos.DeckDetails deck = get(published.deckId);
        return new Dtos.PublicDeckResponse(token, Map.of("playerTag", deck.ownerPlayerTag()), deck);
    }

    public Dtos.DeckShort shortDeck(Dtos.DeckDetails deck) {
        return new Dtos.DeckShort(deck.id(), deck.name(), deck.deckType(), deck.strategy(), deck.qualityScore(),
                deck.cards().stream().map(Dtos.DeckCardView::card).toList());
    }

    public Dtos.DeckDetails createGenerated(String ownerPlayerTag, Dtos.GenerateDeckRequest request) {
        List<Integer> excluded = request.excludedCardIds() == null ? List.of() : request.excludedCardIds();
        List<Dtos.DeckCardInput> inputs = cardsService.list(null, null, null, null, null, 0, 100).items().stream()
                .filter(card -> !excluded.contains(card.id()))
                .filter(card -> request.minElixir() == null || card.elixir() == null || card.elixir() >= request.minElixir())
                .filter(card -> request.maxElixir() == null || card.elixir() == null || card.elixir() <= request.maxElixir())
                .limit(8)
                .map(card -> new Dtos.DeckCardInput(card.id(), 1))
                .toList();
        List<Dtos.DeckCardInput> slotted = java.util.stream.IntStream.range(0, inputs.size())
                .mapToObj(i -> new Dtos.DeckCardInput(inputs.get(i).cardId(), i + 1))
                .toList();
        return create(ownerPlayerTag, new Dtos.CreateDeckRequest("Generated deck", request.strategy(), slotted), "GENERATED");
    }

    Dtos.DeckDetails createTransient(String ownerPlayerTag, Dtos.CreateDeckRequest request, String deckType) {
        validateEightCards(request.cards());
        Instant now = Instant.now();
        return new Dtos.DeckDetails(null, ownerPlayerTag, request.name(), deckType, request.strategy(), null,
                score(request.cards()), now, now, toViews(request.cards()), metrics(request.cards()));
    }

    private Dtos.DeckDetails toDto(DeckEntity entity) {
        Dtos.DeckCardView[] cardArray = json.read(entity.cardsJson, Dtos.DeckCardView[].class);
        Map<String, Object> metrics = json.readMap(entity.metricsJson);
        return new Dtos.DeckDetails(entity.id, entity.ownerPlayerTag, entity.name, entity.deckType, entity.strategy,
                entity.description, entity.qualityScore, entity.createdAt, entity.updatedAt, List.of(cardArray), metrics);
    }

    private void validateEightCards(List<Dtos.DeckCardInput> cards) {
        if (cards == null || cards.size() != 8) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Deck must contain exactly 8 cards");
        }
    }

    private List<Dtos.DeckCardView> toViews(List<Dtos.DeckCardInput> inputs) {
        validateEightCards(inputs);
        return inputs.stream()
                .sorted(Comparator.comparing(Dtos.DeckCardInput::slotNumber))
                .map(input -> new Dtos.DeckCardView(input.slotNumber(), cardsService.shortCard(input.cardId())))
                .toList();
    }

    private double score(List<Dtos.DeckCardInput> cards) {
        double averageElixir = averageElixir(cards);
        double distanceFromTarget = Math.abs(3.8 - averageElixir);
        return Math.max(0.0, Math.min(100.0, 100.0 - distanceFromTarget * 18.0));
    }

    private Map<String, Object> metrics(List<Dtos.DeckCardInput> cards) {
        double averageElixir = averageElixir(cards);
        return Map.of("averageElixir", averageElixir, "cardsCount", cards.size());
    }

    private double averageElixir(List<Dtos.DeckCardInput> cards) {
        return cards.stream()
                .map(input -> cardsService.get(input.cardId()).elixir())
                .filter(java.util.Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0);
    }
}
