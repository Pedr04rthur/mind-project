package com.mindproject.backend.service.patient;

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
    public void create(String cpf, String name, String phone, String email, String address, String password) {
        if (repository.existsByCpf(cpf)) {
            throw new BadRequestException("Já existe um paciente cadastrado com este CPF");
        }
        if (repository.existsByEmail(email)) {
            throw new BadRequestException("Já existe um paciente cadastrado com este E-mail");
        }
        Patient patient = new Patient(cpf, name, phone, email, address, password);
        repository.save(patient);
    }

    @Transactional
    public Patient update(String cpf, String updatedCpf, String name, String phone, String email, String address, String password) {
        Patient existingPatient = findByCpf(cpf);
        if (!existingPatient.getCpf().equals(updatedCpf) && repository.existsByCpf(updatedCpf)) {
            throw new BadRequestException("Já existe um paciente cadastrado com este CPF");
        }
        if (!existingPatient.getEmail().equals(email) && repository.existsByEmail(email)) {
            throw new BadRequestException("Já existe um paciente cadastrado com este E-mail");
        }
        existingPatient.setCpf(updatedCpf);
        existingPatient.setName(name);
        existingPatient.setPhone(phone);
        existingPatient.setEmail(email);
        existingPatient.setAddress(address);
        existingPatient.setPassword(password);
        return repository.save(existingPatient);
    }

    @Transactional
    public void delete(String cpf) {
        Patient patient = findByCpf(cpf);
        repository.delete(patient);
    }

    public Page<Patient> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public Patient findByCpf(String cpf) {
        return repository.findByCpf(cpf).orElseThrow(() -> new NotFoundException("CPF não encontrado"));
    }
}
