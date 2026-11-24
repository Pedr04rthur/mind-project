package com.mindproject.backend.service.professional;

import com.mindproject.backend.domain.entity.Professional;
import com.mindproject.backend.exception.NotFoundException;
import com.mindproject.backend.exception.ConflictException;
import com.mindproject.backend.repository.ConsultationRepository;
import com.mindproject.backend.repository.ProfessionalRepository;
import com.mindproject.backend.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import com.mindproject.backend.service.audit.AuditService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfessionalService {

    private final AuditService auditService;

    private final ProfessionalRepository repository;
    private final ConsultationRepository consultationRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional(readOnly = true)
    public List<Professional> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Professional findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Professional not found"));
    }

    @Transactional
    public Professional create(String name, String specialty) {
        return repository.save(new Professional(name, specialty));
    }

    @Transactional
    public void delete(Long id) {
        Professional professional = findById(id);
        if (consultationRepository.existsByProfessional_Id(id)) {
            throw new ConflictException("Professional has related consultations and cannot be deleted");
        }
        if (professional.getAccount() != null) {
            refreshTokenRepository.deleteByAccount_Id(professional.getAccount().getId());
        }
        auditService.registrarProfissional(professional);
        repository.delete(professional);
    }
}
