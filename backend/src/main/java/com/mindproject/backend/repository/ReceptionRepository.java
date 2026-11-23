package com.mindproject.backend.repository;

import com.mindproject.backend.domain.entity.Reception;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReceptionRepository extends JpaRepository<Reception, Long> {

    Optional<Reception> findByAccountEmail(String email);
}
