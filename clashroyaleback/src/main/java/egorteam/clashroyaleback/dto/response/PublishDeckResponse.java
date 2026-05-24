package egorteam.clashroyaleback.dto.response;

import java.time.Instant;

public record PublishDeckResponse(Long deckId, String publicToken, String publicUrl, Instant publishedAt) {
}

