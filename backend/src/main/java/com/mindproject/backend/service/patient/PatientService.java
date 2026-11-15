package com.mindproject.backend.service.patient;

import com.mindproject.backend.domain.entity.Patient;
import com.mindproject.backend.exception.BadRequestException;
import com.mindproject.backend.exception.ConflictException;
import com.mindproject.backend.exception.NotFoundException;
import com.mindproject.backend.repository.ConsultationRepository;
import com.mindproject.backend.repository.MoodRepository;
import com.mindproject.backend.repository.PatientRepository;
import com.mindproject.backend.repository.RefreshTokenRepository;
import com.mindproject.backend.repository.TriageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository repository;
    private final ConsultationRepository consultationRepository;
    private final MoodRepository moodRepository;
    private final TriageRepository triageRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void create(String cpf, String name, String phone, String email, String address, String password) {
        if (repository.existsByCpf(cpf)) {
            throw new BadRequestException("Já existe um paciente cadastrado com este CPF");
        }
        if (repository.existsByAccountEmail(email)) {
            throw new BadRequestException("Já existe um paciente cadastrado com este E-mail");
        }
        Patient patient = new Patient(cpf, name, phone, email, address, passwordEncoder.encode(password));
        repository.save(patient);
    }

    @Transactional
    public Patient update(String cpf, String updatedCpf, String name, String phone, String email, String address, String password) {
        Patient existingPatient = findByCpf(cpf);
        if (!existingPatient.getCpf().equals(updatedCpf) && repository.existsByCpf(updatedCpf)) {
            throw new BadRequestException("Já existe um paciente cadastrado com este CPF");
        }
        if (!existingPatient.getAccount().getEmail().equals(email) && repository.existsByAccountEmail(email)) {
            throw new BadRequestException("Já existe um paciente cadastrado com este E-mail");
        }
        existingPatient.setCpf(updatedCpf);
        existingPatient.setName(name);
        existingPatient.setPhone(phone);
        existingPatient.getAccount().setEmail(email);
        existingPatient.setAddress(address);
        existingPatient.getAccount().setPassword(passwordEncoder.encode(password));
        return repository.save(existingPatient);
    }

    @Transactional
    public void delete(String cpf) {
        Patient patient = findByCpf(cpf);
        if (consultationRepository.existsByPatient_Id(patient.getId()) || moodRepository.existsByPatient_Id(patient.getId()) || triageRepository.existsByPatient_Id(patient.getId())) {
            throw new ConflictException("Patient has related consultations, moods, or triages and cannot be deleted");
        }
        refreshTokenRepository.deleteByAccount_Id(patient.getAccount().getId());
        repository.delete(patient);
    }

    public Page<Patient> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public Patient findByCpf(String cpf) {
        return repository.findByCpf(cpf).orElseThrow(() -> new NotFoundException("CPF não encontrado"));
    }
}
