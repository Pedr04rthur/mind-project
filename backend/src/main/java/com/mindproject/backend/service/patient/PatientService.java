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
    public Patient update(String cpf, PatientRequest request) {

        Patient patient = findByCPF(cpf);

        if (repository.existsByCpfAndIdNot(request.cpf(), patient.getId())) {
            throw new BadRequestException("Já existe um paciente cadastrado com este CPF");
        }

        if (repository.existsByEmailAndIdNot(request.email(), patient.getId())) {
            throw new BadRequestException("Já existe um paciente cadastrado com este E-mail");
        }

        patient.update(
                request.cpf(),
                request.name(),
                request.phone(),
                request.email(),
                request.address(),
                request.password()
        );

        return repository.save(patient);
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
        return repository.findByCpf(cpf).orElseThrow(() -> new NotFoundException("CPF não encontrado"));
    }

}