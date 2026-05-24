package egorteam.clashroyaleback.service;

import egorteam.clashroyaleback.api.ApiException;
import egorteam.clashroyaleback.api.Dtos;
import egorteam.clashroyaleback.external.ClashRoyaleClient;
import egorteam.clashroyaleback.persistence.JsonMapper;
import egorteam.clashroyaleback.persistence.entity.ProfileCacheEntity;
import egorteam.clashroyaleback.persistence.entity.RatingPointEntity;
import egorteam.clashroyaleback.persistence.entity.UserEntity;
import egorteam.clashroyaleback.persistence.entity.UserPreferenceEntity;
import egorteam.clashroyaleback.persistence.repository.ProfileCachesRepository;
import egorteam.clashroyaleback.persistence.repository.RatingPointsRepository;
import egorteam.clashroyaleback.persistence.repository.UserPreferencesRepository;
import egorteam.clashroyaleback.persistence.repository.UsersRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
public class ProfileService {
    private final UsersRepository users;
    private final UserPreferencesRepository preferences;
    private final ProfileCachesRepository caches;
    private final RatingPointsRepository ratingPoints;
    private final ClashRoyaleClient clashRoyaleClient;
    private final CardsService cardsService;
    private final JsonMapper json;

    public ProfileService(UsersRepository users, UserPreferencesRepository preferences, ProfileCachesRepository caches,
                          RatingPointsRepository ratingPoints, ClashRoyaleClient clashRoyaleClient,
                          CardsService cardsService, JsonMapper json) {
        this.users = users;
        this.preferences = preferences;
        this.caches = caches;
        this.ratingPoints = ratingPoints;
        this.clashRoyaleClient = clashRoyaleClient;
        this.cardsService = cardsService;
        this.json = json;
    }

    public Dtos.ProfileResponse profile(Account account) {
        return new Dtos.ProfileResponse(account.toUser(), cache(account.playerTag()), preferences(account.playerTag()));
    }

    public Dtos.ProfileResponse link(Account account, String playerTag) {
        String normalized = clashRoyaleClient.normalizeTag(playerTag);
        if (!normalized.equals(account.playerTag())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Linked tag must match the registered account tag");
        }
        refresh(account.playerTag());
        return profile(account);
    }

    @Transactional
    public Dtos.User update(Account account, Dtos.UpdateProfileRequest request) {
        UserEntity user = users.findById(account.playerTag())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        if (request.username() != null) {
            user.username = request.username();
        }
        if (request.email() != null) {
            user.email = request.email();
        }
        return toUser(users.save(user));
    }

    @Transactional
    public Dtos.ProfileCache refresh(String playerTag) {
        String normalized = clashRoyaleClient.normalizeTag(playerTag);
        Map<String, Object> player = clashRoyaleClient.getPlayer(normalized);
        List<Map<String, Object>> battles = clashRoyaleClient.getBattleLog(normalized);
        Dtos.ProfileCache cache = toCache(player, battles);
        caches.save(toEntity(normalized, cache));
        if (cache.trophies() != null) {
            RatingPointEntity point = new RatingPointEntity();
            point.playerTag = normalized;
            point.rating = cache.trophies();
            point.changedAt = Instant.now();
            ratingPoints.save(point);
        }
        return cache;
    }

    public Dtos.PublicProfileResponse publicProfile(String playerTag) {
        String normalized = clashRoyaleClient.normalizeTag(playerTag);
        return users.findById(normalized)
                .map(user -> new Dtos.PublicProfileResponse("registered_cached", normalized, user.username, user.registeredAt,
                        cache(normalized), ratingHistory(normalized).points()))
                .orElseGet(() -> {
                    Dtos.ProfileCache external = refresh(normalized);
                    return new Dtos.PublicProfileResponse("external_api", normalized, null, null, external, ratingHistory(normalized).points());
                });
    }

    public Dtos.RatingHistoryResponse ratingHistory(String playerTag) {
        String normalized = clashRoyaleClient.normalizeTag(playerTag);
        List<Dtos.RatingPoint> points = ratingPoints.findByPlayerTagOrderByChangedAtAsc(normalized).stream()
                .map(point -> new Dtos.RatingPoint(point.rating, point.changedAt))
                .toList();
        return new Dtos.RatingHistoryResponse(normalized, points);
    }

    public Dtos.DashboardResponse dashboard(String playerTag) {
        Dtos.ProfileCache cache = cache(playerTag);
        Map<String, Object> summary = Map.of(
                "trophies", valueOrZero(cache.trophies()),
                "rating", valueOrZero(cache.trophies()),
                "winRate", cache.battleStats().getOrDefault("winRate", 0.0),
                "averageDeckElixir", cache.currentDeck() == null ? 0.0 : cache.currentDeck().qualityScore()
        );
        Map<String, Object> charts = Map.of(
                "ratingHistory", ratingHistory(playerTag).points(),
                "cardUsage", List.of(),
                "recentMatches", cache.battleStats().getOrDefault("recentMatches", List.of())
        );
        return new Dtos.DashboardResponse(clashRoyaleClient.normalizeTag(playerTag), summary, charts);
    }

    public Dtos.UserPreferences preferences(String playerTag) {
        String normalized = clashRoyaleClient.normalizeTag(playerTag);
        UserPreferenceEntity entity = preferences.findById(normalized)
                .orElseGet(() -> preferences.save(AuthService.emptyPreferencesEntity(normalized)));
        return toDto(entity);
    }

    @Transactional
    public Dtos.UserPreferences updatePreferences(String playerTag, Dtos.UpdateUserPreferencesRequest request) {
        String normalized = clashRoyaleClient.normalizeTag(playerTag);
        UserPreferenceEntity entity = preferences.findById(normalized)
                .orElseGet(() -> AuthService.emptyPreferencesEntity(normalized));
        entity.preferredStrategy = request.preferredStrategy();
        entity.minElixir = request.minElixir();
        entity.maxElixir = request.maxElixir();
        entity.preferredCardIdsJson = json.write(request.preferredCardIds() == null ? List.of() : request.preferredCardIds());
        entity.excludedCardIdsJson = json.write(request.excludedCardIds() == null ? List.of() : request.excludedCardIds());
        entity.updatedAt = Instant.now();
        return toDto(preferences.save(entity));
    }

    private Dtos.ProfileCache cache(String playerTag) {
        String normalized = clashRoyaleClient.normalizeTag(playerTag);
        return caches.findById(normalized)
                .map(this::toDto)
                .orElseGet(() -> new Dtos.ProfileCache(null, null, null, null, null, Map.of(), Map.of(), Map.of(), Instant.now()));
    }

    @SuppressWarnings("unchecked")
    private Dtos.ProfileCache toCache(Map<String, Object> player, List<Map<String, Object>> battles) {
        List<Map<String, Object>> currentDeckSource = player.get("currentDeck") instanceof List<?> list
                ? (List<Map<String, Object>>) list : List.of();
        Dtos.DeckShort currentDeck = null;
        if (!currentDeckSource.isEmpty()) {
            currentDeck = new Dtos.DeckShort(null, "Current Clash Royale deck", "CACHED_PROFILE", null, null,
                    currentDeckSource.stream().map(this::cardShortFromApi).toList());
        }
        long recentWins = battles.stream().filter(this::isWin).count();
        Object totalBattles = player.getOrDefault("battleCount", 0);
        Object totalWins = player.getOrDefault("wins", 0);
        Object totalLosses = player.getOrDefault("losses", 0);
        Map<String, Object> battleStats = Map.of(
                "recentMatches", battles.stream().limit(10).toList(),
                "recentGames", battles.size(),
                "recentWins", recentWins,
                "totalBattles", totalBattles instanceof Number n ? n.intValue() : 0,
                "totalWins", totalWins instanceof Number n ? n.intValue() : 0,
                "totalLosses", totalLosses instanceof Number n ? n.intValue() : 0,
                "winRate", battles.isEmpty() ? 0.0 : recentWins * 100.0 / battles.size()
        );
        return new Dtos.ProfileCache(string(player.get("name")), number(player.get("trophies")),
                number(player.get("bestTrophies")), number(player.get("expLevel")), currentDeck,
                Map.of(), player, battleStats, Instant.now());
    }

    private Dtos.ProfileCache toDto(ProfileCacheEntity entity) {
        Dtos.DeckShort currentDeck = entity.currentDeckJson == null ? null : json.read(entity.currentDeckJson, Dtos.DeckShort.class);
        return new Dtos.ProfileCache(entity.playerName, entity.trophies, entity.bestTrophies, entity.expLevel,
                currentDeck, json.readMap(entity.rewardsJson), json.readMap(entity.profileDataJson),
                json.readMap(entity.battleStatsJson), entity.updatedAt);
    }

    private ProfileCacheEntity toEntity(String playerTag, Dtos.ProfileCache cache) {
        ProfileCacheEntity entity = new ProfileCacheEntity();
        entity.playerTag = playerTag;
        entity.playerName = cache.playerName();
        entity.trophies = cache.trophies();
        entity.bestTrophies = cache.bestTrophies();
        entity.expLevel = cache.expLevel();
        entity.currentDeckJson = cache.currentDeck() == null ? null : json.write(cache.currentDeck());
        entity.rewardsJson = json.write(cache.rewards() == null ? Map.of() : cache.rewards());
        entity.profileDataJson = json.write(cache.profileData() == null ? Map.of() : cache.profileData());
        entity.battleStatsJson = json.write(cache.battleStats() == null ? Map.of() : cache.battleStats());
        entity.updatedAt = cache.updatedAt();
        return entity;
    }

    private Dtos.UserPreferences toDto(UserPreferenceEntity entity) {
        return new Dtos.UserPreferences(entity.playerTag, entity.preferredStrategy, entity.minElixir, entity.maxElixir,
                shortCards(json.readIntegerList(entity.preferredCardIdsJson)),
                shortCards(json.readIntegerList(entity.excludedCardIdsJson)), entity.updatedAt);
    }

    private Dtos.User toUser(UserEntity user) {
        return new Dtos.User(user.playerTag, user.username, user.email, user.registeredAt);
    }

    private Dtos.CardShort cardShortFromApi(Map<String, Object> source) {
        Integer id = number(source.get("id"));
        String iconUrl = null;
        if (source.get("iconUrls") instanceof Map<?, ?> icons && icons.get("medium") != null) {
            iconUrl = String.valueOf(icons.get("medium"));
        }
        return new Dtos.CardShort(id, id, string(source.get("name")), iconUrl);
    }

    private List<Dtos.CardShort> shortCards(List<Integer> cardIds) {
        return cardIds.stream().map(cardsService::shortCard).toList();
    }

    private double estimateWinRate(List<Map<String, Object>> battles) {
        if (battles.isEmpty()) {
            return 0.0;
        }
        long wins = battles.stream().filter(this::isWin).count();
        return wins * 100.0 / battles.size();
    }

    @SuppressWarnings("unchecked")
    private boolean isWin(Map<String, Object> battle) {
        List<Map<String, Object>> team = battle.get("team") instanceof List<?> list ? (List<Map<String, Object>>) list : List.of();
        List<Map<String, Object>> opponent = battle.get("opponent") instanceof List<?> list ? (List<Map<String, Object>>) list : List.of();
        int teamCrowns = team.stream().map(item -> number(item.get("crowns"))).filter(java.util.Objects::nonNull).max(Comparator.naturalOrder()).orElse(0);
        int opponentCrowns = opponent.stream().map(item -> number(item.get("crowns"))).filter(java.util.Objects::nonNull).max(Comparator.naturalOrder()).orElse(0);
        return teamCrowns > opponentCrowns;
    }

    private int valueOrZero(Integer value) {
        return value == null ? 0 : value;
    }

    private Integer number(Object value) {
        return value instanceof Number number ? number.intValue() : null;
    }

    private String string(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
