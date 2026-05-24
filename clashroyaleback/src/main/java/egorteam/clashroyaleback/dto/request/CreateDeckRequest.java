package egorteam.clashroyaleback.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateDeckRequest(@NotBlank @Size(max = 100) String name, String strategy,
                                @NotNull @Size(min = 8, max = 8) List<@Valid DeckCardInput> cards) {
}

