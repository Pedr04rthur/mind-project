package com.mindproject.backend.repository;

import com.mindproject.backend.domain.entity.Triage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TriageRepository extends JpaRepository<Triage, Long> {

    boolean existsByPatient_Id(Long patientId);
}
