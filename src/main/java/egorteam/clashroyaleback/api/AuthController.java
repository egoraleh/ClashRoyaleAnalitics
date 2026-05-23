package egorteam.clashroyaleback.api;

import egorteam.clashroyaleback.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
class AuthController {
    private final AuthService authService;

    AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    Dtos.AuthSuccessResponse register(@Valid @RequestBody Dtos.RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    Dtos.AuthSuccessResponse login(@Valid @RequestBody Dtos.LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    Dtos.TokenPairResponse refresh(@Valid @RequestBody Dtos.RefreshTokenRequest request) {
        return authService.refresh(request);
    }
}
