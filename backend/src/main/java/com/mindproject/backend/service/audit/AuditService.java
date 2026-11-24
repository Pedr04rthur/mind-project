package com.mindproject.backend.service.audit;

import com.mindproject.backend.domain.entity.LogExclusao;
import com.mindproject.backend.domain.entity.Patient;
import com.mindproject.backend.domain.entity.Professional;
import com.mindproject.backend.repository.LogExclusaoRepository;
import com.mindproject.backend.exception.BadRequestException;

import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.Predicate;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.web.server.ResponseStatusException;

import tools.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final LogExclusaoRepository repository;
    private final EntityManager entityManager;
    private final ObjectMapper objectMapper;

    private Jwt currentJwt() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !(authentication.getPrincipal() instanceof Jwt jwt)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Usuário não autorizado."
            );
        }

        return jwt;
    }

    public void exigirRecepcao() {

        Jwt jwt = currentJwt();

        Long accountId = Long.parseLong(jwt.getSubject());

        Long total = entityManager.createQuery("""
                select count(r)
                from Reception r
                where r.account.id = :accountId
                """, Long.class)
                .setParameter("accountId", accountId)
                .getSingleResult();

        if (total == 0) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Acesso restrito à recepção."
            );
        }
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void registrarPaciente(Patient patient) {

        Map<String, Object> dados = new LinkedHashMap<>();

        dados.put("id", patient.getId());
        dados.put("cpf", patient.getCpf());
        dados.put("nome", patient.getName());
        dados.put("telefone", patient.getPhone());
        dados.put("endereco", patient.getAddress());
        dados.put("email", patient.getAccount().getEmail());

        registrar(
                "patients",
                patient.getId(),
                patient.getCpf(),
                dados
        );
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void registrarProfissional(Professional professional) {

        Map<String, Object> dados = new LinkedHashMap<>();

        dados.put("id", professional.getId());
        dados.put("nome", professional.getName());
        dados.put("especialidade", professional.getSpecialty());

        if (professional.getAccount() != null) {
            dados.put(
                    "email",
                    professional.getAccount().getEmail()
            );
        }

        registrar(
                "professionals",
                professional.getId(),
                null,
                dados
        );
    }

    private void registrar(
            String tabela,
            Long registroId,
            String cpf,
            Map<String, Object> dados
    ) {

        exigirRecepcao();

        Jwt jwt = currentJwt();

        String responsavel = jwt.getClaimAsString("email");

        String json = objectMapper.writeValueAsString(dados);

        repository.save(
                new LogExclusao(
                        tabela,
                        registroId,
                        cpf,
                        responsavel,
                        json
                )
        );
    }

    @Transactional(readOnly = true)
    public Page<LogExclusao> listar(
            String cpf,
            String tabela,
            LocalDate inicio,
            LocalDate fim,
            Pageable pageable
    ) {

        exigirRecepcao();

        if (inicio != null && fim != null
                && inicio.isAfter(fim)) {

            throw new BadRequestException(
                    "A data inicial não pode ser posterior à final."
            );
        }

        return repository.findAll((root, query, cb) -> {

            List<Predicate> filtros = new ArrayList<>();

            if (cpf != null && !cpf.isBlank()) {

                String cpfLimpo = cpf.replaceAll("\\D", "");

                if (!cpfLimpo.isBlank()) {
                    filtros.add(
                            cb.like(
                                    root.get("cpfAfetado"),
                                    "%" + cpfLimpo + "%"
                            )
                    );
                }
            }

            if (tabela != null && !tabela.isBlank()) {
                filtros.add(
                        cb.equal(
                                root.get("tabelaAfetada"),
                                tabela
                        )
                );
            }

            if (inicio != null) {
                filtros.add(
                        cb.greaterThanOrEqualTo(
                                root.<java.time.LocalDateTime>get("dataExclusao"),
                                inicio.atStartOfDay()
                        )
                );
            }

            if (fim != null) {
                filtros.add(
                        cb.lessThan(
                                root.<java.time.LocalDateTime>get("dataExclusao"),
                                fim.plusDays(1).atStartOfDay()
                        )
                );
            }

            return cb.and(filtros.toArray(new Predicate[0]));

        }, pageable);
    }
}
