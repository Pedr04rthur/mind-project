package com.mindproject.backend.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "log_exclusoes")
@Getter
@NoArgsConstructor
public class LogExclusao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String tabelaAfetada;

    @Column(nullable = false)
    private Long registroId;

    @Column(length = 11)
    private String cpfAfetado;

    @Column(nullable = false, length = 254)
    private String responsavel;

    @Lob
    @Column(nullable = false)
    private String dadosDeletados;

    @Column(nullable = false)
    private LocalDateTime dataExclusao;

    public LogExclusao(
            String tabelaAfetada,
            Long registroId,
            String cpfAfetado,
            String responsavel,
            String dadosDeletados
    ) {
        this.tabelaAfetada = tabelaAfetada;
        this.registroId = registroId;
        this.cpfAfetado = cpfAfetado;
        this.responsavel = responsavel;
        this.dadosDeletados = dadosDeletados;
        this.dataExclusao = LocalDateTime.now();
    }
}
