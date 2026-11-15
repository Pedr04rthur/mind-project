package com.mindproject.backend.service.professional;

import com.mindproject.backend.domain.entity.Professional;
import com.mindproject.backend.exception.ConflictException;
import com.mindproject.backend.exception.NotFoundException;
import com.mindproject.backend.repository.ConsultationRepository;
import com.mindproject.backend.repository.ProfessionalRepository;
import com.mindproject.backend.repository.RefreshTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProfessionalServiceTest {

    @Mock
    private ProfessionalRepository professionalRepository;

    @Mock
    private ConsultationRepository consultationRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    private ProfessionalService professionalService;

    @BeforeEach
    void setUp() {
        professionalService = new ProfessionalService(professionalRepository, consultationRepository, refreshTokenRepository);
    }

    @Test
    void deleteRemovesProfessionalWithoutConsultations() {
        Professional professional = new Professional("Professional Name", "Psychology");
        when(professionalRepository.findById(1L)).thenReturn(Optional.of(professional));
        when(consultationRepository.existsByProfessional_Id(1L)).thenReturn(false);

        professionalService.delete(1L);

        verify(professionalRepository).delete(professional);
    }

    @Test
    void deleteRejectsProfessionalWithConsultations() {
        when(professionalRepository.findById(1L)).thenReturn(Optional.of(new Professional("Professional Name", "Psychology")));
        when(consultationRepository.existsByProfessional_Id(1L)).thenReturn(true);

        assertThrows(ConflictException.class, () -> professionalService.delete(1L));

        verify(professionalRepository, never()).delete(org.mockito.ArgumentMatchers.any(Professional.class));
    }

    @Test
    void deleteRejectsMissingProfessional() {
        when(professionalRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> professionalService.delete(1L));

        verify(consultationRepository, never()).existsByProfessional_Id(1L);
    }
}
