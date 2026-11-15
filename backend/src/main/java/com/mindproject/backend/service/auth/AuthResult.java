package com.mindproject.backend.service.auth;

import com.mindproject.backend.domain.account.UserProfile;

public record AuthResult(String accessToken, String refreshToken, UserProfile profile) {
}
