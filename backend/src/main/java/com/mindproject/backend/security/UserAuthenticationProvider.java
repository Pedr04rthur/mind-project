package com.mindproject.backend.security;

import com.mindproject.backend.domain.entity.Account;
import com.mindproject.backend.domain.entity.Patient;
import com.mindproject.backend.domain.entity.Professional;
import com.mindproject.backend.domain.entity.Reception;
import com.mindproject.backend.repository.PatientRepository;
import com.mindproject.backend.repository.ProfessionalRepository;
import com.mindproject.backend.repository.ReceptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class UserAuthenticationProvider implements AuthenticationProvider {

    private final PatientRepository patientRepository;
    private final ProfessionalRepository professionalRepository;
    private final ReceptionRepository receptionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        Optional<Patient> patient = patientRepository.findByAccountEmail(authentication.getName());
        Optional<Professional> professional = professionalRepository.findByAccountEmail(authentication.getName());
        Optional<Reception> reception = receptionRepository.findByAccountEmail(authentication.getName());
        long matchingAccounts = List.of(patient.isPresent(), professional.isPresent(), reception.isPresent()).stream().filter(Boolean::booleanValue).count();
        if (matchingAccounts != 1) {
            throw new BadCredentialsException("Invalid email or password");
        }
        if (patient.isPresent()) return authenticate(patient.get().getAccount(), "PATIENT", authentication.getCredentials().toString());
        if (professional.isPresent()) return authenticate(professional.get().getAccount(), "PROFESSIONAL", authentication.getCredentials().toString());
        return authenticate(reception.orElseThrow().getAccount(), "RECEPTION", authentication.getCredentials().toString());
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }

    private Authentication authenticate(Account account, String profile, String rawPassword) {
        if (!passwordEncoder.matches(rawPassword, account.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }
        return UsernamePasswordAuthenticationToken.authenticated(account, null, List.of(new SimpleGrantedAuthority("ROLE_" + profile)));
    }
}
