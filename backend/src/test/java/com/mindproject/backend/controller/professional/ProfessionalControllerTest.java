package com.mindproject.backend.controller.professional;

import com.mindproject.backend.domain.entity.Professional;
import com.mindproject.backend.service.professional.ProfessionalService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProfessionalControllerTest {

    @Mock
    private ProfessionalService professionalService;

    private ProfessionalController professionalController;

    @BeforeEach
    void setUp() {
        professionalController = new ProfessionalController(professionalService);
    }

    @Test
    void deleteReturnsNoContentAndPassesIdToService() {
        assertEquals(HttpStatus.NO_CONTENT, professionalController.delete(1L).getStatusCode());

        verify(professionalService).delete(1L);
    }

    @Test
    void findByIdReturnsProfessionalResponse() {
        when(professionalService.findById(1L)).thenReturn(new Professional("Professional Name", "Psychology"));

        var response = professionalController.findById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Professional Name", response.getBody().name());
        assertEquals("Psychology", response.getBody().specialty());
    }
}
