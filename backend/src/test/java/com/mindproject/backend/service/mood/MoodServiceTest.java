package com.mindproject.backend.service.mood;

import com.mindproject.backend.domain.entity.Mood;
import com.mindproject.backend.domain.entity.Patient;
import com.mindproject.backend.domain.mood.MoodLevel;
import com.mindproject.backend.exception.BadRequestException;
import com.mindproject.backend.repository.MoodRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MoodServiceTest {

    @Mock
    private MoodRepository moodRepository;

    private MoodService moodService;

    @BeforeEach
    void setUp() {
        moodService = new MoodService(moodRepository);
    }

    @Test
    void saveCreatesMoodForToday() {
        Patient patient = new Patient("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password");
        when(moodRepository.existsByPatientCpfAndDate("12345678901", LocalDate.now())).thenReturn(false);

        moodService.save(MoodLevel.GOOD, "Feeling well", patient);

        ArgumentCaptor<Mood> moodCaptor = ArgumentCaptor.forClass(Mood.class);
        verify(moodRepository).save(moodCaptor.capture());
        assertSame(patient, moodCaptor.getValue().getPatient());
        assertEquals(MoodLevel.GOOD, moodCaptor.getValue().getLevel());
        assertEquals("Feeling well", moodCaptor.getValue().getComment());
        assertEquals(LocalDate.now(), moodCaptor.getValue().getDate());
    }

    @Test
    void saveRejectsSecondMoodOnSameDay() {
        Patient patient = new Patient("12345678901", "Patient Name", "11999999999", "patient@example.com", "Address", "password");
        when(moodRepository.existsByPatientCpfAndDate("12345678901", LocalDate.now())).thenReturn(true);

        assertThrows(BadRequestException.class, () -> moodService.save(MoodLevel.BAD, "Feeling unwell", patient));

        verify(moodRepository, never()).save(org.mockito.ArgumentMatchers.any(Mood.class));
    }

    @Test
    void findByPatientCpfUsesAscendingDateAndIdSort() {
        List<Mood> moods = List.of(new Mood(new Patient(), null, MoodLevel.GOOD));
        Sort sort = Sort.by("date", "id").ascending();
        when(moodRepository.findAllByPatientCpf("12345678901", sort)).thenReturn(moods);

        assertSame(moods, moodService.findByPatientCpf("12345678901", true));

        verify(moodRepository).findAllByPatientCpf(eq("12345678901"), eq(sort));
    }

    @Test
    void findByPatientCpfUsesDescendingDateAndIdSort() {
        List<Mood> moods = List.of(new Mood(new Patient(), null, MoodLevel.BAD));
        Sort sort = Sort.by("date", "id").descending();
        when(moodRepository.findAllByPatientCpf("12345678901", sort)).thenReturn(moods);

        assertSame(moods, moodService.findByPatientCpf("12345678901", false));

        verify(moodRepository).findAllByPatientCpf(eq("12345678901"), eq(sort));
    }
}
