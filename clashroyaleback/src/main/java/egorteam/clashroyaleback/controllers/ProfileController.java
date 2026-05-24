package egorteam.clashroyaleback.controllers;

import egorteam.clashroyaleback.dto.request.*;
import egorteam.clashroyaleback.dto.response.*;

import egorteam.clashroyaleback.services.AuthService;
import egorteam.clashroyaleback.services.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/profiles")
class ProfileController {
    private final AuthService authService;
    private final ProfileService profileService;

    ProfileController(AuthService authService, ProfileService profileService) {
        this.authService = authService;
        this.profileService = profileService;
    }

    @PostMapping("/link-cr-account")
    ProfileResponse link(@RequestHeader(value = "Authorization", required = false) String authorization,
                              @Valid @RequestBody LinkClashAccountRequest request) {
        return profileService.link(authService.requireUser(authorization), request.playerTag());
    }

    @GetMapping("/me")
    ProfileResponse me(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return profileService.profile(authService.requireUser(authorization));
    }

    @PutMapping("/me")
    User update(@RequestHeader(value = "Authorization", required = false) String authorization,
                     @Valid @RequestBody UpdateProfileRequest request) {
        return profileService.update(authService.requireUser(authorization), request);
    }

    @GetMapping("/me/dashboard")
    DashboardResponse dashboard(@RequestHeader(value = "Authorization", required = false) String authorization,
                                     @RequestParam(required = false) LocalDate from,
                                     @RequestParam(required = false) LocalDate to) {
        return profileService.dashboard(authService.requireUser(authorization).playerTag());
    }

    @PostMapping("/me/refresh")
    @ResponseStatus(HttpStatus.ACCEPTED)
    AsyncAcceptedResponse refresh(@RequestHeader(value = "Authorization", required = false) String authorization) {
        profileService.refresh(authService.requireUser(authorization).playerTag());
        return new AsyncAcceptedResponse("accepted", "Profile refresh completed");
    }

    @GetMapping("/{playerTag}")
    PublicProfileResponse publicProfile(@PathVariable String playerTag) {
        return profileService.publicProfile(playerTag);
    }

    @GetMapping("/{playerTag}/rating-history")
    RatingHistoryResponse ratingHistory(@PathVariable String playerTag) {
        return profileService.ratingHistory(playerTag);
    }
}


