package com.mindproject.backend.repository;

import com.mindproject.backend.domain.entity.Mood;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface MoodRepository extends JpaRepository<Mood, Long> {

    boolean existsByPatientCpfAndDate(String patientCpf, LocalDate date);



}
