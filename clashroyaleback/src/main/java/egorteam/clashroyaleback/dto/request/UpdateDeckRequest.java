package egorteam.clashroyaleback.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UpdateDeckRequest(@Size(max = 100) String name, String strategy,
                                @Size(min = 8, max = 8) List<@Valid DeckCardInput> cards) {
}

