package egorteam.clashroyaleback.controllers;

import egorteam.clashroyaleback.dto.request.*;
import egorteam.clashroyaleback.dto.response.*;

import egorteam.clashroyaleback.services.AnalyticsService;
import egorteam.clashroyaleback.services.AuthService;
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
    GeneratedDeckResponse generate(@RequestHeader(value = "Authorization", required = false) String authorization,
                                        @Valid @RequestBody GenerateDeckRequest request) {
        return analyticsService.generateDeck(authService.requireUser(authorization).playerTag(), request);
    }
}


