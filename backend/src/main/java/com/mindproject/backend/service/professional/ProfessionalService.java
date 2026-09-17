package com.mindproject.backend.service.professional;

import com.mindproject.backend.controller.professional.dto.ProfessionalRequest;
import com.mindproject.backend.domain.entity.Professional;
import com.mindproject.backend.exception.BadRequestException;
import com.mindproject.backend.exception.NotFoundException;
import com.mindproject.backend.repository.ProfessionalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfessionalService {

    private final ProfessionalRepository repository;

    @Transactional
    public void create(ProfessionalRequest request) {
        if (repository.existsByCpf(request.cpf())) {
            throw new BadRequestException("Já existe um profissional cadastrado com este CPF");
        }
        if (repository.existsByEmail(request.email())) {
            throw new BadRequestException("Já existe um profissional cadastrado com este E-mail");
        }
        repository.save(request.toEntity());
    }

    @Transactional
    public Professional update(String cpf, ProfessionalRequest request) {
        Professional professional = findByCPF(cpf);

        if (repository.existsByCpfAndIdNot(request.cpf(), professional.getId())) {
            throw new BadRequestException("Já existe um profissional cadastrado com este CPF");
        }
        if (repository.existsByEmailAndIdNot(request.email(), professional.getId())) {
            throw new BadRequestException("Já existe um profissional cadastrado com este E-mail");
        }
        professional.update(
                request.cpf(),
                request.sex(),
                request.phone(),
                request.email(),
                request.address(),
                request.crp(),
                request.specialty(),
                request.password()
        );
        return repository.save(professional);
    }

    @Transactional
    public void delete(String cpf) {
        Professional professional = findByCPF(cpf);
        repository.delete(professional);
    }

    public Page<Professional> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public Professional findByCPF(String cpf) {
        return repository.findByCpf(cpf).orElseThrow(() -> new NotFoundException("CPF não encontrado"));
    }
}
