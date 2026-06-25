package com.gym.config;

import com.gym.model.Training;
import com.gym.repository.TrainingRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner initData(TrainingRepository trainingRepository) {
        return args -> {
            if (trainingRepository.count() == 0) {
                trainingRepository.saveAll(List.of(
                    new Training(null, "Musculation", "Salle complète avec machines guidées et poids libres. Idéal pour développer votre force.", "musculation.jpg", true),
                    new Training(null, "Cardio", "Espace équipé de tapis de course, vélos et rameurs de dernière génération.", "cardio.jpg", true),
                    new Training(null, "Yoga", "Séances encadrées pour améliorer votre souplesse, concentration et relaxation.", "yoga.jpg", false),
                    new Training(null, "CrossFit", "Entraînement fonctionnel à haute intensité pour un développement complet.", "crossfit.jpg", false),
                    new Training(null, "Zumba", "Fitness sur des rythmes latinos et internationaux pour brûler des calories en s'amusant.", "zumba.jpg", false)
                ));
            }
        };
    }
}
