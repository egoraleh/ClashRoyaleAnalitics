package egorteam.clashroyaleback.api;

import egorteam.clashroyaleback.service.AnalyticsService;
import egorteam.clashroyaleback.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
class AiController {
    private final AuthService authService;
    private final AnalyticsService analyticsService;

    AiController(AuthService authService, AnalyticsService analyticsService) {
        this.authService = authService;
        this.analyticsService = analyticsService;
    }

    @PostMapping("/generate-deck")
    Dtos.GeneratedDeckResponse generate(@RequestHeader(value = "Authorization", required = false) String authorization,
                                        @Valid @RequestBody Dtos.GenerateDeckRequest request) {
        return analyticsService.generateDeck(authService.requireUser(authorization).playerTag(), request);
    }
}
