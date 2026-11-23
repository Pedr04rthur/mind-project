package com.mindproject.backend.controller.auth.dto;

import com.mindproject.backend.domain.account.UserProfile;

public record AuthResponse(String token, UserProfile profile) {
}
