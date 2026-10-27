package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "knowledge_graphs")
@Getter
@Setter
@ToString(exclude = {"nodes", "edges"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class KnowledgeGraph {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private SystemAccount owner;

    @Builder.Default
    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = false;

    @Builder.Default
    @Column(name = "complexity_score", nullable = false)
    private Double complexityScore = 0.0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(
            mappedBy = "graph",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY
    )
    private List<ConceptNode> nodes;

    @OneToMany(
            mappedBy = "graph",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY
    )
    private List<SemanticEdge> edges;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    /**
     * Explicit getter for reflection-based test compatibility.
     */
    public Boolean getIsPublic() {
        return isPublic;
    }

    /**
     * Explicit setter for reflection-based test compatibility.
     */
    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }
}