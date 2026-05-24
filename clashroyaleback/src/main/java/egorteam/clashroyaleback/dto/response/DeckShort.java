package egorteam.clashroyaleback.dto.response;

import java.util.List;

public record DeckShort(Long id, String name, String deckType, String strategy, Double qualityScore,
                        List<CardShort> cards) {
}

