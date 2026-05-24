package egorteam.clashroyaleback.services;

import egorteam.clashroyaleback.dto.request.*;
import egorteam.clashroyaleback.dto.response.*;

import egorteam.clashroyaleback.exceptions.ApiException;
import egorteam.clashroyaleback.client.AiAnalyticsClient;
import egorteam.clashroyaleback.utils.JsonMapper;
import egorteam.clashroyaleback.entities.ComparisonEntity;
import egorteam.clashroyaleback.repositories.ComparisonsRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {
    private final ComparisonsRepository comparisons;
    private final DeckService deckService;
    private final CardsService cardsService;
    private final AiAnalyticsClient aiAnalyticsClient;
    private final JsonMapper json;

    public AnalyticsService(ComparisonsRepository comparisons, DeckService deckService, CardsService cardsService,
                            AiAnalyticsClient aiAnalyticsClient, JsonMapper json) {
        this.comparisons = comparisons;
        this.deckService = deckService;
        this.cardsService = cardsService;
        this.aiAnalyticsClient = aiAnalyticsClient;
        this.json = json;
    }

    public GeneratedDeckResponse generateDeck(String playerTag, GenerateDeckRequest request) {
        List<Card> availableCards = cardsService.list(null, null, null, null, null, 0, 100).items();
        AiAnalyticsClient.AiGeneratedDeckResponse aiResponse = aiAnalyticsClient.generateDeck(
                new AiAnalyticsClient.AiGenerateDeckRequest(playerTag, request, availableCards));
        List<DeckCardInput> cards = toDeckInputs(aiResponse.cardIds());
        String strategy = aiResponse.strategy() == null ? request.strategy() : aiResponse.strategy();
        String name = aiResponse.name() == null || aiResponse.name().isBlank() ? "Generated deck" : aiResponse.name();
        CreateDeckRequest createRequest = new CreateDeckRequest(name, strategy, cards);
        DeckDetails deck = Boolean.FALSE.equals(request.saveResult())
                ? deckService.createTransient(playerTag, createRequest, "GENERATED")
                : deckService.create(playerTag, createRequest, "GENERATED");
        DeckDetails enrichedDeck = persistOrEnrichGeneratedDeck(deck, playerTag, aiResponse, Boolean.FALSE.equals(request.saveResult()));
        return new GeneratedDeckResponse(enrichedDeck,
                aiResponse.explanation() == null ? "" : aiResponse.explanation(),
                aiResponse.breakdown() == null ? Map.of() : aiResponse.breakdown());
    }

    @Transactional
    public OneVsOneResult compare(String playerTag, CompareDecksRequest request) {
        DeckShort left = resolve(playerTag, request.leftDeck());
        DeckShort right = resolve(playerTag, request.rightDeck());
        AiAnalyticsClient.AiCompareResponse aiResponse = aiAnalyticsClient.compare(
                new AiAnalyticsClient.AiCompareRequest(playerTag, left, right, request));
        double leftScore = aiResponse.leftScore() == null ? 0.0 : aiResponse.leftScore();
        double rightScore = aiResponse.rightScore() == null ? 0.0 : aiResponse.rightScore();
        String winner = normalizeWinner(aiResponse.winnerSide(), leftScore, rightScore);
        Map<String, Object> leftBreakdown = aiResponse.leftBreakdown() == null ? Map.of() : aiResponse.leftBreakdown();
        Map<String, Object> rightBreakdown = aiResponse.rightBreakdown() == null ? Map.of() : aiResponse.rightBreakdown();
        String description = aiResponse.resultDescription() == null ? "" : aiResponse.resultDescription();
        if (playerTag == null) {
            return new OneVsOneResult(null, left, right, leftScore, rightScore, leftBreakdown, rightBreakdown, winner,
                    description, null);
        }
        ComparisonEntity entity = new ComparisonEntity();
        entity.playerTag = playerTag;
        entity.leftDeckJson = json.write(left);
        entity.rightDeckJson = json.write(right);
        entity.leftScore = leftScore;
        entity.rightScore = rightScore;
        entity.leftBreakdownJson = json.write(leftBreakdown);
        entity.rightBreakdownJson = json.write(rightBreakdown);
        entity.winnerSide = winner;
        entity.resultDescription = description;
        entity.createdAt = Instant.now();
        return toDto(comparisons.save(entity));
    }

    public OneVsOneHistoryResponse history(String playerTag) {
        return new OneVsOneHistoryResponse(comparisons.findByPlayerTagOrderByCreatedAtDesc(playerTag).stream()
                .map(this::toDto)
                .toList());
    }

    private OneVsOneResult toDto(ComparisonEntity entity) {
        return new OneVsOneResult(entity.id, json.read(entity.leftDeckJson, DeckShort.class),
                json.read(entity.rightDeckJson, DeckShort.class), entity.leftScore, entity.rightScore,
                json.readMap(entity.leftBreakdownJson), json.readMap(entity.rightBreakdownJson), entity.winnerSide,
                entity.resultDescription, entity.createdAt);
    }

    private DeckShort resolve(String playerTag, DeckSelection selection) {
        if ("SAVED".equalsIgnoreCase(selection.source())) {
            if (selection.deckId() == null) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "deckId is required for SAVED deck selection");
            }
            DeckDetails deck = playerTag == null ? deckService.get(selection.deckId()) : deckService.getOwned(selection.deckId(), playerTag);
            return deckService.shortDeck(deck);
        }
        if ("MANUAL".equalsIgnoreCase(selection.source())) {
            DeckDetails temporary = deckService.createTransient("__comparison__", new CreateDeckRequest("Manual deck", null, selection.cards()), "USER");
            return deckService.shortDeck(temporary);
        }
        throw new ApiException(HttpStatus.BAD_REQUEST, "Unknown deck source");
    }

    private List<DeckCardInput> toDeckInputs(List<Integer> cardIds) {
        if (cardIds == null || cardIds.size() != 8) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "AI analytics service must return exactly 8 cardIds");
        }
        return java.util.stream.IntStream.range(0, cardIds.size())
                .mapToObj(index -> new DeckCardInput(cardIds.get(index), index + 1))
                .toList();
    }

    private DeckDetails persistOrEnrichGeneratedDeck(DeckDetails deck, String playerTag,
                                                          AiAnalyticsClient.AiGeneratedDeckResponse aiResponse,
                                                          boolean transientOnly) {
        Map<String, Object> metrics = aiResponse.breakdown() == null ? deck.metrics() : aiResponse.breakdown();
        if (!transientOnly && deck.id() != null) {
            return deckService.applyAnalytics(deck.id(), playerTag, aiResponse.qualityScore(), aiResponse.description(), metrics);
        }
        Double qualityScore = aiResponse.qualityScore() == null ? deck.qualityScore() : aiResponse.qualityScore();
        String description = aiResponse.description() == null ? deck.description() : aiResponse.description();
        return new DeckDetails(deck.id(), deck.ownerPlayerTag(), deck.name(), deck.deckType(), deck.strategy(),
                description, qualityScore, deck.createdAt(), deck.updatedAt(), deck.cards(), metrics);
    }

    private String normalizeWinner(String winnerSide, double leftScore, double rightScore) {
        if (winnerSide != null && List.of("LEFT", "RIGHT", "DRAW").contains(winnerSide.toUpperCase())) {
            return winnerSide.toUpperCase();
        }
        if (Math.abs(leftScore - rightScore) < 0.0001) {
            return "DRAW";
        }
        return leftScore > rightScore ? "LEFT" : "RIGHT";
    }
}


