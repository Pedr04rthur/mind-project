package com.mindproject.backend.service.consultation;

import com.mindproject.backend.domain.consultation.ConsultationStatus;
import com.mindproject.backend.domain.entity.Consultation;
import com.mindproject.backend.domain.entity.Patient;
import com.mindproject.backend.domain.entity.Professional;
import com.mindproject.backend.exception.ConflictException;
import com.mindproject.backend.exception.NotFoundException;
import com.mindproject.backend.repository.ConsultationRepository;
import com.mindproject.backend.repository.PatientRepository;
import com.mindproject.backend.repository.ProfessionalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final PatientRepository patientRepository;
    private final ProfessionalRepository professionalRepository;

    @Transactional
    public Consultation create(String patientCpf, Long professionalId, LocalDateTime scheduledAt) {
        Patient patient = patientRepository.findByCpf(patientCpf).orElseThrow(() -> new NotFoundException("Patient not found"));
        Professional professional = professionalRepository.findById(professionalId).orElseThrow(() -> new NotFoundException("Professional not found"));
        ensureNoConflict(professionalId, scheduledAt);
        return consultationRepository.save(new Consultation(patient, professional, scheduledAt));
    }

    @Transactional
    public void cancel(Long consultationId) {
        Consultation consultation = findConsultation(consultationId);
        if (consultation.getStatus() != ConsultationStatus.SCHEDULED) {
            throw new ConflictException("Only scheduled consultations can be cancelled");
        }
        consultation.cancel();
    }

    @Transactional
    public void reschedule(Long consultationId, LocalDateTime scheduledAt) {
        Consultation consultation = findConsultation(consultationId);
        if (consultation.getStatus() != ConsultationStatus.SCHEDULED) {
            throw new ConflictException("Only scheduled consultations can be rescheduled");
        }
        if (consultation.getScheduledAt().equals(scheduledAt)) {
            return;
        }
        ensureNoConflict(consultation.getProfessional().getId(), scheduledAt);
        consultation.reschedule(scheduledAt);
    }

    @Transactional(readOnly = true)
    public List<Consultation> findScheduledByDate(LocalDate date) {
        return consultationRepository.findAllByScheduledAtGreaterThanEqualAndScheduledAtLessThanAndStatusOrderByScheduledAtAsc(date.atStartOfDay(), date.plusDays(1).atStartOfDay(), ConsultationStatus.SCHEDULED);
    }

    @Transactional(readOnly = true)
    public Consultation findDetails(Long consultationId) {
        return consultationRepository.findWithPatientAndProfessionalById(consultationId).orElseThrow(() -> new NotFoundException("Consultation not found"));
    }

    private Consultation findConsultation(Long consultationId) {
        return consultationRepository.findById(consultationId).orElseThrow(() -> new NotFoundException("Consultation not found"));
    }

    private void ensureNoConflict(Long professionalId, LocalDateTime scheduledAt) {
        if (consultationRepository.hasConsultation(professionalId, scheduledAt)) {
            throw new ConflictException("Professional already has a consultation scheduled at this time");
        }
    }
}
