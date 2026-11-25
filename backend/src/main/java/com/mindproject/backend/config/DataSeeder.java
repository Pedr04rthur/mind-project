package com.mindproject.backend.config;

import com.mindproject.backend.domain.entity.Account;
import com.mindproject.backend.domain.entity.Consultation;
import com.mindproject.backend.domain.entity.Mood;
import com.mindproject.backend.domain.entity.Patient;
import com.mindproject.backend.domain.entity.Professional;
import com.mindproject.backend.domain.entity.Reception;
import com.mindproject.backend.domain.mood.MoodLevel;
import com.mindproject.backend.repository.ConsultationRepository;
import com.mindproject.backend.repository.MoodRepository;
import com.mindproject.backend.repository.PatientRepository;
import com.mindproject.backend.repository.ProfessionalRepository;
import com.mindproject.backend.repository.ReceptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final ReceptionRepository receptionRepository;
    private final ConsultationRepository consultationRepository;
    private final MoodRepository moodRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedPatients();
        seedProfessionalsWithAccounts();
        seedReceptionWithAccount();
        seedConsultations();
        seedMoods();
    }

    private void seedPatients() {
        if (patientRepository.count() > 0) return;

        // O construtor do Patient JÁ cria a Account interna (transient).
        // CascadeType.ALL no @OneToOne salva a Account junto.
        patientRepository.save(new Patient(
                "52998224725", "Ana Carolina Souza", "83988881122",
                "ana.souza@exemplo.com", "Rua das Acacias, 120 - Joao Pessoa/PB",
                passwordEncoder.encode("senha123")));

        patientRepository.save(new Patient(
                "11144477735", "Bruno Tavares de Lima", "83977773344",
                "bruno.lima@exemplo.com", "Av. Epitacio Pessoa, 800 - Joao Pessoa/PB",
                passwordEncoder.encode("senha123")));

        patientRepository.save(new Patient(
                "12345678909", "Carla Menezes Ribeiro", "83966665566",
                "carla.ribeiro@exemplo.com", "Rua do Sol, 45 - Campina Grande/PB",
                passwordEncoder.encode("senha123")));
    }

    private void seedProfessionalsWithAccounts() {
        if (professionalRepository.count() > 0) return;

        // ATENÇÃO: NÃO salvar a Account antes. Deixar o cascade do Professional salvar.
        // Se salvar antes (accountRepository.save), Hibernate lança
        // "Detached entity passed to persist".
        Account marinaAcc = new Account("marina.alencar@mindcare.com", passwordEncoder.encode("senha123"));
        Account rodrigoAcc = new Account("rodrigo.bem@mindcare.com", passwordEncoder.encode("senha123"));

        professionalRepository.save(new Professional("Dra. Marina Alencar", "Psiquiatria Clinica", marinaAcc));
        professionalRepository.save(new Professional("Dr. Rodrigo Bem", "Terapia Cognitivo-Comportamental", rodrigoAcc));
    }

    private void seedReceptionWithAccount() {
        if (receptionRepository.count() > 0) return;

        // O construtor do Reception cria a Account interna.
        receptionRepository.save(new Reception(
                "recepcao@mindcare.com",
                passwordEncoder.encode("senha123"),
                "Recepcao MindCare"));
    }

    private void seedConsultations() {
        if (consultationRepository.count() > 0) return;

        Patient ana = patientRepository.findByCpf("52998224725").orElseThrow();
        Patient bruno = patientRepository.findByCpf("11144477735").orElseThrow();
        Patient carla = patientRepository.findByCpf("12345678909").orElseThrow();

        var professionals = professionalRepository.findAll();
        if (professionals.size() < 2) return;

        Professional marina = professionals.get(0);
        Professional rodrigo = professionals.get(1);

        LocalDate hoje = LocalDate.now();
        LocalDate amanha = hoje.plusDays(1);

        consultationRepository.save(new Consultation(ana, marina, LocalDateTime.of(hoje, LocalTime.of(9, 0))));
        consultationRepository.save(new Consultation(bruno, rodrigo, LocalDateTime.of(hoje, LocalTime.of(14, 0))));
        consultationRepository.save(new Consultation(carla, marina, LocalDateTime.of(amanha, LocalTime.of(10, 30))));
    }

    private void seedMoods() {
        if (moodRepository.count() > 0) return;

        Patient ana = patientRepository.findByCpf("52998224725").orElseThrow();
        Patient bruno = patientRepository.findByCpf("11144477735").orElseThrow();
        Patient carla = patientRepository.findByCpf("12345678909").orElseThrow();

        LocalDate hoje = LocalDate.now();

        Mood ana1 = new Mood(ana, "Dia dificil, ansiedade muito alta", MoodLevel.BAD);
        ana1.setDate(hoje.minusDays(2));
        moodRepository.save(ana1);

        Mood ana2 = new Mood(ana, "Nao dormi bem", MoodLevel.BAD);
        ana2.setDate(hoje.minusDays(1));
        moodRepository.save(ana2);

        Mood ana3 = new Mood(ana, "Continuo me sentindo mal", MoodLevel.BAD);
        ana3.setDate(hoje);
        moodRepository.save(ana3);

        Mood bruno1 = new Mood(bruno, "Dia produtivo", MoodLevel.GOOD);
        bruno1.setDate(hoje.minusDays(1));
        moodRepository.save(bruno1);

        Mood bruno2 = new Mood(bruno, "Tarde cansativa", MoodLevel.BAD);
        bruno2.setDate(hoje);
        moodRepository.save(bruno2);

        Mood carla1 = new Mood(carla, "Me sentindo bem", MoodLevel.GOOD);
        carla1.setDate(hoje.minusDays(1));
        moodRepository.save(carla1);

        Mood carla2 = new Mood(carla, "Otimo dia", MoodLevel.GOOD);
        carla2.setDate(hoje);
        moodRepository.save(carla2);
    }
}
