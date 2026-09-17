package com.mindproject.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Mind Project API")
                        .version("1.0")
                        .description("API do Mind Project para gerenciamento de pacientes e profissionais e acompanhamento do humor diário.")
                        .contact(new Contact().name("Mind Project Team")));
    }
}
