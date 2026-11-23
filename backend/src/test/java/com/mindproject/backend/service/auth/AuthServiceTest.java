package com.mindproject.backend.service.auth;

import com.mindproject.backend.domain.entity.Account;
import com.mindproject.backend.domain.entity.Patient;
import com.mindproject.backend.domain.entity.Professional;
import com.mindproject.backend.domain.entity.Reception;
import com.mindproject.backend.domain.entity.RefreshToken;
import com.mindproject.backend.domain.account.UserProfile;
import com.mindproject.backend.exception.BadRequestException;
import com.mindproject.backend.exception.NotFoundException;
import com.mindproject.backend.repository.PatientRepository;
import com.mindproject.backend.repository.ProfessionalRepository;
import com.mindproject.backend.repository.ReceptionRepository;
import com.mindproject.backend.service.account.AccountService;
import com.mindproject.backend.service.jwt.JwtService;
import com.mindproject.backend.service.token.RefreshTokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AccountService accountService;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private ProfessionalRepository professionalRepository;

    @Mock
    private ReceptionRepository receptionRepository;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(passwordEncoder, jwtService, accountService, refreshTokenService, patientRepository, professionalRepository, receptionRepository);
    }

    @Test
    void signInReturnsTokensWhenPasswordMatches() {
        Account account = new Account("user@example.com", "encoded-password");
        RefreshToken refreshToken = RefreshToken.builder().token("refresh-token").expiryDate(Instant.now().plusSeconds(3600)).account(account).build();
        when(accountService.findByEmail("user@example.com")).thenReturn(Optional.of(account));
        when(passwordEncoder.matches("correct-password", "encoded-password")).thenReturn(true);
        when(jwtService.generateToken(account)).thenReturn("access-token");
        when(refreshTokenService.create(account)).thenReturn(refreshToken);
        when(patientRepository.findByAccountEmail("user@example.com")).thenReturn(Optional.of(new Patient()));

        var tokens = authService.signIn("user@example.com", "correct-password");

        assertEquals("access-token", tokens.accessToken());
        assertEquals("refresh-token", tokens.refreshToken());
        assertEquals(UserProfile.PATIENT, tokens.profile());
    }

    @Test
    void signInRejectsPasswordThatDoesNotMatch() {
        Account account = new Account("user@example.com", "encoded-password");
        when(accountService.findByEmail("user@example.com")).thenReturn(Optional.of(account));
        when(passwordEncoder.matches("wrong-password", "encoded-password")).thenReturn(false);

        assertThrows(BadRequestException.class, () -> authService.signIn("user@example.com", "wrong-password"));

        verify(jwtService, never()).generateToken(account);
        verify(refreshTokenService, never()).create(account);
    }

    @Test
    void signInRejectsUnknownEmail() {
        when(accountService.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> authService.signIn("missing@example.com", "password"));

        verify(passwordEncoder, never()).matches("password", "encoded-password");
    }

    @Test
    void signInReturnsReceptionistProfile() {
        Account account = new Account("reception@example.com", "encoded-password");
        when(accountService.findByEmail("reception@example.com")).thenReturn(Optional.of(account));
        when(passwordEncoder.matches("correct-password", "encoded-password")).thenReturn(true);
        when(jwtService.generateToken(account)).thenReturn("access-token");
        when(refreshTokenService.create(account)).thenReturn(RefreshToken.builder().token("refresh-token").expiryDate(Instant.now().plusSeconds(3600)).account(account).build());
        when(patientRepository.findByAccountEmail("reception@example.com")).thenReturn(Optional.empty());
        when(receptionRepository.findByAccountEmail("reception@example.com")).thenReturn(Optional.of(new Reception()));

        var result = authService.signIn("reception@example.com", "correct-password");

        assertEquals(UserProfile.RECEPTIONIST, result.profile());
    }

    @Test
    void signInReturnsProfessionalProfile() {
        Account account = new Account("professional@example.com", "encoded-password");
        when(accountService.findByEmail("professional@example.com")).thenReturn(Optional.of(account));
        when(passwordEncoder.matches("correct-password", "encoded-password")).thenReturn(true);
        when(jwtService.generateToken(account)).thenReturn("access-token");
        when(refreshTokenService.create(account)).thenReturn(RefreshToken.builder().token("refresh-token").expiryDate(Instant.now().plusSeconds(3600)).account(account).build());
        when(patientRepository.findByAccountEmail("professional@example.com")).thenReturn(Optional.empty());
        when(receptionRepository.findByAccountEmail("professional@example.com")).thenReturn(Optional.empty());
        when(professionalRepository.findByAccountEmail("professional@example.com")).thenReturn(Optional.of(new Professional("Professional", "Psychology")));

        var result = authService.signIn("professional@example.com", "correct-password");

        assertEquals(UserProfile.PROFESSIONAL, result.profile());
    }

    @Test
    void refreshGeneratesNewAccessTokenAndReturnsAccountProfile() {
        Account account = new Account("patient@example.com", "encoded-password");
        RefreshToken refreshToken = RefreshToken.builder().token("rotated-refresh-token").expiryDate(Instant.now().plusSeconds(3600)).account(account).build();
        when(refreshTokenService.refresh("old-refresh-token")).thenReturn(refreshToken);
        when(jwtService.generateToken(account)).thenReturn("new-access-token");
        when(patientRepository.findByAccountEmail("patient@example.com")).thenReturn(Optional.of(new Patient()));

        AuthResult result = authService.refresh("old-refresh-token");

        assertEquals("new-access-token", result.accessToken());
        assertEquals("rotated-refresh-token", result.refreshToken());
        assertEquals(UserProfile.PATIENT, result.profile());
    }

    @Test
    void logoutDeletesRefreshToken() {
        authService.logout("refresh-token");

        verify(refreshTokenService).delete("refresh-token");
    }
}
