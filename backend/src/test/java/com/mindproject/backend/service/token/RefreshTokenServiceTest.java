package com.mindproject.backend.service.token;

import com.mindproject.backend.domain.entity.Account;
import com.mindproject.backend.domain.entity.RefreshToken;
import com.mindproject.backend.exception.BadRequestException;
import com.mindproject.backend.repository.RefreshTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository repository;

    private RefreshTokenService refreshTokenService;

    @BeforeEach
    void setUp() {
        refreshTokenService = new RefreshTokenService(repository);
    }

    @Test
    void refreshRotatesUnexpiredToken() {
        RefreshToken token = RefreshToken.builder().token("old-token").expiryDate(Instant.now().plusSeconds(3600)).account(new Account("user@example.com", "password")).build();
        when(repository.findByToken("old-token")).thenReturn(Optional.of(token));
        when(repository.save(token)).thenReturn(token);

        RefreshToken refreshed = refreshTokenService.refresh("old-token");

        assertEquals(token, refreshed);
        assertNotEquals("old-token", token.getToken());
        verify(repository).save(token);
    }

    @Test
    void refreshDeletesAndRejectsExpiredToken() {
        RefreshToken token = RefreshToken.builder().token("expired-token").expiryDate(Instant.now().minusSeconds(1)).account(new Account("user@example.com", "password")).build();
        when(repository.findByToken("expired-token")).thenReturn(Optional.of(token));

        assertThrows(BadRequestException.class, () -> refreshTokenService.refresh("expired-token"));

        verify(repository).delete(token);
        verify(repository, never()).save(any(RefreshToken.class));
    }

    @Test
    void refreshRejectsUnknownToken() {
        when(repository.findByToken("unknown-token")).thenReturn(Optional.empty());

        assertThrows(BadRequestException.class, () -> refreshTokenService.refresh("unknown-token"));

        verify(repository, never()).save(any(RefreshToken.class));
    }

    @Test
    void logoutDeletesProvidedToken() {
        refreshTokenService.delete("refresh-token");

        verify(repository).deleteByToken("refresh-token");
    }
}
