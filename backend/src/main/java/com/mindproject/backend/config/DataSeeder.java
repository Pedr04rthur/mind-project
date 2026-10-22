package com.mindproject.backend.config;

import com.mindproject.backend.domain.entity.Consultation;
import com.mindproject.backend.domain.entity.Mood;
import com.mindproject.backend.domain.entity.Patient;
import com.mindproject.backend.domain.entity.Professional;
import com.mindproject.backend.domain.mood.MoodLevel;
import com.mindproject.backend.repository.ConsultationRepository;
import com.mindproject.backend.repository.MoodRepository;
import com.mindproject.backend.repository.PatientRepository;
import com.mindproject.backend.repository.ProfessionalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Component
@RequiredArgsConstructor
@Profile("!prod")
public class DataSeeder implements CommandLineRunner {

    private final PatientRepository patientRepository;
    private final ProfessionalRepository professionalRepository;
    private final ConsultationRepository consultationRepository;
    private final MoodRepository moodRepository;

    @Override
    public void run(String... args) {
        seedPatients();
        seedProfessionals();
        seedConsultations();
        seedMoods();
    }

    private void seedPatients() {
        if (patientRepository.count() > 0) return;
        patientRepository.save(new Patient("52998224725", "Ana Carolina Souza", "83988881122", "ana.souza@exemplo.com", "Rua das Acacias, 120 - Joao Pessoa/PB", "senha123"));
        patientRepository.save(new Patient("11144477735", "Bruno Tavares de Lima", "83977773344", "bruno.lima@exemplo.com", "Av. Epitacio Pessoa, 800 - Joao Pessoa/PB", "senha123"));
        patientRepository.save(new Patient("12345678909", "Carla Menezes Ribeiro", "83966665566", "carla.ribeiro@exemplo.com", "Rua do Sol, 45 - Campina Grande/PB", "senha123"));
    }

    private void seedProfessionals() {
        if (professionalRepository.count() > 0) return;
        professionalRepository.save(new Professional("Dra. Marina Alencar", "Psiquiatria Clinica"));
        professionalRepository.save(new Professional("Dr. Rodrigo Bem", "Terapia Cognitivo-Comportamental"));
        professionalRepository.save(new Professional("Dra. Camila Torres", "Psicologia Infantil"));
    }

    private void seedConsultations() {
        if (consultationRepository.count() > 0) return;

        Patient ana = patientRepository.findByCpf("52998224725").orElseThrow();
        Patient bruno = patientRepository.findByCpf("11144477735").orElseThrow();
        Patient carla = patientRepository.findByCpf("12345678909").orElseThrow();

        Professional marina = professionalRepository.findById(1L).orElseThrow();
        Professional rodrigo = professionalRepository.findById(2L).orElseThrow();
        Professional camila = professionalRepository.findById(3L).orElseThrow();

        LocalDate hoje = LocalDate.now();
        LocalDate amanha = hoje.plusDays(1);
        LocalDate depoisAmanha = hoje.plusDays(2);

        consultationRepository.save(new Consultation(ana, marina, LocalDateTime.of(hoje, LocalTime.of(9, 0))));
        consultationRepository.save(new Consultation(bruno, rodrigo, LocalDateTime.of(hoje, LocalTime.of(14, 0))));
        consultationRepository.save(new Consultation(carla, camila, LocalDateTime.of(amanha, LocalTime.of(10, 30))));
        consultationRepository.save(new Consultation(ana, marina, LocalDateTime.of(depoisAmanha, LocalTime.of(15, 0))));
    }

    private void seedMoods() {
        if (moodRepository.count() > 0) return;

        Patient ana = patientRepository.findByCpf("52998224725").orElseThrow();
        Patient bruno = patientRepository.findByCpf("11144477735").orElseThrow();
        Patient carla = patientRepository.findByCpf("12345678909").orElseThrow();

        LocalDate hoje = LocalDate.now();

        // Ana: 3 dias seguidos com BAD -> ALERTA ALTO
        Mood ana1 = new Mood(ana, "Dia dificil, ansiedade muito alta", MoodLevel.BAD);
        ana1.setDate(hoje.minusDays(2));
        moodRepository.save(ana1);

        Mood ana2 = new Mood(ana, "Nao dormi bem, muita tensao no trabalho", MoodLevel.BAD);
        ana2.setDate(hoje.minusDays(1));
        moodRepository.save(ana2);

        Mood ana3 = new Mood(ana, "Continuo me sentindo mal, sem energia", MoodLevel.BAD);
        ana3.setDate(hoje);
        moodRepository.save(ana3);

        // Bruno: 1 GOOD + 1 BAD -> ATENCAO MEDIO
        Mood bruno1 = new Mood(bruno, "Dia produtivo, me senti bem", MoodLevel.GOOD);
        bruno1.setDate(hoje.minusDays(1));
        moodRepository.save(bruno1);

        Mood bruno2 = new Mood(bruno, "Tarde cansativa, cabeca pesada", MoodLevel.BAD);
        bruno2.setDate(hoje);
        moodRepository.save(bruno2);

        // Carla: 2 GOOD -> SEM ALERTA
        Mood carla1 = new Mood(carla, "Me sentindo bem, dia tranquilo", MoodLevel.GOOD);
        carla1.setDate(hoje.minusDays(1));
        moodRepository.save(carla1);

        Mood carla2 = new Mood(carla, "Otimo dia, conversei com amigos", MoodLevel.GOOD);
        carla2.setDate(hoje);
        moodRepository.save(carla2);
    }
}
