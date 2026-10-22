package com.mindproject.backend.repository;

import com.mindproject.backend.domain.consultation.ConsultationStatus;
import com.mindproject.backend.domain.entity.Consultation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
    @EntityGraph(attributePaths = {"patient", "professional"})
    Optional<Consultation> findWithPatientAndProfessionalById(Long id);

    @EntityGraph(attributePaths = {"patient", "professional"})
    List<Consultation> findAllByScheduledAtGreaterThanEqualAndScheduledAtLessThanAndStatusOrderByScheduledAtAsc(LocalDateTime start, LocalDateTime end, ConsultationStatus status);

    @Query(value = "select exists (select 1 from consultations where professional_id = :professionalId and scheduled_at = :dateTime and status = 'SCHEDULED')", nativeQuery = true)
    boolean hasConsultation(@Param("professionalId") Long professionalId, @Param("dateTime") LocalDateTime dateTime);
}
