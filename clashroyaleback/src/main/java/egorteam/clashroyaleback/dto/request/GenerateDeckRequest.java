package egorteam.clashroyaleback.dto.request;

import java.util.List;

public record GenerateDeckRequest(String strategy, List<Integer> favoriteCardIds, List<Integer> excludedCardIds,
                                  Double minElixir, Double maxElixir, Boolean saveResult) {
}

