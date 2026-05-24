package egorteam.clashroyaleback.services;

import egorteam.clashroyaleback.dto.request.*;
import egorteam.clashroyaleback.dto.response.*;

import egorteam.clashroyaleback.exceptions.ApiException;
import egorteam.clashroyaleback.client.ClashRoyaleClient;
import egorteam.clashroyaleback.entities.AuthTokenEntity;
import egorteam.clashroyaleback.entities.UserEntity;
import egorteam.clashroyaleback.entities.UserPreferenceEntity;
import egorteam.clashroyaleback.repositories.AuthTokensRepository;
import egorteam.clashroyaleback.repositories.UserPreferencesRepository;
import egorteam.clashroyaleback.repositories.UsersRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {
    private final UsersRepository users;
    private final AuthTokensRepository tokens;
    private final UserPreferencesRepository preferences;
    private final ClashRoyaleClient clashRoyaleClient;

    public AuthService(UsersRepository users, AuthTokensRepository tokens, UserPreferencesRepository preferences,
                       ClashRoyaleClient clashRoyaleClient) {
        this.users = users;
        this.tokens = tokens;
        this.preferences = preferences;
        this.clashRoyaleClient = clashRoyaleClient;
    }

    @Transactional
    public AuthSuccessResponse register(RegisterRequest request) {
        String playerTag = clashRoyaleClient.normalizeTag(request.playerTag());
        if (users.existsByUsernameIgnoreCase(request.username()) || users.existsById(playerTag)) {
            throw new ApiException(HttpStatus.CONFLICT, "Username or player tag already exists");
        }
        UserEntity user = new UserEntity();
        user.playerTag = playerTag;
        user.username = request.username();
        user.email = request.email();
        user.password = request.password();
        user.registeredAt = Instant.now();
        users.save(user);
        preferences.save(emptyPreferencesEntity(playerTag));
        return issueTokens(toAccount(user));
    }

    @Transactional
    public AuthSuccessResponse login(LoginRequest request) {
        UserEntity user = users.findByUsernameIgnoreCase(request.username())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (!user.password.equals(request.password())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        return issueTokens(toAccount(user));
    }

    @Transactional
    public TokenPairResponse refresh(RefreshTokenRequest request) {
        AuthTokenEntity token = tokens.findById(request.refreshToken())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));
        UserEntity user = users.findById(token.playerTag)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));
        AuthSuccessResponse response = issueTokens(toAccount(user));
        return new TokenPairResponse(response.accessToken(), response.refreshToken());
    }

    public Account requireUser(String authorization) {
        String token = bearer(authorization);
        if (token == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Missing or invalid bearer token");
        }
        AuthTokenEntity authToken = tokens.findById(token)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Missing or invalid bearer token"));
        return users.findById(authToken.playerTag)
                .map(this::toAccount)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Missing or invalid bearer token"));
    }

    public Account optionalUser(String authorization) {
        String token = bearer(authorization);
        if (token == null) {
            return null;
        }
        return tokens.findById(token)
                .flatMap(authToken -> users.findById(authToken.playerTag))
                .map(this::toAccount)
                .orElse(null);
    }

    private String bearer(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return null;
        }
        return authorization.substring("Bearer ".length());
    }

    private AuthSuccessResponse issueTokens(Account account) {
        String access = token("access", account.playerTag());
        String refresh = token("refresh", account.playerTag());
        tokens.save(tokenEntity(access, "access", account.playerTag()));
        tokens.save(tokenEntity(refresh, "refresh", account.playerTag()));
        return new AuthSuccessResponse(access, refresh, account.toUser());
    }

    private AuthTokenEntity tokenEntity(String token, String type, String playerTag) {
        AuthTokenEntity entity = new AuthTokenEntity();
        entity.token = token;
        entity.tokenType = type;
        entity.playerTag = playerTag;
        return entity;
    }

    private String token(String type, String playerTag) {
        String raw = type + ":" + playerTag + ":" + UUID.randomUUID();
        return Base64.getUrlEncoder().withoutPadding().encodeToString(raw.getBytes());
    }

    private Account toAccount(UserEntity user) {
        return new Account(user.playerTag, user.username, user.email, user.password, user.registeredAt);
    }

    static UserPreferences emptyPreferences(String playerTag) {
        return new UserPreferences(playerTag, null, null, null, List.of(), List.of(), Instant.now());
    }

    static UserPreferenceEntity emptyPreferencesEntity(String playerTag) {
        UserPreferenceEntity entity = new UserPreferenceEntity();
        entity.playerTag = playerTag;
        entity.preferredCardIdsJson = "[]";
        entity.excludedCardIdsJson = "[]";
        entity.updatedAt = Instant.now();
        return entity;
    }
}


