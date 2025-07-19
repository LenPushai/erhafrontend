package com.erha.ops.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/public/health")
    public String health() {
        return "ERHA OPS System is running! Health check passed.";
    }

    @GetMapping("/public/version")
    public String version() {
        return "ERHA OPS Platform v7.0.0-SNAPSHOT";
    }
}