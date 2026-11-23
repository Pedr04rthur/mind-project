package com.mindproject.backend.repository;

import com.mindproject.backend.domain.entity.Professional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfessionalRepository extends JpaRepository<Professional, Long> {

    Optional<Professional> findByAccountEmail(String email);
}
