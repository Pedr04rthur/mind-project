package com.mindproject.backend.service.prescription;

import com.mindproject.backend.domain.consultation.ConsultationStatus;
import com.mindproject.backend.domain.entity.Consultation;
import com.mindproject.backend.domain.entity.Prescription;
import com.mindproject.backend.domain.prescription.PrescriptionItemData;
import com.mindproject.backend.domain.prescription.PrescriptionStatus;
import com.mindproject.backend.exception.ConflictException;
import com.mindproject.backend.exception.NotFoundException;
import com.mindproject.backend.repository.ConsultationRepository;
import com.mindproject.backend.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final ConsultationRepository consultationRepository;
    private final PrescriptionRepository prescriptionRepository;

    @Transactional
    public Prescription create(Long consultationId, Long accountId, List<PrescriptionItemData> items, String instructions, String recommendations, String followUpInstructions) {
        Consultation consultation = findConsultation(consultationId);
        ensureAssignedProfessional(consultation, accountId);
        if (consultation.getStatus() == ConsultationStatus.CANCELLED) {
            throw new ConflictException("Prescriptions cannot be created for cancelled consultations");
        }
        return prescriptionRepository.save(new Prescription(consultation, items, instructions, recommendations, followUpInstructions));
    }

    @Transactional(readOnly = true)
    public List<Prescription> findAll(Long consultationId, Long accountId) {
        Consultation consultation = findConsultation(consultationId);
        ensureParticipant(consultation, accountId);
        return prescriptionRepository.findAllByConsultation_IdOrderByCreatedAtDesc(consultationId);
    }

    @Transactional(readOnly = true)
    public Prescription findById(Long consultationId, Long prescriptionId, Long accountId) {
        Consultation consultation = findConsultation(consultationId);
        ensureParticipant(consultation, accountId);
        return findPrescription(consultationId, prescriptionId);
    }

    @Transactional
    public Prescription update(Long consultationId, Long prescriptionId, Long accountId, List<PrescriptionItemData> items, String instructions, String recommendations, String followUpInstructions) {
        Consultation consultation = findConsultation(consultationId);
        ensureAssignedProfessional(consultation, accountId);
        Prescription prescription = findPrescription(consultationId, prescriptionId);
        ensureDraft(prescription);
        prescription.update(items, instructions, recommendations, followUpInstructions);
        return prescriptionRepository.save(prescription);
    }

    @Transactional
    public void issue(Long consultationId, Long prescriptionId, Long accountId) {
        Consultation consultation = findConsultation(consultationId);
        ensureAssignedProfessional(consultation, accountId);
        Prescription prescription = findPrescription(consultationId, prescriptionId);
        ensureDraft(prescription);
        prescription.issue();
    }

    @Transactional
    public void cancel(Long consultationId, Long prescriptionId, Long accountId) {
        Consultation consultation = findConsultation(consultationId);
        ensureAssignedProfessional(consultation, accountId);
        Prescription prescription = findPrescription(consultationId, prescriptionId);
        if (prescription.getStatus() == PrescriptionStatus.CANCELLED) {
            return;
        }
        prescription.cancel();
    }

    private Consultation findConsultation(Long consultationId) {
        return consultationRepository.findWithPatientAndProfessionalById(consultationId).orElseThrow(() -> new NotFoundException("Consultation not found"));
    }

    private Prescription findPrescription(Long consultationId, Long prescriptionId) {
        return prescriptionRepository.findByIdAndConsultation_Id(prescriptionId, consultationId).orElseThrow(() -> new NotFoundException("Prescription not found"));
    }

    private void ensureParticipant(Consultation consultation, Long accountId) {
        boolean patient = consultation.getPatient().getAccount().getId().equals(accountId);
        boolean professional = consultation.getProfessional().getAccount() != null && consultation.getProfessional().getAccount().getId().equals(accountId);
        if (!patient && !professional) {
            throw new NotFoundException("Consultation not found");
        }
    }

    private void ensureAssignedProfessional(Consultation consultation, Long accountId) {
        if (consultation.getProfessional().getAccount() == null || !consultation.getProfessional().getAccount().getId().equals(accountId)) {
            throw new NotFoundException("Consultation not found");
        }
    }

    private void ensureDraft(Prescription prescription) {
        if (prescription.getStatus() != PrescriptionStatus.DRAFT) {
            throw new ConflictException("Only draft prescriptions can be changed or issued");
        }
    }
}
