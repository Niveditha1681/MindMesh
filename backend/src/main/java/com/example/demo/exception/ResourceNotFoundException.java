package com.example.demo.exception;

/**
 * Unchecked exception thrown when a requested entity
 * (KnowledgeGraph, ConceptNode, SemanticEdge, etc.)
 * cannot be found in the database.
 */
public class ResourceNotFoundException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * Creates a new ResourceNotFoundException with the specified message.
     *
     * @param message details about the missing resource
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }

    /**
     * Creates a new ResourceNotFoundException with the specified
     * message and root cause.
     *
     * @param message details about the missing resource
     * @param cause   underlying cause
     */
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}