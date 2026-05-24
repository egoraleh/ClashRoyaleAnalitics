package egorteam.clashroyaleback.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record CompareDecksRequest(@Valid @NotNull DeckSelection leftDeck, @Valid @NotNull DeckSelection rightDeck) {
}

