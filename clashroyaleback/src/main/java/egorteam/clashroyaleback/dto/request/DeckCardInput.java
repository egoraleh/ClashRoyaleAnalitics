package egorteam.clashroyaleback.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record DeckCardInput(@NotNull Integer cardId, @Min(1) @Max(8) Integer slotNumber) {
}

