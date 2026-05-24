package egorteam.clashroyaleback.controllers;

import egorteam.clashroyaleback.dto.request.*;
import egorteam.clashroyaleback.dto.response.*;

import egorteam.clashroyaleback.services.AnalyticsService;
import egorteam.clashroyaleback.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/1v1")
class OneVsOneController {
    private final AuthService authService;
    private final AnalyticsService analyticsService;

    OneVsOneController(AuthService authService, AnalyticsService analyticsService) {
        this.authService = authService;
        this.analyticsService = analyticsService;
    }

    @PostMapping("/compare")
    OneVsOneResult compare(@RequestHeader(value = "Authorization", required = false) String authorization,
                                @Valid @RequestBody CompareDecksRequest request) {
        var account = authService.optionalUser(authorization);
        return analyticsService.compare(account == null ? null : account.playerTag(), request);
    }

    @GetMapping("/history")
    OneVsOneHistoryResponse history(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return analyticsService.history(authService.requireUser(authorization).playerTag());
    }
}


