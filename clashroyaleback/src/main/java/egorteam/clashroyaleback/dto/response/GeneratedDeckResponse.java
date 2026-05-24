package egorteam.clashroyaleback.dto.response;

import java.util.Map;

public record GeneratedDeckResponse(DeckDetails deck, String explanation, Map<String, Object> breakdown) {
}

