package egorteam.clashroyaleback.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public final class Dtos {
    private Dtos() {
    }

    public record RegisterRequest(@NotBlank @Size(min = 3, max = 50) String username,
                                  @NotBlank @Email String email,
                                  @NotBlank @Size(min = 6) String password,
                                  @NotBlank String playerTag) {
    }

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {
    }

    public record RefreshTokenRequest(@NotBlank String refreshToken) {
    }

    public record LinkClashAccountRequest(@NotBlank String playerTag) {
    }

    public record UpdateProfileRequest(@Size(min = 3, max = 50) String username, @Email String email) {
    }

    public record UpdateUserPreferencesRequest(String preferredStrategy, Double minElixir, Double maxElixir,
                                               List<Integer> preferredCardIds, List<Integer> excludedCardIds) {
    }

    public record DeckCardInput(@NotNull Integer cardId, @Min(1) @Max(8) Integer slotNumber) {
    }

    public record CreateDeckRequest(@NotBlank @Size(max = 100) String name, String strategy,
                                    @NotNull @Size(min = 8, max = 8) List<@Valid DeckCardInput> cards) {
    }

    public record UpdateDeckRequest(@Size(max = 100) String name, String strategy,
                                    @Size(min = 8, max = 8) List<@Valid DeckCardInput> cards) {
    }

    public record GenerateDeckRequest(String strategy, List<Integer> favoriteCardIds, List<Integer> excludedCardIds,
                                      Double minElixir, Double maxElixir, Boolean saveResult) {
    }

    public record DeckSelection(@NotBlank String source, Long deckId,
                                @Size(min = 8, max = 8) List<@Valid DeckCardInput> cards) {
    }

    public record CompareDecksRequest(@Valid @NotNull DeckSelection leftDeck, @Valid @NotNull DeckSelection rightDeck) {
    }

    public record User(String playerTag, String username, String email, Instant registeredAt) {
    }

    public record TokenPairResponse(String accessToken, String refreshToken) {
    }

    public record AuthSuccessResponse(String accessToken, String refreshToken, User user) {
    }

    public record AsyncAcceptedResponse(String status, String message) {
    }

    public record CardShort(Integer id, Integer apiCardId, String name, String iconUrl) {
    }

    public record Card(Integer id, Integer apiCardId, String name, Integer elixir, String rarity, Integer arena,
                       String iconUrl, String description, Map<String, Object> dataJson, Instant updatedAt) {
    }

    public record CardsPageResponse(int page, int size, long totalElements, int totalPages, List<Card> items) {
    }

    public record UserPreferences(String playerTag, String preferredStrategy, Double minElixir, Double maxElixir,
                                  List<CardShort> preferredCards, List<CardShort> excludedCards, Instant updatedAt) {
    }

    public record DeckShort(Long id, String name, String deckType, String strategy, Double qualityScore,
                            List<CardShort> cards) {
    }

    public record DeckCardView(Integer slotNumber, CardShort card) {
    }

    public record DeckDetails(Long id, String ownerPlayerTag, String name, String deckType, String strategy,
                              String description, Double qualityScore, Instant createdAt, Instant updatedAt,
                              List<DeckCardView> cards, Map<String, Object> metrics) {
    }

    public record DeckListResponse(List<DeckShort> items) {
    }

    public record PublishDeckResponse(Long deckId, String publicToken, String publicUrl, Instant publishedAt) {
    }

    public record PublicDeckResponse(String token, Map<String, Object> owner, DeckDetails deck) {
    }

    public record ProfileCache(String playerName, Integer trophies, Integer bestTrophies, Integer expLevel,
                               DeckShort currentDeck, Map<String, Object> rewards, Map<String, Object> profileData,
                               Map<String, Object> battleStats, Instant updatedAt) {
    }

    public record ProfileResponse(User user, ProfileCache cache, UserPreferences preferences) {
    }

    public record RatingPoint(Integer rating, Instant changedAt) {
    }

    public record RatingHistoryResponse(String playerTag, List<RatingPoint> points) {
    }

    public record PublicProfileResponse(String source, String playerTag, String username, Instant registeredAt,
                                        ProfileCache cache, List<RatingPoint> ratingHistory) {
    }

    public record DashboardResponse(String playerTag, Map<String, Object> summary, Map<String, Object> charts) {
    }

    public record GeneratedDeckResponse(DeckDetails deck, String explanation, Map<String, Object> breakdown) {
    }

    public record OneVsOneResult(Long id, DeckShort leftDeck, DeckShort rightDeck, double leftScore,
                                 double rightScore, Map<String, Object> leftBreakdown,
                                 Map<String, Object> rightBreakdown, String winnerSide,
                                 String resultDescription, Instant createdAt) {
    }

    public record OneVsOneHistoryResponse(List<OneVsOneResult> items) {
    }
}
