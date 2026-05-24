package egorteam.clashroyaleback.dto.response;

import java.time.Instant;
import java.util.List;

public record PublicProfileResponse(String source, String playerTag, String username, Instant registeredAt,
                                    ProfileCache cache, List<RatingPoint> ratingHistory) {
}

