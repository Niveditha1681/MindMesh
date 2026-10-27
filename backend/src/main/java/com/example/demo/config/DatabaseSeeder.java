package com.example.demo.config;

import com.example.demo.entity.SystemAccount;
import com.example.demo.repository.SystemAccountRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final SystemAccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(
            SystemAccountRepository accountRepository,
            PasswordEncoder passwordEncoder) {

        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        // Seed sample accounts only when the database is empty
        if (accountRepository.count() > 0) {
            return;
        }

        SystemAccount architect = new SystemAccount();
        architect.setUsername("john_architect");
        architect.setEmail("john@mindmesh.com");
        architect.setPasswordHash(passwordEncoder.encode("architectPass123"));
        architect.setDomainRole(SystemAccount.DomainRole.KNOWLEDGE_ARCHITECT);

        SystemAccount strategist = new SystemAccount();
        strategist.setUsername("jane_strategist");
        strategist.setEmail("jane@mindmesh.com");
        strategist.setPasswordHash(passwordEncoder.encode("strategistPass123"));
        strategist.setDomainRole(SystemAccount.DomainRole.RESEARCH_STRATEGIST);

        SystemAccount analyst = new SystemAccount();
        analyst.setUsername("bob_analyst");
        analyst.setEmail("bob@mindmesh.com");
        analyst.setPasswordHash(passwordEncoder.encode("analystPass123"));
        analyst.setDomainRole(SystemAccount.DomainRole.VIEW_ANALYST);

        accountRepository.save(architect);
        accountRepository.save(strategist);
        accountRepository.save(analyst);

        System.out.println("Database seeding completed successfully.");
    }
}