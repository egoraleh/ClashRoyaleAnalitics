package egorteam.clashroyaleback.dto.response;

import java.util.List;

public record CardsPageResponse(int page, int size, long totalElements, int totalPages, List<Card> items) {
}

