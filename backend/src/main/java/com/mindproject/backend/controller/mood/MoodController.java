package com.mindproject.backend.controller.mood;

import com.mindproject.backend.controller.mood.dto.MoodLogRequest;
import com.mindproject.backend.controller.mood.dto.MoodResponse;
import com.mindproject.backend.domain.entity.Patient;
import com.mindproject.backend.service.mood.MoodService;
import com.mindproject.backend.service.patient.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/patients/{cpf}/moods")
@RequiredArgsConstructor
public class MoodController {

    private final MoodService moodService;
    private final PatientService patientService;

    @PostMapping
    public ResponseEntity<Void> logMood(@PathVariable String cpf, @RequestBody @Valid MoodLogRequest request) {
        Patient patient = patientService.findByCpf(cpf);
        moodService.save(request.moodLevel(), request.comment(), patient);
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @GetMapping
    public ResponseEntity<List<MoodResponse>> findByPatientCpf(@PathVariable String cpf, @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        patientService.findByCpf(cpf);
        return ResponseEntity.status(HttpStatus.OK).body(moodService.findByPatientCpf(cpf, direction.isAscending()).stream().map(MoodResponse::fromEntity).toList());
    }
}
