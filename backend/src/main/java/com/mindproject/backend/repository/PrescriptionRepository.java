package com.mindproject.backend.repository;

import com.mindproject.backend.domain.entity.Prescription;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    @EntityGraph(attributePaths = {"items", "consultation", "consultation.patient", "consultation.professional"})
    List<Prescription> findAllByConsultation_IdOrderByCreatedAtDesc(Long consultationId);

    @EntityGraph(attributePaths = {"items", "consultation", "consultation.patient", "consultation.professional"})
    Optional<Prescription> findByIdAndConsultation_Id(Long id, Long consultationId);
}
