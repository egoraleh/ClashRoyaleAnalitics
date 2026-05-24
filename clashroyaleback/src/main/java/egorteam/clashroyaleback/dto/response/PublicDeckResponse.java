package egorteam.clashroyaleback.dto.response;

import java.util.Map;

public record PublicDeckResponse(String token, Map<String, Object> owner, DeckDetails deck) {
}

