package egorteam.clashroyaleback.dto.request;

import jakarta.validation.constraints.NotBlank;

public record LinkClashAccountRequest(@NotBlank String playerTag) {
}

