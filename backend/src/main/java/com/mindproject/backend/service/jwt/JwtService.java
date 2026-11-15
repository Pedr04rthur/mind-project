package com.mindproject.backend.service.jwt;

import java.time.Instant;

import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import com.mindproject.backend.domain.entity.Account;

import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class JwtService {

    private static final String ISSUER = "apoia.aqui";
    private static final long EXPIRATION = 60L * 5 * 10;

    private final JwtEncoder encoder;

    public String generateToken(Account account) {

        Instant now = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
            .issuer(ISSUER)
            .subject(account.getId().toString())
            .claim("email", account.getEmail())
            .issuedAt(now)
            .expiresAt(now.plusSeconds(EXPIRATION))
            .build();

        return encoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }
    
}