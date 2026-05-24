package egorteam.clashroyaleback.dto.response;

import java.time.Instant;

public record User(String playerTag, String username, String email, Instant registeredAt) {
}

