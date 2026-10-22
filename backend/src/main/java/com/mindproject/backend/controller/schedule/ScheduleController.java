package com.mindproject.backend.controller.schedule;

import com.mindproject.backend.controller.schedule.dto.ScheduleItemResponse;
import com.mindproject.backend.service.consultation.ConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/schedule")
@RequiredArgsConstructor
public class ScheduleController {

    private final ConsultationService consultationService;

    @GetMapping
    public ResponseEntity<List<ScheduleItemResponse>> findByDate(@RequestParam("date") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate date) {
        return ResponseEntity.status(HttpStatus.OK).body(consultationService.findScheduledByDate(date).stream().map(ScheduleItemResponse::fromEntity).toList());
    }
}
