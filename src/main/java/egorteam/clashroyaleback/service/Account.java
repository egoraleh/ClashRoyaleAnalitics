package egorteam.clashroyaleback.service;

import egorteam.clashroyaleback.api.Dtos;

import java.time.Instant;

public record Account(String playerTag, String username, String email, String password, Instant registeredAt) {
    public Dtos.User toUser() {
        return new Dtos.User(playerTag, username, email, registeredAt);
    }
}
