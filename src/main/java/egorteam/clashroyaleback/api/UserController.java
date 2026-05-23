package egorteam.clashroyaleback.api;

import egorteam.clashroyaleback.service.AuthService;
import egorteam.clashroyaleback.service.ProfileService;
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
    Dtos.User me(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return authService.requireUser(authorization).toUser();
    }

    @GetMapping("/preferences")
    Dtos.UserPreferences preferences(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return profileService.preferences(authService.requireUser(authorization).playerTag());
    }

    @PutMapping("/preferences")
    Dtos.UserPreferences updatePreferences(@RequestHeader(value = "Authorization", required = false) String authorization,
                                           @Valid @RequestBody Dtos.UpdateUserPreferencesRequest request) {
        return profileService.updatePreferences(authService.requireUser(authorization).playerTag(), request);
    }
}
