package com.chatapp.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class TestDataInitializer implements CommandLineRunner {
    private final TestEntityRepository repository;

    public TestDataInitializer(TestEntityRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() == 0) {
            repository.save(new TestEntity("Sample Entry"));
        }
    }
}
