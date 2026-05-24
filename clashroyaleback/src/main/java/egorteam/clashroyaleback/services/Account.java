package egorteam.clashroyaleback.services;

import egorteam.clashroyaleback.dto.request.*;
import egorteam.clashroyaleback.dto.response.*;


import java.time.Instant;

public record Account(String playerTag, String username, String email, String password, Instant registeredAt) {
    public User toUser() {
        return new User(playerTag, username, email, registeredAt);
    }
}


