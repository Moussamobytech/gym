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
                    new Training(null, "Musculation", "Salle complète avec machines guidées et poids libres. Idéal pour développer votre force.", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80", true),
                    new Training(null, "Cardio", "Espace équipé de tapis de course, vélos et rameurs de dernière génération.", "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&q=80", true),
                    new Training(null, "Yoga", "Séances encadrées pour améliorer votre souplesse, concentration et relaxation.", "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&q=80", false),
                    new Training(null, "CrossFit", "Entraînement fonctionnel à haute intensité pour un développement complet.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80", false),
                    new Training(null, "Zumba", "Fitness sur des rythmes latinos et internationaux pour brûler des calories en s'amusant.", "https://images.unsplash.com/photo-1549476464-37392f717541?auto=format&fit=crop&q=80", false)
                ));
            }
        };
    }
}
