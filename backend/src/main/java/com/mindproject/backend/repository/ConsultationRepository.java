package com.mindproject.backend.repository;

import com.mindproject.backend.controller.report.dto.ConsultationByProfessionalResponse;
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
    List<Consultation> findAllByScheduledAtGreaterThanEqualAndScheduledAtLessThanAndStatusOrderByScheduledAtAsc(
        LocalDateTime start,
        LocalDateTime end,
        ConsultationStatus status
    );

    boolean existsByPatient_Id(Long patientId);

    boolean existsByProfessional_Id(Long professionalId);

    @EntityGraph(attributePaths = {"patient", "professional"})
    @Query("select c from Consultation c where (c.patient.account.id = :accountId or c.professional.account.id = :accountId) and (:startAt is null or c.scheduledAt >= :startAt) and (:endAt is null or c.scheduledAt < :endAt) order by c.scheduledAt asc")
    List<Consultation> findAllByAccountIdAndDateRange(
        @Param("accountId") Long accountId,
        @Param("startAt") LocalDateTime startAt,
        @Param("endAt") LocalDateTime endAt
    );

    @Query(value = "select exists (select 1 from consultations where professional_id = :professionalId and scheduled_at = :dateTime and status = 'SCHEDULED')", nativeQuery = true)
    boolean hasConsultation(
        @Param("professionalId") Long professionalId,
        @Param("dateTime") LocalDateTime dateTime
    );

    @Query("""
        select new com.mindproject.backend.controller.report.dto.ConsultationByProfessionalResponse(
            p.id,
            p.name,
            p.specialty,
            count(c.id)
        )
        from Professional p
        left join Consultation c on c.professional.id = p.id
            and c.status <> :excludedStatus
            and (:startAt is null or c.scheduledAt >= :startAt)
            and (:endAt is null or c.scheduledAt < :endAt)
        group by p.id, p.name, p.specialty
        order by count(c.id) desc, p.name asc
        """)
    List<ConsultationByProfessionalResponse> reportByProfessional(
        @Param("startAt") LocalDateTime startAt,
        @Param("endAt") LocalDateTime endAt,
        @Param("excludedStatus") ConsultationStatus excludedStatus
    );
}
