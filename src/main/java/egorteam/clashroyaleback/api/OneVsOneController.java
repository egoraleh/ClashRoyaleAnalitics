package egorteam.clashroyaleback.api;

import egorteam.clashroyaleback.service.AnalyticsService;
import egorteam.clashroyaleback.service.AuthService;
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
    Dtos.OneVsOneResult compare(@RequestHeader(value = "Authorization", required = false) String authorization,
                                @Valid @RequestBody Dtos.CompareDecksRequest request) {
        var account = authService.optionalUser(authorization);
        return analyticsService.compare(account == null ? null : account.playerTag(), request);
    }

    @GetMapping("/history")
    Dtos.OneVsOneHistoryResponse history(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return analyticsService.history(authService.requireUser(authorization).playerTag());
    }
}
