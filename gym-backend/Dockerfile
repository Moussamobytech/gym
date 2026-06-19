# Étape 1 : Construction (Build) avec Maven
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# On copie le fichier pom.xml et on télécharge les dépendances
COPY pom.xml .
# Cette étape permet de mettre en cache les dépendances Maven pour accélérer les futurs builds
RUN mvn dependency:go-offline

# On copie tout le code source
COPY src ./src

# On compile le projet et on crée le fichier .jar (en ignorant les tests pour aller plus vite sur Render)
RUN mvn clean package -DskipTests

# Étape 2 : Exécution (Run) avec un environnement Java léger
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# On récupère uniquement le fichier .jar généré à l'étape 1
COPY --from=build /app/target/gym-backend-0.0.1-SNAPSHOT.jar app.jar

# On expose le port 8080
EXPOSE 8080

# Commande pour démarrer l'application. 
# Render utilise la variable d'environnement $PORT, donc on force Spring Boot à écouter sur ce port.
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
