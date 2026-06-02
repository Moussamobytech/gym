package com.gym.controller;

import com.gym.model.Training;
import com.gym.repository.TrainingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/trainings")
public class TrainingController {

    @Autowired
    private TrainingRepository trainingRepository;

    @GetMapping
    public ResponseEntity<List<Training>> getAllTrainings() {
        return ResponseEntity.ok(trainingRepository.findAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Training>> getActiveTrainings() {
        return ResponseEntity.ok(trainingRepository.findByIsActiveTrue());
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<Training> toggleTraining(@PathVariable Long id) {
        return trainingRepository.findById(id)
                .map(training -> {
                    training.setActive(!training.isActive());
                    return ResponseEntity.ok(trainingRepository.save(training));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
