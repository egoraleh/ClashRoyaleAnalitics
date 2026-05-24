package egorteam.clashroyaleback.services;

import egorteam.clashroyaleback.dto.request.*;
import egorteam.clashroyaleback.dto.response.*;

import egorteam.clashroyaleback.exceptions.ApiException;
import egorteam.clashroyaleback.utils.JsonMapper;
import egorteam.clashroyaleback.entities.DeckEntity;
import egorteam.clashroyaleback.entities.PublicDeckEntity;
import egorteam.clashroyaleback.repositories.DecksRepository;
import egorteam.clashroyaleback.repositories.PublicDecksRepository;
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

    public DeckListResponse list(String ownerPlayerTag, String deckType) {
        List<DeckEntity> found = deckType == null
                ? decks.findByOwnerPlayerTagOrderByCreatedAtDesc(ownerPlayerTag)
                : decks.findByOwnerPlayerTagAndDeckTypeIgnoreCaseOrderByCreatedAtDesc(ownerPlayerTag, deckType);
        return new DeckListResponse(found.stream().map(this::toDto).map(this::shortDeck).toList());
    }

    public DeckDetails getOwned(long deckId, String ownerPlayerTag) {
        DeckDetails deck = get(deckId);
        if (!deck.ownerPlayerTag().equals(ownerPlayerTag)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Deck not found");
        }
        return deck;
    }

    public DeckDetails get(long deckId) {
        return decks.findById(deckId)
                .map(this::toDto)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Deck not found"));
    }

    @Transactional
    public DeckDetails create(String ownerPlayerTag, CreateDeckRequest request, String deckType) {
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
    public DeckDetails update(long deckId, String ownerPlayerTag, UpdateDeckRequest request) {
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
    public DeckDetails applyAnalytics(long deckId, String ownerPlayerTag, Double qualityScore,
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
    public PublishDeckResponse publish(long deckId, String ownerPlayerTag) {
        getOwned(deckId, ownerPlayerTag);
        String token = UUID.randomUUID().toString();
        PublicDeckEntity entity = new PublicDeckEntity();
        entity.token = token;
        entity.deckId = deckId;
        entity.publicUrl = "/api/public/decks/" + token;
        entity.publishedAt = Instant.now();
        publicDecks.save(entity);
        return new PublishDeckResponse(entity.deckId, entity.token, entity.publicUrl, entity.publishedAt);
    }

    public PublicDeckResponse publicDeck(String token) {
        PublicDeckEntity published = publicDecks.findById(token)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Public deck not found"));
        DeckDetails deck = get(published.deckId);
        return new PublicDeckResponse(token, Map.of("playerTag", deck.ownerPlayerTag()), deck);
    }

    public DeckShort shortDeck(DeckDetails deck) {
        return new DeckShort(deck.id(), deck.name(), deck.deckType(), deck.strategy(), deck.qualityScore(),
                deck.cards().stream().map(DeckCardView::card).toList());
    }

    public DeckDetails createGenerated(String ownerPlayerTag, GenerateDeckRequest request) {
        List<Integer> excluded = request.excludedCardIds() == null ? List.of() : request.excludedCardIds();
        List<DeckCardInput> inputs = cardsService.list(null, null, null, null, null, 0, 100).items().stream()
                .filter(card -> !excluded.contains(card.id()))
                .filter(card -> request.minElixir() == null || card.elixir() == null || card.elixir() >= request.minElixir())
                .filter(card -> request.maxElixir() == null || card.elixir() == null || card.elixir() <= request.maxElixir())
                .limit(8)
                .map(card -> new DeckCardInput(card.id(), 1))
                .toList();
        List<DeckCardInput> slotted = java.util.stream.IntStream.range(0, inputs.size())
                .mapToObj(i -> new DeckCardInput(inputs.get(i).cardId(), i + 1))
                .toList();
        return create(ownerPlayerTag, new CreateDeckRequest("Generated deck", request.strategy(), slotted), "GENERATED");
    }

    DeckDetails createTransient(String ownerPlayerTag, CreateDeckRequest request, String deckType) {
        validateEightCards(request.cards());
        Instant now = Instant.now();
        return new DeckDetails(null, ownerPlayerTag, request.name(), deckType, request.strategy(), null,
                score(request.cards()), now, now, toViews(request.cards()), metrics(request.cards()));
    }

    private DeckDetails toDto(DeckEntity entity) {
        DeckCardView[] cardArray = json.read(entity.cardsJson, DeckCardView[].class);
        Map<String, Object> metrics = json.readMap(entity.metricsJson);
        return new DeckDetails(entity.id, entity.ownerPlayerTag, entity.name, entity.deckType, entity.strategy,
                entity.description, entity.qualityScore, entity.createdAt, entity.updatedAt, List.of(cardArray), metrics);
    }

    private void validateEightCards(List<DeckCardInput> cards) {
        if (cards == null || cards.size() != 8) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Deck must contain exactly 8 cards");
        }
    }

    private List<DeckCardView> toViews(List<DeckCardInput> inputs) {
        validateEightCards(inputs);
        return inputs.stream()
                .sorted(Comparator.comparing(DeckCardInput::slotNumber))
                .map(input -> new DeckCardView(input.slotNumber(), cardsService.shortCard(input.cardId())))
                .toList();
    }

    private double score(List<DeckCardInput> cards) {
        double averageElixir = averageElixir(cards);
        double distanceFromTarget = Math.abs(3.8 - averageElixir);
        return Math.max(0.0, Math.min(100.0, 100.0 - distanceFromTarget * 18.0));
    }

    private Map<String, Object> metrics(List<DeckCardInput> cards) {
        double averageElixir = averageElixir(cards);
        return Map.of("averageElixir", averageElixir, "cardsCount", cards.size());
    }

    private double averageElixir(List<DeckCardInput> cards) {
        return cards.stream()
                .map(input -> cardsService.get(input.cardId()).elixir())
                .filter(java.util.Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0);
    }
}


