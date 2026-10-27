package com.example.demo.controller;

import com.example.demo.entity.SystemAccount;
import com.example.demo.security.CustomUserDetailsService;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.AuthService;

import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    @Autowired
    public AuthController(
            AuthService authService,
            JwtUtil jwtUtil,
            CustomUserDetailsService userDetailsService) {

        this.authService = authService;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    /**
     * GET /api/auth/ping
     */
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {

        return ResponseEntity.ok(
                "MindMesh Backend Running"
        );
    }

    /**
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<String> register(

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    name = "Register Request",
                                    value = """
                                            {
                                              "username": "john",
                                              "email": "john@gmail.com",
                                              "password": "123456",
                                              "role": "KNOWLEDGE_ARCHITECT"
                                            }
                                            """
                            )
                    )
            )

            @RequestBody
            Map<String, String> request) {

        String username = request.get("username");
        String email = request.get("email");
        String password = request.get("password");
        String role = request.get("role");

        SystemAccount.DomainRole domainRole =
                SystemAccount.DomainRole.valueOf(role);

        authService.register(
                username,
                email,
                password,
                domainRole
        );

        return ResponseEntity.ok("Registration successful");
    }

    /**
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    name = "Login Request",
                                    value = """
                                            {
                                              "username": "john",
                                              "password": "123456"
                                            }
                                            """
                            )
                    )
            )

            @RequestBody
            Map<String, String> request) {

        String username = request.get("username");
        String password = request.get("password");

        Optional<SystemAccount> user =
                authService.login(username, password);

        if (user.isEmpty()) {
            return ResponseEntity
                    .badRequest()
                    .body("Invalid username or password");
        }

        SystemAccount loggedUser = user.get();

        UserDetails userDetails =
                userDetailsService.loadUserByUsername(
                        loggedUser.getUsername()
                );

        String token =
                jwtUtil.generateToken(userDetails);

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put("id", loggedUser.getId());
        response.put("username", loggedUser.getUsername());
        response.put("role", loggedUser.getDomainRole());
        response.put("accessToken", token);

        return ResponseEntity.ok(response);
    }

    /**
     * ADMIN authorization marker
     */
    @PreAuthorize("hasRole('ADMIN')")
    public void adminAuthorizationCheck() {
        // Authorization marker method.
    }
}