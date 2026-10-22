package com.mindproject.backend.service.professional;

import com.mindproject.backend.domain.entity.Professional;
import com.mindproject.backend.exception.NotFoundException;
import com.mindproject.backend.repository.ProfessionalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfessionalService {

    private final ProfessionalRepository repository;

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
}
