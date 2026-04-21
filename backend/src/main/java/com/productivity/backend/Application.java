package com.productivity.backend;

import org.modelmapper.ModelMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {
    "com.productivity.backend",
    "com.productivity.backend.entity.focus_wishwaka_entity",
    "com.productivity.backend.DTO.focus_wishwaka_DTO",
    "com.productivity.backend.repository.focus_wishwaka_repository",
    "com.productivity.backend.service.focus_wishwaka_service",
    "com.productivity.backend.controller.focus_wishwaka_controller",
    "com.productivity.backend.entity.user_entity",
    "com.productivity.backend.repository.user_repository",
    "com.productivity.backend.service.user_service",
    "com.productivity.backend.controller.user_controller",
    "com.productivity.backend.dto.auth_dto",
    "com.productivity.backend.config"
})
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }
}
