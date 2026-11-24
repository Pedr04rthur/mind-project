package com.mindproject.backend.controller.auth.dto;

import com.mindproject.backend.domain.account.UserProfile;

public record MeResponse(
        String cpf,
        String nome,
        String email,
        UserProfile profile,
        Long id,
        String telefone,
        String endereco,
        String especialidade
) {
    public MeResponse(
            String cpf,
            String nome,
            String email,
            UserProfile profile
    ) {
        this(cpf, nome, email, profile, null, null, null, null);
    }
}
