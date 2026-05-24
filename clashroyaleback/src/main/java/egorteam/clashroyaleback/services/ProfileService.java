package egorteam.clashroyaleback.services;

import egorteam.clashroyaleback.dto.request.*;
import egorteam.clashroyaleback.dto.response.*;

import egorteam.clashroyaleback.exceptions.ApiException;
import egorteam.clashroyaleback.client.ClashRoyaleClient;
import egorteam.clashroyaleback.utils.JsonMapper;
import egorteam.clashroyaleback.entities.ProfileCacheEntity;
import egorteam.clashroyaleback.entities.RatingPointEntity;
import egorteam.clashroyaleback.entities.UserEntity;
import egorteam.clashroyaleback.entities.UserPreferenceEntity;
import egorteam.clashroyaleback.repositories.ProfileCachesRepository;
import egorteam.clashroyaleback.repositories.RatingPointsRepository;
import egorteam.clashroyaleback.repositories.UserPreferencesRepository;
import egorteam.clashroyaleback.repositories.UsersRepository;
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

    public ProfileResponse profile(Account account) {
        return new ProfileResponse(account.toUser(), cache(account.playerTag()), preferences(account.playerTag()));
    }

    public ProfileResponse link(Account account, String playerTag) {
        String normalized = clashRoyaleClient.normalizeTag(playerTag);
        if (!normalized.equals(account.playerTag())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Linked tag must match the registered account tag");
        }
        refresh(account.playerTag());
        return profile(account);
    }

    @Transactional
    public User update(Account account, UpdateProfileRequest request) {
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
    public ProfileCache refresh(String playerTag) {
        String normalized = clashRoyaleClient.normalizeTag(playerTag);
        Map<String, Object> player = clashRoyaleClient.getPlayer(normalized);
        List<Map<String, Object>> battles = clashRoyaleClient.getBattleLog(normalized);
        ProfileCache cache = toCache(player, battles);
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

    public PublicProfileResponse publicProfile(String playerTag) {
        String normalized = clashRoyaleClient.normalizeTag(playerTag);
        return users.findById(normalized)
                .map(user -> new PublicProfileResponse("registered_cached", normalized, user.username, user.registeredAt,
                        cache(normalized), ratingHistory(normalized).points()))
                .orElseGet(() -> {
                    ProfileCache external = refresh(normalized);
                    return new PublicProfileResponse("external_api", normalized, null, null, external, ratingHistory(normalized).points());
                });
    }

    public RatingHistoryResponse ratingHistory(String playerTag) {
        String normalized = clashRoyaleClient.normalizeTag(playerTag);
        List<RatingPoint> points = ratingPoints.findByPlayerTagOrderByChangedAtAsc(normalized).stream()
                .map(point -> new RatingPoint(point.rating, point.changedAt))
                .toList();
        return new RatingHistoryResponse(normalized, points);
    }

    public DashboardResponse dashboard(String playerTag) {
        ProfileCache cache = cache(playerTag);
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
        return new DashboardResponse(clashRoyaleClient.normalizeTag(playerTag), summary, charts);
    }

    public UserPreferences preferences(String playerTag) {
        String normalized = clashRoyaleClient.normalizeTag(playerTag);
        UserPreferenceEntity entity = preferences.findById(normalized)
                .orElseGet(() -> preferences.save(AuthService.emptyPreferencesEntity(normalized)));
        return toDto(entity);
    }

    @Transactional
    public UserPreferences updatePreferences(String playerTag, UpdateUserPreferencesRequest request) {
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

    private ProfileCache cache(String playerTag) {
        String normalized = clashRoyaleClient.normalizeTag(playerTag);
        return caches.findById(normalized)
                .map(this::toDto)
                .orElseGet(() -> new ProfileCache(null, null, null, null, null, Map.of(), Map.of(), Map.of(), Instant.now()));
    }

    @SuppressWarnings("unchecked")
    private ProfileCache toCache(Map<String, Object> player, List<Map<String, Object>> battles) {
        List<Map<String, Object>> currentDeckSource = player.get("currentDeck") instanceof List<?> list
                ? (List<Map<String, Object>>) list : List.of();
        DeckShort currentDeck = null;
        if (!currentDeckSource.isEmpty()) {
            currentDeck = new DeckShort(null, "Current Clash Royale deck", "CACHED_PROFILE", null, null,
                    currentDeckSource.stream().map(this::cardShortFromApi).toList());
        }
        Map<String, Object> battleStats = Map.of(
                "recentMatches", battles.stream().limit(10).toList(),
                "winRate", estimateWinRate(battles)
        );
        return new ProfileCache(string(player.get("name")), number(player.get("trophies")),
                number(player.get("bestTrophies")), number(player.get("expLevel")), currentDeck,
                Map.of(), player, battleStats, Instant.now());
    }

    private ProfileCache toDto(ProfileCacheEntity entity) {
        DeckShort currentDeck = entity.currentDeckJson == null ? null : json.read(entity.currentDeckJson, DeckShort.class);
        return new ProfileCache(entity.playerName, entity.trophies, entity.bestTrophies, entity.expLevel,
                currentDeck, json.readMap(entity.rewardsJson), json.readMap(entity.profileDataJson),
                json.readMap(entity.battleStatsJson), entity.updatedAt);
    }

    private ProfileCacheEntity toEntity(String playerTag, ProfileCache cache) {
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

    private UserPreferences toDto(UserPreferenceEntity entity) {
        return new UserPreferences(entity.playerTag, entity.preferredStrategy, entity.minElixir, entity.maxElixir,
                shortCards(json.readIntegerList(entity.preferredCardIdsJson)),
                shortCards(json.readIntegerList(entity.excludedCardIdsJson)), entity.updatedAt);
    }

    private User toUser(UserEntity user) {
        return new User(user.playerTag, user.username, user.email, user.registeredAt);
    }

    private CardShort cardShortFromApi(Map<String, Object> source) {
        Integer id = number(source.get("id"));
        String iconUrl = null;
        if (source.get("iconUrls") instanceof Map<?, ?> icons && icons.get("medium") != null) {
            iconUrl = String.valueOf(icons.get("medium"));
        }
        return new CardShort(id, id, string(source.get("name")), iconUrl);
    }

    private List<CardShort> shortCards(List<Integer> cardIds) {
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


