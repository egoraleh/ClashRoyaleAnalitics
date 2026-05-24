package egorteam.clashroyaleback.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record DeckSelection(@NotBlank String source, Long deckId,
                            @Size(min = 8, max = 8) List<@Valid DeckCardInput> cards) {
}

