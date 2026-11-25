package com.mindproject.backend.service.prescription;

import com.mindproject.backend.domain.consultation.ConsultationStatus;
import com.mindproject.backend.domain.entity.Consultation;
import com.mindproject.backend.domain.entity.Prescription;
import com.mindproject.backend.domain.prescription.PrescriptionItemData;
import com.mindproject.backend.domain.prescription.PrescriptionStatus;
import com.mindproject.backend.domain.prescription.PrescriptionType;
import com.mindproject.backend.exception.ConflictException;
import com.mindproject.backend.exception.NotFoundException;
import com.mindproject.backend.repository.ConsultationRepository;
import com.mindproject.backend.repository.PrescriptionRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final ConsultationRepository consultationRepository;
    private final PrescriptionRepository prescriptionRepository;

    @Transactional
    public Prescription create(
            Long consultationId,
            Long accountId,
            PrescriptionType type,
            List<PrescriptionItemData> items,
            String instructions,
            String recommendations,
            String followUpInstructions
    ) {

        Consultation consultation = findConsultation(consultationId);

        ensureAssignedProfessional(consultation, accountId);
        ensureActiveConsultation(consultation);
        ensurePermission(consultation, type);

        validateContent(
                type,
                items,
                instructions,
                recommendations,
                followUpInstructions
        );

        return prescriptionRepository.save(
                new Prescription(
                        consultation,
                        type,
                        items,
                        instructions,
                        recommendations,
                        followUpInstructions
                )
        );
    }

    @Transactional(readOnly = true)
    public List<Prescription> findAll(
            Long consultationId,
            Long accountId
    ) {

        Consultation consultation = findConsultation(consultationId);

        ensureParticipant(consultation, accountId);

        List<Prescription> prescriptions =
                prescriptionRepository
                        .findAllByConsultation_IdOrderByCreatedAtDesc(
                                consultationId
                        );

        if (isPatient(consultation, accountId)) {
            return prescriptions.stream()
                    .filter(this::isVisibleToPatient)
                    .toList();
        }

        return prescriptions;
    }

    @Transactional(readOnly = true)
    public Prescription findById(
            Long consultationId,
            Long prescriptionId,
            Long accountId
    ) {

        Consultation consultation = findConsultation(consultationId);

        ensureParticipant(consultation, accountId);

        Prescription prescription = findPrescription(
                consultationId,
                prescriptionId
        );

        if (isPatient(consultation, accountId)
                && !isVisibleToPatient(prescription)) {
            throw new NotFoundException("Prescription not found");
        }

        return prescription;
    }

    @Transactional
    public Prescription update(
            Long consultationId,
            Long prescriptionId,
            Long accountId,
            PrescriptionType type,
            List<PrescriptionItemData> items,
            String instructions,
            String recommendations,
            String followUpInstructions
    ) {

        Consultation consultation = findConsultation(consultationId);

        ensureAssignedProfessional(consultation, accountId);
        ensureActiveConsultation(consultation);

        Prescription prescription = findPrescription(
                consultationId,
                prescriptionId
        );

        ensureDraft(prescription);

        if (prescription.getType() != type) {
            throw new ConflictException(
                    "Não é permitido alterar o tipo da prescrição."
            );
        }

        ensurePermission(consultation, type);

        validateContent(
                type,
                items,
                instructions,
                recommendations,
                followUpInstructions
        );

        prescription.update(
                items,
                instructions,
                recommendations,
                followUpInstructions
        );

        return prescriptionRepository.save(prescription);
    }

    @Transactional
    public void issue(
            Long consultationId,
            Long prescriptionId,
            Long accountId
    ) {

        Consultation consultation = findConsultation(consultationId);

        ensureAssignedProfessional(consultation, accountId);
        ensureActiveConsultation(consultation);

        Prescription prescription = findPrescription(
                consultationId,
                prescriptionId
        );

        ensureDraft(prescription);
        ensurePermission(consultation, prescription.getType());

        prescription.issue();
    }

    @Transactional
    public void cancel(
            Long consultationId,
            Long prescriptionId,
            Long accountId
    ) {

        Consultation consultation = findConsultation(consultationId);

        ensureAssignedProfessional(consultation, accountId);

        Prescription prescription = findPrescription(
                consultationId,
                prescriptionId
        );

        ensurePermission(consultation, prescription.getType());

        if (prescription.getStatus() == PrescriptionStatus.CANCELLED) {
            return;
        }

        prescription.cancel();
    }

    private void validateContent(
            PrescriptionType type,
            List<PrescriptionItemData> items,
            String instructions,
            String recommendations,
            String followUpInstructions
    ) {

        if (type == null || items == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe o tipo e a lista de itens."
            );
        }

        if (type == PrescriptionType.MEDICATION) {

            if (items.isEmpty()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Informe pelo menos um medicamento."
                );
            }

            return;
        }

        if (!items.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Este tipo de prescrição não pode conter medicamentos."
            );
        }

        switch (type) {

            case EXAM -> {
                if (isBlank(instructions)) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Informe o exame solicitado."
                    );
                }
            }

            case COUNSELING -> {
                if (isBlank(instructions)) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Descreva o aconselhamento."
                    );
                }
            }

            case EXERCISE -> {
                if (isBlank(recommendations)
                        || isBlank(followUpInstructions)) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Informe o exercício e sua frequência ou duração."
                    );
                }
            }

            case THERAPEUTIC -> {
                if (isBlank(instructions)
                        && isBlank(recommendations)
                        && isBlank(followUpInstructions)) {

                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Informe pelo menos uma orientação terapêutica."
                    );
                }
            }

            default -> throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tipo de prescrição inválido."
            );
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private void ensurePermission(
            Consultation consultation,
            PrescriptionType type
    ) {

        if (type == PrescriptionType.EXAM) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "A solicitação de exames ainda não está habilitada."
            );
        }

        if (type == PrescriptionType.THERAPEUTIC
                || type == PrescriptionType.COUNSELING
                || type == PrescriptionType.EXERCISE) {
            return;
        }

        String specialty = consultation
                .getProfessional()
                .getSpecialty();

        String normalized = Normalizer.normalize(
                        specialty == null ? "" : specialty,
                        Normalizer.Form.NFD
                )
                .replaceAll("\\p{M}", "")
                .trim()
                .toLowerCase(Locale.ROOT);

        boolean psychiatrist =
                normalized.equals("psiquiatria")
                        || normalized.equals("psiquiatria clinica");

        // Restrição provisória por especialidade.
        // Substituir pela validação efetiva do CRM.

        if (!psychiatrist) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Permissão negada. A prescrição medicamentosa exige CRM."
            );
        }
    }

    private boolean isVisibleToPatient(Prescription prescription) {

        return prescription.getStatus() == PrescriptionStatus.ISSUED
                || (
                    prescription.getStatus() == PrescriptionStatus.CANCELLED
                    && prescription.getIssuedAt() != null
                );
    }

    private boolean isPatient(
            Consultation consultation,
            Long accountId
    ) {

        return consultation.getPatient()
                .getAccount()
                .getId()
                .equals(accountId);
    }

    private void ensureActiveConsultation(Consultation consultation) {

        if (consultation.getStatus() == ConsultationStatus.CANCELLED) {

            throw new ConflictException(
                    "Não é possível alterar registros de consultas canceladas."
            );
        }
    }

    private Consultation findConsultation(Long consultationId) {

        return consultationRepository
                .findWithPatientAndProfessionalById(consultationId)
                .orElseThrow(
                        () -> new NotFoundException("Consultation not found")
                );
    }

    private Prescription findPrescription(
            Long consultationId,
            Long prescriptionId
    ) {

        return prescriptionRepository
                .findByIdAndConsultation_Id(
                        prescriptionId,
                        consultationId
                )
                .orElseThrow(
                        () -> new NotFoundException("Prescription not found")
                );
    }

    private void ensureParticipant(
            Consultation consultation,
            Long accountId
    ) {

        boolean patient = isPatient(consultation, accountId);

        boolean professional =
                consultation.getProfessional().getAccount() != null
                        && consultation.getProfessional()
                        .getAccount()
                        .getId()
                        .equals(accountId);

        if (!patient && !professional) {
            throw new NotFoundException("Consultation not found");
        }
    }

    private void ensureAssignedProfessional(
            Consultation consultation,
            Long accountId
    ) {

        if (consultation.getProfessional().getAccount() == null
                || !consultation.getProfessional()
                .getAccount()
                .getId()
                .equals(accountId)) {

            throw new NotFoundException("Consultation not found");
        }
    }

    private void ensureDraft(Prescription prescription) {

        if (prescription.getStatus() != PrescriptionStatus.DRAFT) {

            throw new ConflictException(
                    "Somente registros em rascunho podem ser alterados ou emitidos."
            );
        }
    }
}