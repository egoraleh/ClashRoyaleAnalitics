package egorteam.clashroyaleback.dto.request;

import java.util.List;

public record UpdateUserPreferencesRequest(String preferredStrategy, Double minElixir, Double maxElixir,
                                           List<Integer> preferredCardIds, List<Integer> excludedCardIds) {
}

