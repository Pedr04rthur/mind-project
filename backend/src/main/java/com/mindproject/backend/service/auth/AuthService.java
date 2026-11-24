package com.mindproject.backend.service.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mindproject.backend.controller.auth.dto.MeResponse;
import com.mindproject.backend.domain.account.UserProfile;
import com.mindproject.backend.domain.entity.Account;
import com.mindproject.backend.domain.entity.Patient;
import com.mindproject.backend.domain.entity.Professional;
import com.mindproject.backend.domain.entity.Reception;
import com.mindproject.backend.domain.entity.RefreshToken;
import com.mindproject.backend.exception.BadRequestException;
import com.mindproject.backend.exception.NotFoundException;
import com.mindproject.backend.repository.PatientRepository;
import com.mindproject.backend.repository.ProfessionalRepository;
import com.mindproject.backend.repository.ReceptionRepository;
import com.mindproject.backend.service.account.AccountService;
import com.mindproject.backend.service.jwt.JwtService;
import com.mindproject.backend.service.token.RefreshTokenService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PasswordEncoder encoder;
    private final JwtService jwtService;
    private final AccountService accountService;
    private final RefreshTokenService refreshTokenService;
    private final PatientRepository patientRepository;
    private final ProfessionalRepository professionalRepository;
    private final ReceptionRepository receptionRepository;

    public AuthResult signIn(String email, String password) {
        Account account = accountService.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Email não encontrado"));

        if (!encoder.matches(password, account.getPassword())) {
            throw new BadRequestException("Senha inválida");
        }

        final String accessToken = jwtService.generateToken(account);
        final String refreshToken = refreshTokenService.create(account).getToken();

        return new AuthResult(
                accessToken,
                refreshToken,
                findProfile(email)
        );
    }

    public AuthResult refresh(String refreshToken) {
        RefreshToken token = refreshTokenService.refresh(refreshToken);
        Account account = token.getAccount();

        final String accessToken = jwtService.generateToken(account);
        final String newRefreshToken = token.getToken();

        return new AuthResult(
                accessToken,
                newRefreshToken,
                findProfile(account.getEmail())
        );
    }

    public void logout(String refreshToken) {
        refreshTokenService.delete(refreshToken);
    }

    @Transactional(readOnly = true)
    public MeResponse me(String email) {
        Account account = accountService.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Email não encontrado"));

        var patientOpt = patientRepository.findByAccountEmail(email);

        if (patientOpt.isPresent()) {
            Patient p = patientOpt.get();

            return new MeResponse(
                    p.getCpf(),
                    p.getName(),
                    account.getEmail(),
                    UserProfile.PATIENT,
                    p.getId(),
                    p.getPhone(),
                    p.getAddress(),
                    null
            );
        }

        var professionalOpt = professionalRepository.findByAccountEmail(email);

        if (professionalOpt.isPresent()) {
            Professional p = professionalOpt.get();

            return new MeResponse(
                    null,
                    p.getName(),
                    account.getEmail(),
                    UserProfile.PROFESSIONAL,
                    p.getId(),
                    null,
                    null,
                    p.getSpecialty()
            );
        }

        var receptionOpt = receptionRepository.findByAccountEmail(email);

        if (receptionOpt.isPresent()) {
            Reception r = receptionOpt.get();

            return new MeResponse(
                    null,
                    r.getName(),
                    account.getEmail(),
                    UserProfile.RECEPTIONIST
            );
        }

        throw new NotFoundException("User profile not found");
    }

    private UserProfile findProfile(String email) {
        if (patientRepository.findByAccountEmail(email).isPresent()) {
            return UserProfile.PATIENT;
        }

        if (receptionRepository.findByAccountEmail(email).isPresent()) {
            return UserProfile.RECEPTIONIST;
        }

        if (professionalRepository.findByAccountEmail(email).isPresent()) {
            return UserProfile.PROFESSIONAL;
        }

        throw new NotFoundException("User profile not found");
    }
}
