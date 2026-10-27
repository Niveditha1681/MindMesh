package com.example.demo.repository;

import com.example.demo.entity.SystemAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemAccountRepository extends JpaRepository<SystemAccount, Long> {

    Optional<SystemAccount> findByUsername(String username);

    Optional<SystemAccount> findByEmail(String email);

}