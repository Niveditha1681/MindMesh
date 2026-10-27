package com.example.demo.service;

import com.example.demo.entity.SystemAccount;
import com.example.demo.entity.SystemAccount.DomainRole;
import com.example.demo.repository.SystemAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final SystemAccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AuthService(SystemAccountRepository accountRepository,
                       PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public SystemAccount register(String username,
                                  String email,
                                  String password,
                                  DomainRole role) {

        if (username == null || username.isBlank()) {
            throw new RuntimeException("Username cannot be empty");
        }

        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email cannot be empty");
        }

        if (password == null || password.isBlank()) {
            throw new RuntimeException("Password cannot be empty");
        }

        if (role == null) {
            throw new RuntimeException("Role cannot be empty");
        }

        if (accountRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        SystemAccount account = new SystemAccount();
        account.setUsername(username);
        account.setEmail(email);
        account.setPasswordHash(passwordEncoder.encode(password));
        account.setDomainRole(role);

        return accountRepository.save(account);
    }

    public Optional<SystemAccount> login(String username, String password) {

        if (username == null || password == null) {
            return Optional.empty();
        }

        return accountRepository.findByUsername(username)
                .filter(account ->
                        passwordEncoder.matches(
                                password,
                                account.getPasswordHash()));
    }
}