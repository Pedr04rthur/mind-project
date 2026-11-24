package com.mindproject.backend.controller.audit.dto;

import com.mindproject.backend.domain.entity.LogExclusao;

import java.time.LocalDateTime;

public record LogExclusaoResponse(
        Long id,
        String tabelaAfetada,
        Long registroId,
        String cpfAfetado,
        String responsavel,
        LocalDateTime dataExclusao
) {

    public static LogExclusaoResponse fromEntity(LogExclusao log) {

        return new LogExclusaoResponse(
                log.getId(),
                log.getTabelaAfetada(),
                log.getRegistroId(),
                log.getCpfAfetado(),
                log.getResponsavel(),
                log.getDataExclusao()
        );
    }
}
