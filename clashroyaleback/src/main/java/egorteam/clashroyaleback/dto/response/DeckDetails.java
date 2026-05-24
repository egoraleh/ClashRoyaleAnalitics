package egorteam.clashroyaleback.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record DeckDetails(Long id, String ownerPlayerTag, String name, String deckType, String strategy,
                          String description, Double qualityScore, Instant createdAt, Instant updatedAt,
                          List<DeckCardView> cards, Map<String, Object> metrics) {
}

