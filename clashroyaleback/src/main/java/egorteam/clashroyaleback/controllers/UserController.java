package egorteam.clashroyaleback.controllers;

import egorteam.clashroyaleback.dto.request.*;
import egorteam.clashroyaleback.dto.response.*;

import egorteam.clashroyaleback.services.AuthService;
import egorteam.clashroyaleback.services.ProfileService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users/me")
class UserController {
    private final AuthService authService;
    private final ProfileService profileService;

    UserController(AuthService authService, ProfileService profileService) {
        this.authService = authService;
        this.profileService = profileService;
    }

    @GetMapping
    User me(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return authService.requireUser(authorization).toUser();
    }

    @GetMapping("/preferences")
    UserPreferences preferences(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return profileService.preferences(authService.requireUser(authorization).playerTag());
    }

    @PutMapping("/preferences")
    UserPreferences updatePreferences(@RequestHeader(value = "Authorization", required = false) String authorization,
                                           @Valid @RequestBody UpdateUserPreferencesRequest request) {
        return profileService.updatePreferences(authService.requireUser(authorization).playerTag(), request);
    }
}


