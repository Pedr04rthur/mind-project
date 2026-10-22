package com.mindproject.backend.repository;

import com.mindproject.backend.domain.entity.Mood;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MoodRepository extends JpaRepository<Mood, Long> {

    boolean existsByPatientCpfAndDate(String patientCpf, LocalDate date);
    List<Mood> findAllByPatientCpf(String patientCpf, Sort sort);
}
