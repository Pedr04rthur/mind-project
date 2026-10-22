package com.mindproject.backend.repository;

import com.mindproject.backend.domain.entity.Professional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfessionalRepository extends JpaRepository<Professional, Long> {
}
