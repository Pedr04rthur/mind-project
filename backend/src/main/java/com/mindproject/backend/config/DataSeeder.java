package com.mindproject.backend.config;

import com.mindproject.backend.domain.entity.Patient;
import com.mindproject.backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Popula o banco com pacientes de teste ao subir.
 * Ativo em todos os profiles exceto "prod".
 * Remover quando a autenticação real existir.
 */
@Component
@RequiredArgsConstructor
@Profile("!prod")
public class DataSeeder implements CommandLineRunner {

    private final PatientRepository patientRepository;

    @Override
    public void run(String... args) {
        seed("52998224725", "Ana Carolina Souza",   "ana.souza@exemplo.com");
        seed("11144477735", "Bruno Tavares de Lima","bruno.lima@exemplo.com");
        seed("12345678909", "Carla Menezes Ribeiro","carla.ribeiro@exemplo.com");
    }

    private void seed(String cpf, String nome, String email) {
        if (patientRepository.existsByCpf(cpf)) return;
        patientRepository.save(new Patient(
                cpf, nome, "83999999999", email,
                "Rua Exemplo, 100 - João Pessoa/PB", "senha123"
        ));
    }
}
