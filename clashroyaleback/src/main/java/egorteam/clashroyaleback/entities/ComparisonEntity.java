package egorteam.clashroyaleback.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "comparisons")
public class ComparisonEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(length = 32)
    public String playerTag;

    @Column(columnDefinition = "text")
    public String leftDeckJson;

    @Column(columnDefinition = "text")
    public String rightDeckJson;

    public Double leftScore;
    public Double rightScore;

    @Column(columnDefinition = "text")
    public String leftBreakdownJson;

    @Column(columnDefinition = "text")
    public String rightBreakdownJson;

    @Column(length = 10)
    public String winnerSide;

    @Column(columnDefinition = "text")
    public String resultDescription;

    public Instant createdAt;
}

