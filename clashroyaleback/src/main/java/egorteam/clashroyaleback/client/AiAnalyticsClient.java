package egorteam.clashroyaleback.client;

import egorteam.clashroyaleback.dto.request.*;
import egorteam.clashroyaleback.dto.response.*;

import egorteam.clashroyaleback.exceptions.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Component
public class AiAnalyticsClient {
    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final String generateDeckPath;
    private final String comparePath;

    public AiAnalyticsClient(RestTemplate restTemplate,
                             @Value("${ai.analytics.base-url:}") String baseUrl,
                             @Value("${ai.analytics.generate-deck-path:/generate-deck}") String generateDeckPath,
                             @Value("${ai.analytics.compare-path:/compare}") String comparePath) {
        this.restTemplate = restTemplate;
        this.baseUrl = trimTrailingSlash(baseUrl);
        this.generateDeckPath = normalizePath(generateDeckPath);
        this.comparePath = normalizePath(comparePath);
    }

    public AiGeneratedDeckResponse generateDeck(AiGenerateDeckRequest request) {
        return post(generateDeckPath, request, AiGeneratedDeckResponse.class);
    }

    public AiCompareResponse compare(AiCompareRequest request) {
        return post(comparePath, request, AiCompareResponse.class);
    }

    private <T> T post(String path, Object request, Class<T> responseType) {
        if (baseUrl == null || baseUrl.isBlank()) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "AI analytics service URL is not configured");
        }
        try {
            T response = restTemplate.postForObject(baseUrl + path, request, responseType);
            if (response == null) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "AI analytics service returned empty response");
            }
            return response;
        } catch (ApiException ex) {
            throw ex;
        } catch (RestClientException ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "AI analytics service request failed: " + ex.getMessage());
        }
    }

    private String trimTrailingSlash(String value) {
        if (value == null) {
            return "";
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    private String normalizePath(String value) {
        String path = value == null || value.isBlank() ? "/" : value.trim();
        return path.startsWith("/") ? path : "/" + path;
    }

    public record AiGenerateDeckRequest(String playerTag, GenerateDeckRequest constraints,
                                        List<Card> availableCards) {
    }

    public record AiGeneratedDeckResponse(List<Integer> cardIds, String name, String strategy, String description,
                                          Double qualityScore, String explanation, Map<String, Object> breakdown) {
    }

    public record AiCompareRequest(String playerTag, DeckShort leftDeck, DeckShort rightDeck,
                                   CompareDecksRequest originalRequest) {
    }

    public record AiCompareResponse(Double leftScore, Double rightScore, Map<String, Object> leftBreakdown,
                                    Map<String, Object> rightBreakdown, String winnerSide,
                                    String resultDescription) {
    }
}


