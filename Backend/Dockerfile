FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S cinepass && adduser -S cinepass -G cinepass
COPY --from=build /app/target/*.jar app.jar
RUN chown cinepass:cinepass app.jar

USER cinepass
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
