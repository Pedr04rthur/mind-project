package com.mindproject.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;

@Configuration 
public class OpenAPIConfig {
    

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Mind Project API")
                        .version("1.0")
                        .description("API do sistema Mind Project para acompanhamento do humor de pacientes.")
                        .contact(new Contact().name("Mind Project Team")));
    }


}
