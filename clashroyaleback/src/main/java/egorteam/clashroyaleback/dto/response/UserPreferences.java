package egorteam.clashroyaleback.dto.response;

import java.time.Instant;
import java.util.List;

public record UserPreferences(String playerTag, String preferredStrategy, Double minElixir, Double maxElixir,
                              List<CardShort> preferredCards, List<CardShort> excludedCards, Instant updatedAt) {
}

