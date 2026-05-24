package egorteam.clashroyaleback.dto.response;

import java.time.Instant;
import java.util.Map;

public record Card(Integer id, Integer apiCardId, String name, Integer elixir, String rarity, Integer arena,
                   String iconUrl, String description, Map<String, Object> dataJson, Instant updatedAt) {
}

