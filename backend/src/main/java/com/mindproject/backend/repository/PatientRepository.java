package com.mindproject.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mindproject.backend.domain.entity.Patient;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByCpf(String cpf);

    Optional<Patient> findByAccountEmail(String email);

    boolean existsByCpf(String cpf);

    boolean existsByAccountEmail(String email);
}
