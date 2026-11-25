package com.mindproject.backend.repository;

import com.mindproject.backend.domain.entity.LogExclusao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface LogExclusaoRepository
        extends JpaRepository<LogExclusao, Long>,
                JpaSpecificationExecutor<LogExclusao> {
}
