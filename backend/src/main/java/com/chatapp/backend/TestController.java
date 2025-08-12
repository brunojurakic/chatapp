package com.chatapp.backend;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {
    private final TestEntityRepository repository;

    public TestController(TestEntityRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/test")
    public List<TestEntity> getAll() {
        return repository.findAll();
    }
}
