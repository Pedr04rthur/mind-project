package com.mindproject.backend.service.token;

import java.time.Instant;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.mindproject.backend.domain.entity.Account;
import com.mindproject.backend.domain.entity.RefreshToken;
import com.mindproject.backend.exception.BadRequestException;
import com.mindproject.backend.repository.RefreshTokenRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor 
public class RefreshTokenService {

    private static final long REFRESH_TOKEN_DURATION_SEC = 7 * 24 * 60 * 60;

    private final RefreshTokenRepository repository;

    @Transactional
    public RefreshToken refresh(String oldToken) {

        RefreshToken token = findByToken(oldToken);

        if (isExpired(token)) {
            repository.delete(token);
            throw new BadRequestException("Token expirado.");
        }

        String newRefreshToken = UUID.randomUUID().toString();

        token.setExpiryDate(Instant.now().plusSeconds(REFRESH_TOKEN_DURATION_SEC));
        token.setToken(newRefreshToken);

        return repository.save(token);
    }

    @Transactional 
    public RefreshToken create(Account account) {

        String newRefreshToken = UUID.randomUUID().toString();

        RefreshToken token = RefreshToken.builder()
            .account(account)
            .expiryDate(Instant.now().plusSeconds(REFRESH_TOKEN_DURATION_SEC))
            .token(newRefreshToken)
            .build();

        return repository.save(token);
    }

    @Transactional
    public void delete(String refreshToken) {
        repository.deleteByToken(refreshToken);
    }

    public boolean isExpired(RefreshToken token) {
        return token.getExpiryDate().isBefore(Instant.now());
    }

    public RefreshToken findByToken(String token) {
        return repository.findByToken(token).orElseThrow(() -> new BadRequestException("Token invalido."));
    }

    
}