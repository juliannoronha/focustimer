# Use Eclipse Temurin as the base image
FROM eclipse-temurin:21-jdk

# Set working directory
WORKDIR /app

# Copy the Maven wrapper and POM
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Build the application
RUN ./mvnw dependency:go-offline
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Copy the built JAR
COPY target/*.jar app.jar

# Expose the port that matches your application.properties
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "app.jar"]