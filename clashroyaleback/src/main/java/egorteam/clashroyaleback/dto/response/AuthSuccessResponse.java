package egorteam.clashroyaleback.dto.response;

public record AuthSuccessResponse(String accessToken, String refreshToken, User user) {
}

