package com.mindproject.backend.service.patient;

import com.mindproject.backend.controller.patient.dto.PatientRequest;
import com.mindproject.backend.domain.entity.Patient;
import com.mindproject.backend.exception.BadRequestException;
import com.mindproject.backend.exception.NotFoundException;
import com.mindproject.backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository repository;

    @Transactional
    public void create(PatientRequest request) {
        if (repository.existsByCpf(request.cpf())) {
            throw new BadRequestException("Já existe um paciente cadastrado com este CPF");
        }
        if (repository.existsByEmail(request.email())) {
            throw new BadRequestException("Já existe um paciente cadastrado com este E-mail");
        }
        Patient patient = new Patient(
                request.cpf(),
                request.name(),
                request.phone(),
                request.email(),
                request.address(),
                request.password()
        );
        repository.save(patient);
    }

    @Transactional
    public Patient update(String cpf, Patient newPatient) {
        Patient atual = findByCPF(cpf);

        // Só valida unicidade se o CPF realmente mudou
        if (!atual.getCpf().equals(newPatient.getCpf())
                && repository.existsByCpf(newPatient.getCpf())) {
            throw new BadRequestException("Já existe um paciente cadastrado com este CPF");
        }

        // Só valida unicidade se o e-mail realmente mudou
        if (!atual.getEmail().equals(newPatient.getEmail())
                && repository.existsByEmail(newPatient.getEmail())) {
            throw new BadRequestException("Já existe um paciente cadastrado com este E-mail");
        }

        // Atualiza os campos do paciente existente (mantém o mesmo id)
        atual.setName(newPatient.getName());
        atual.setPhone(newPatient.getPhone());
        atual.setEmail(newPatient.getEmail());
        atual.setAddress(newPatient.getAddress());
        atual.setPassword(newPatient.getPassword());

        return repository.save(atual);
    }

    @Transactional
    public void delete(String cpf) {
        Patient patient = findByCPF(cpf);
        repository.delete(patient);
    }

    public Page<Patient> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public Patient findByCPF(String cpf) {
        return repository.findByCpf(cpf)
                .orElseThrow(() -> new NotFoundException("CPF não encontrado"));
    }
}
