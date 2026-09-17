package com.mindproject.backend.service.mood;

import com.mindproject.backend.domain.entity.Mood;
import com.mindproject.backend.domain.entity.Patient;
import com.mindproject.backend.domain.mood.MoodLevel;
import com.mindproject.backend.exception.BadRequestException;
import com.mindproject.backend.repository.MoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class MoodService {

    private final MoodRepository repository;

    @Transactional
    public void save(MoodLevel level, String comment, Patient patient) {

        LocalDate now =  LocalDate.now();

        boolean exists = repository.existsByPatientCpfAndDate(patient.getCpf(), now);
        if (exists) {
            throw new BadRequestException("Não é possivel enviar preencher o humor duas vezes no mesmo dia");
        }

        repository.save(new Mood(patient, comment, level));
    }

    public Page<Mood> findByPatientCpf(String cpf, Pageable pageable) {
        return repository.findByPatientCpf(cpf, pageable);
    }
}
