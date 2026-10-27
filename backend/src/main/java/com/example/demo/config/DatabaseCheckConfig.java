package com.example.demo.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.logging.Logger;

/**
 * Verifies database connectivity during application startup
 * and logs the connection status.
 */
@Configuration
public class DatabaseCheckConfig implements CommandLineRunner {

    private static final Logger LOGGER =
            Logger.getLogger(DatabaseCheckConfig.class.getName());

    private final DataSource dataSource;

    public DatabaseCheckConfig(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) {

        try (Connection connection = dataSource.getConnection()) {

            if (connection != null && !connection.isClosed()) {

                LOGGER.info(
                        "Database connection verified successfully on startup. URL: "
                                + connection.getMetaData().getURL());

            } else {

                LOGGER.severe(
                        "Database connection verification failed. Connection is closed.");

            }

        } catch (Exception ex) {

            LOGGER.severe(
                    "Unable to establish database connection during startup: "
                            + ex.getMessage());

        }
    }
}