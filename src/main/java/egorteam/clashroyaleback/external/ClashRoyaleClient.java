package egorteam.clashroyaleback.external;

import egorteam.clashroyaleback.api.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Component
public class ClashRoyaleClient {
    private final RestClient restClient;
    private final String token;

    public ClashRoyaleClient(@Value("${clashroyale.api.base-url}") String baseUrl,
                             @Value("${clashroyale.api.token}") String token) {
        this.token = token;
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getPlayer(String playerTag) {
        return get("/players/" + encodedTag(playerTag), Map.class);
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getBattleLog(String playerTag) {
        return get("/players/" + encodedTag(playerTag) + "/battlelog", List.class);
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getCards() {
        Map<String, Object> response = get("/cards", Map.class);
        Object items = response.get("items");
        if (items instanceof List<?> list) {
            return (List<Map<String, Object>>) list;
        }
        return List.of();
    }

    public String normalizeTag(String playerTag) {
        String trimmed = playerTag == null ? "" : playerTag.trim().toUpperCase();
        if (trimmed.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Player tag is required");
        }
        return trimmed.startsWith("#") ? trimmed : "#" + trimmed;
    }

    private String encodedTag(String playerTag) {
        return UriUtils.encodePathSegment(normalizeTag(playerTag), StandardCharsets.UTF_8);
    }

    private <T> T get(String uri, Class<T> bodyType) {
        if (token == null || token.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Set CLASH_ROYALE_API_TOKEN to call Clash Royale API");
        }
        return restClient.get()
                .uri(uri)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .onStatus(status -> status.value() == 404,
                        (request, response) -> {
                            throw new ApiException(HttpStatus.NOT_FOUND, "Resource not found in Clash Royale API");
                        })
                .onStatus(status -> status.isError(),
                        (request, response) -> {
                            throw new ApiException(HttpStatus.BAD_GATEWAY, "Clash Royale API request failed: " + response.getStatusCode());
                        })
                .body(bodyType);
    }
}
