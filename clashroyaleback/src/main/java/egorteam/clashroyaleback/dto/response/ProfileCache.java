package egorteam.clashroyaleback.dto.response;

import java.time.Instant;
import java.util.Map;

public record ProfileCache(String playerName, Integer trophies, Integer bestTrophies, Integer expLevel,
                           DeckShort currentDeck, Map<String, Object> rewards, Map<String, Object> profileData,
                           Map<String, Object> battleStats, Instant updatedAt) {
}

