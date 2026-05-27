package egorteam.clashroyaleback.api;

import egorteam.clashroyaleback.service.CardsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cards")
class CardsController {
    private final CardsService cardsService;

    CardsController(CardsService cardsService) {
        this.cardsService = cardsService;
    }

    @GetMapping
    Dtos.CardsPageResponse list(@RequestParam(required = false) String rarity,
                                @RequestParam(required = false) Integer elixirMin,
                                @RequestParam(required = false) Integer elixirMax,
                                @RequestParam(required = false) Integer arena,
                                @RequestParam(required = false) String search,
                                @RequestParam(defaultValue = "0") int page,
                                @RequestParam(defaultValue = "20") int size,
                                @RequestParam(defaultValue = "false") boolean refresh) {
        if (refresh) {
            cardsService.refreshFromApi();
        }
        return cardsService.list(rarity, elixirMin, elixirMax, arena, search, page, size);
    }

    @GetMapping("/{cardId}")
    Dtos.Card get(@PathVariable int cardId) {
        return cardsService.get(cardId);
    }
}
