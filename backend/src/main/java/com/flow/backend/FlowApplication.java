package com.flow.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties
public class FlowApplication {

  public static void main(String[] args) {
    SpringApplication.run(FlowApplication.class, args);
  }
}
