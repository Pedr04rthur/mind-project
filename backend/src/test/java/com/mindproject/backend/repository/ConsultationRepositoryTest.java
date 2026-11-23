package com.mindproject.backend.repository;

import com.mindproject.backend.domain.entity.Account;
import com.mindproject.backend.domain.entity.Consultation;
import com.mindproject.backend.domain.entity.Patient;
import com.mindproject.backend.domain.entity.Professional;
import com.mindproject.backend.domain.entity.Mood;
import com.mindproject.backend.domain.entity.Triage;
import com.mindproject.backend.domain.entity.RefreshToken;
import com.mindproject.backend.domain.mood.MoodLevel;
import com.mindproject.backend.domain.triage.TriagePriority;
import com.mindproject.backend.exception.ConflictException;
import com.mindproject.backend.service.patient.PatientService;
import com.mindproject.backend.service.professional.ProfessionalService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
class ConsultationRepositoryTest {

    @Autowired
    private ConsultationRepository consultationRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private ProfessionalRepository professionalRepository;

    @Autowired
    private MoodRepository moodRepository;

    @Autowired
    private TriageRepository triageRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PatientService patientService;

    @Autowired
    private ProfessionalService professionalService;

    @Test
    void findAllByAccountIdAndDateRangeFiltersByAccountAndIncludesWholeEndDate() {
        Patient patient = patientRepository.save(new Patient("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password"));
        Patient unrelatedPatient = patientRepository.save(new Patient("10987654321", "Other Patient", "11888888888", "other@example.com", "Address", "password"));
        Professional professional = professionalRepository.save(new Professional("Professional Name", "Psychology", new Account("professional@example.com", "password")));
        Professional otherProfessional = professionalRepository.save(new Professional("Other Professional", "Psychology", new Account("other-professional@example.com", "password")));
        Consultation first = consultationRepository.save(new Consultation(patient, otherProfessional, LocalDateTime.of(2026, 10, 21, 0, 0)));
        Consultation last = consultationRepository.save(new Consultation(unrelatedPatient, professional, LocalDateTime.of(2026, 10, 25, 23, 59)));
        consultationRepository.save(new Consultation(unrelatedPatient, otherProfessional, LocalDateTime.of(2026, 10, 25, 23, 59)));
        consultationRepository.save(new Consultation(patient, otherProfessional, LocalDateTime.of(2026, 10, 26, 0, 0)));

        List<Consultation> results = consultationRepository.findAllByAccountIdAndDateRange(patient.getAccount().getId(), LocalDate.of(2026, 10, 21).atStartOfDay(), LocalDate.of(2026, 10, 25).plusDays(1).atStartOfDay());

        assertEquals(List.of(first.getId()), results.stream().map(Consultation::getId).toList());

        List<Consultation> professionalResults = consultationRepository.findAllByAccountIdAndDateRange(professional.getAccount().getId(), null, null);
        assertEquals(List.of(last.getId()), professionalResults.stream().map(Consultation::getId).toList());
    }

    @Test
    void findAllByAccountIdAndDateRangeReturnsAllStatusesWhenDatesAreOmitted() {
        Patient patient = patientRepository.save(new Patient("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password"));
        Professional professional = professionalRepository.save(new Professional("Professional Name", "Psychology"));
        Consultation scheduled = consultationRepository.save(new Consultation(patient, professional, LocalDateTime.of(2026, 10, 21, 10, 0)));
        Consultation cancelled = consultationRepository.save(new Consultation(patient, professional, LocalDateTime.of(2026, 10, 22, 10, 0)));
        cancelled.cancel();

        List<Consultation> results = consultationRepository.findAllByAccountIdAndDateRange(patient.getAccount().getId(), null, null);

        assertEquals(2, results.size());
        assertTrue(results.stream().anyMatch(consultation -> consultation.getId().equals(scheduled.getId())));
        assertTrue(results.stream().anyMatch(consultation -> consultation.getId().equals(cancelled.getId())));
    }

    @Test
    void relatedRecordQueriesDetectPatientAndProfessionalDependencies() {
        Patient patient = patientRepository.save(new Patient("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password"));
        Professional professional = professionalRepository.save(new Professional("Professional Name", "Psychology"));
        consultationRepository.save(new Consultation(patient, professional, LocalDateTime.of(2026, 10, 21, 10, 0)));
        moodRepository.save(new Mood(patient, "Comment", MoodLevel.GOOD));
        triageRepository.save(new Triage(patient, "Concern", "Symptoms", true, "Medication", TriagePriority.ROUTINE, "Notes", "Receptionist"));

        assertTrue(consultationRepository.existsByPatient_Id(patient.getId()));
        assertTrue(consultationRepository.existsByProfessional_Id(professional.getId()));
        assertTrue(moodRepository.existsByPatient_Id(patient.getId()));
        assertTrue(triageRepository.existsByPatient_Id(patient.getId()));
    }

    @Test
    void deletePatientRemovesRefreshTokensWhenNoClinicalRecordsExist() {
        Patient patient = patientRepository.save(new Patient("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password"));
        refreshTokenRepository.save(RefreshToken.builder().token("patient-refresh-token").expiryDate(Instant.now().plusSeconds(3600)).account(patient.getAccount()).build());

        patientService.delete("12345678901");

        assertTrue(patientRepository.findByCpf("12345678901").isEmpty());
        assertTrue(refreshTokenRepository.findByToken("patient-refresh-token").isEmpty());
    }

    @Test
    void deletePatientReturnsConflictAndPreservesClinicalRecords() {
        Patient patient = patientRepository.save(new Patient("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password"));
        moodRepository.save(new Mood(patient, "Comment", MoodLevel.GOOD));

        assertThrows(ConflictException.class, () -> patientService.delete("12345678901"));

        assertTrue(patientRepository.findByCpf("12345678901").isPresent());
        assertTrue(moodRepository.existsByPatient_Id(patient.getId()));
    }

    @Test
    void deleteProfessionalRemovesRefreshTokensWhenNoConsultationsExist() {
        Professional professional = professionalRepository.save(new Professional("Professional Name", "Psychology", new Account("professional@example.com", "password")));
        refreshTokenRepository.save(RefreshToken.builder().token("professional-refresh-token").expiryDate(Instant.now().plusSeconds(3600)).account(professional.getAccount()).build());

        professionalService.delete(professional.getId());

        assertTrue(professionalRepository.findById(professional.getId()).isEmpty());
        assertTrue(refreshTokenRepository.findByToken("professional-refresh-token").isEmpty());
    }

    @Test
    void deleteProfessionalReturnsConflictWhenConsultationsExist() {
        Patient patient = patientRepository.save(new Patient("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password"));
        Professional professional = professionalRepository.save(new Professional("Professional Name", "Psychology"));
        consultationRepository.save(new Consultation(patient, professional, LocalDateTime.of(2026, 10, 21, 10, 0)));

        assertThrows(ConflictException.class, () -> professionalService.delete(professional.getId()));

        assertTrue(professionalRepository.findById(professional.getId()).isPresent());
    }
}
