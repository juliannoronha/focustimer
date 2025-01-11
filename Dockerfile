# Build stage
FROM eclipse-temurin:21-jdk AS builder

# Set working directory
WORKDIR /app

# Copy necessary files for build
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src src

# Make mvnw executable
RUN chmod +x mvnw

# Build the application
RUN ./mvnw clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy the built jar from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Environment variable for Spring Boot
ENV SPRING_PROFILES_ACTIVE=prod

# Expose the port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]