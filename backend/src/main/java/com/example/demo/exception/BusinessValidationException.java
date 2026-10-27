package com.example.demo.exception;

/**
 * Unchecked exception thrown when a business validation rule is violated.
 *
 * Examples:
 * - Duplicate knowledge graph title for the same owner.
 * - Invalid collaboration request.
 * - Topological or spatial constraint violations.
 * - Any other business rule conflicts.
 */
public class BusinessValidationException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public BusinessValidationException(String message) {
        super(message);
    }

    public BusinessValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}