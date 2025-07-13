FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src

# Create a custom application-prod.properties file
RUN mkdir -p src/main/resources
RUN echo 'spring.datasource.driver-class-name=org.postgresql.Driver' > src/main/resources/application-prod.properties
RUN echo 'spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect' >> src/main/resources/application-prod.properties
RUN echo 'spring.jpa.hibernate.ddl-auto=update' >> src/main/resources/application-prod.properties
RUN echo 'spring.jpa.show-sql=false' >> src/main/resources/application-prod.properties
RUN echo 'server.port=${PORT:8080}' >> src/main/resources/application-prod.properties

# Build the application
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/project-management-app-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080

# Create startup script
RUN echo '#!/bin/bash\n\
# Print environment variables for debugging (without revealing secrets)\n\
echo "Checking database connection variables..."\n\
echo "DB_HOST: ${DB_HOST}"\n\
echo "DB_PORT: ${DB_PORT}"\n\
echo "DB_NAME: ${DB_NAME}"\n\
\n\
# Use environment variables for database connection\n\
exec java -jar app.jar --spring.profiles.active=prod \\\n\
          --spring.datasource.url="jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}" \\\n\
          --spring.datasource.username="${DB_USER}" \\\n\
          --spring.datasource.password="${DB_PASSWORD}" \\\n\
          --spring.datasource.driver-class-name=org.postgresql.Driver \\\n\
          --spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect \\\n\
          --spring.jpa.hibernate.ddl-auto=update \\\n\
          --spring.jpa.properties.hibernate.temp.use_jdbc_metadata_defaults=false \\\n\
          --spring.datasource.hikari.maximum-pool-size=5' > /app/start.sh

RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]
