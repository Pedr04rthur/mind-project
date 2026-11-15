package com.mindproject.backend.service.account;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.mindproject.backend.domain.entity.Account;
import com.mindproject.backend.repository.AccountRepository;

import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class AccountService {

    private final AccountRepository repository;

    public Optional<Account> findByEmail(String email) {
        return repository.findByEmail(email);
    }
    
}
