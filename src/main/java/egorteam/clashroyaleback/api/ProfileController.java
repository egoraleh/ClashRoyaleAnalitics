package egorteam.clashroyaleback.api;

import egorteam.clashroyaleback.service.AuthService;
import egorteam.clashroyaleback.service.ProfileService;
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
    Dtos.ProfileResponse link(@RequestHeader(value = "Authorization", required = false) String authorization,
                              @Valid @RequestBody Dtos.LinkClashAccountRequest request) {
        return profileService.link(authService.requireUser(authorization), request.playerTag());
    }

    @GetMapping("/me")
    Dtos.ProfileResponse me(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return profileService.profile(authService.requireUser(authorization));
    }

    @PutMapping("/me")
    Dtos.User update(@RequestHeader(value = "Authorization", required = false) String authorization,
                     @Valid @RequestBody Dtos.UpdateProfileRequest request) {
        return profileService.update(authService.requireUser(authorization), request);
    }

    @GetMapping("/me/dashboard")
    Dtos.DashboardResponse dashboard(@RequestHeader(value = "Authorization", required = false) String authorization,
                                     @RequestParam(required = false) LocalDate from,
                                     @RequestParam(required = false) LocalDate to) {
        return profileService.dashboard(authService.requireUser(authorization).playerTag());
    }

    @PostMapping("/me/refresh")
    @ResponseStatus(HttpStatus.ACCEPTED)
    Dtos.AsyncAcceptedResponse refresh(@RequestHeader(value = "Authorization", required = false) String authorization) {
        profileService.refresh(authService.requireUser(authorization).playerTag());
        return new Dtos.AsyncAcceptedResponse("accepted", "Profile refresh completed");
    }

    @GetMapping("/{playerTag}")
    Dtos.PublicProfileResponse publicProfile(@PathVariable String playerTag) {
        return profileService.publicProfile(playerTag);
    }

    @GetMapping("/{playerTag}/rating-history")
    Dtos.RatingHistoryResponse ratingHistory(@PathVariable String playerTag) {
        return profileService.ratingHistory(playerTag);
    }
}
