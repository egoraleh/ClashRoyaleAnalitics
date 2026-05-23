package egorteam.clashroyaleback.api;

import egorteam.clashroyaleback.service.AuthService;
import egorteam.clashroyaleback.service.DeckService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
class DeckController {
    private final AuthService authService;
    private final DeckService deckService;

    DeckController(AuthService authService, DeckService deckService) {
        this.authService = authService;
        this.deckService = deckService;
    }

    @GetMapping("/decks")
    Dtos.DeckListResponse list(@RequestHeader(value = "Authorization", required = false) String authorization,
                               @RequestParam(required = false) String deckType) {
        return deckService.list(authService.requireUser(authorization).playerTag(), deckType);
    }

    @PostMapping("/decks")
    @ResponseStatus(HttpStatus.CREATED)
    Dtos.DeckDetails create(@RequestHeader(value = "Authorization", required = false) String authorization,
                            @Valid @RequestBody Dtos.CreateDeckRequest request) {
        return deckService.create(authService.requireUser(authorization).playerTag(), request, "USER");
    }

    @GetMapping("/decks/{deckId}")
    Dtos.DeckDetails get(@RequestHeader(value = "Authorization", required = false) String authorization,
                         @PathVariable long deckId) {
        return deckService.getOwned(deckId, authService.requireUser(authorization).playerTag());
    }

    @PutMapping("/decks/{deckId}")
    Dtos.DeckDetails update(@RequestHeader(value = "Authorization", required = false) String authorization,
                            @PathVariable long deckId,
                            @Valid @RequestBody Dtos.UpdateDeckRequest request) {
        return deckService.update(deckId, authService.requireUser(authorization).playerTag(), request);
    }

    @DeleteMapping("/decks/{deckId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void delete(@RequestHeader(value = "Authorization", required = false) String authorization,
                @PathVariable long deckId) {
        deckService.delete(deckId, authService.requireUser(authorization).playerTag());
    }

    @PostMapping("/decks/{deckId}/publish")
    Dtos.PublishDeckResponse publish(@RequestHeader(value = "Authorization", required = false) String authorization,
                                     @PathVariable long deckId) {
        return deckService.publish(deckId, authService.requireUser(authorization).playerTag());
    }

    @GetMapping("/public/decks/{publicToken}")
    Dtos.PublicDeckResponse publicDeck(@PathVariable String publicToken) {
        return deckService.publicDeck(publicToken);
    }
}
