package com.mindproject.backend.service.mood;

import com.mindproject.backend.domain.entity.Mood;
import com.mindproject.backend.domain.entity.Patient;
import com.mindproject.backend.domain.mood.MoodLevel;
import com.mindproject.backend.exception.BadRequestException;
import com.mindproject.backend.repository.MoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MoodService {

    private final MoodRepository repository;

    @Transactional
    public void save(MoodLevel level, String comment, Patient patient) {
        LocalDate now = LocalDate.now();
        boolean exists = repository.existsByPatientCpfAndDate(patient.getCpf(), now);
        if (exists) {
            throw new BadRequestException("Não é possivel enviar preencher o humor duas vezes no mesmo dia");
        }

        repository.save(new Mood(patient, comment, level));
    }

    @Transactional(readOnly = true)
    public List<Mood> findByPatientCpf(String patientCpf, boolean ascending) {
        Sort sort = ascending ? Sort.by("date", "id").ascending() : Sort.by("date", "id").descending();
        return repository.findAllByPatientCpf(patientCpf, sort);
    }
}
