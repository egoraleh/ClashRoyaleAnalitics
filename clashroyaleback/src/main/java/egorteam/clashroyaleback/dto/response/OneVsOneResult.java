package egorteam.clashroyaleback.dto.response;

import java.time.Instant;
import java.util.Map;

public record OneVsOneResult(Long id, DeckShort leftDeck, DeckShort rightDeck, double leftScore,
                             double rightScore, Map<String, Object> leftBreakdown,
                             Map<String, Object> rightBreakdown, String winnerSide,
                             String resultDescription, Instant createdAt) {
}

