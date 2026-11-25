package com.mindproject.backend.controller.auth;

import com.mindproject.backend.controller.auth.dto.AuthResponse;
import com.mindproject.backend.controller.auth.dto.LoginRequest;
import com.mindproject.backend.controller.auth.dto.MeResponse;
import com.mindproject.backend.service.auth.AuthService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;

    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signIn(@RequestBody @Valid LoginRequest request, HttpServletResponse response) {
        var tokens = service.signIn(request.email(), request.password());
        addRefreshTokenCookie(response, tokens.refreshToken());
        return ResponseEntity.status(HttpStatus.OK).body(new AuthResponse(tokens.accessToken(), tokens.profile()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@CookieValue("refreshToken") String refreshToken, HttpServletResponse response) {
        var tokens = service.refresh(refreshToken);
        addRefreshTokenCookie(response, tokens.refreshToken());
        return ResponseEntity.status(HttpStatus.OK).body(new AuthResponse(tokens.accessToken(), tokens.profile()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue("refreshToken") String refreshToken, HttpServletResponse response) {
        if (refreshToken != null) {
            service.logout(refreshToken);
        }
        removeRefreshTokenCookie(response);
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(service.me(jwt.getClaimAsString("email")));
    }

    private void addRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60);
        response.addCookie(cookie);
    }

    private void removeRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}
