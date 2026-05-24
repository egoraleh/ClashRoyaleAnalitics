package egorteam.clashroyaleback.dto.response;

import java.util.List;

public record RatingHistoryResponse(String playerTag, List<RatingPoint> points) {
}

