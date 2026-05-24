package egorteam.clashroyaleback.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "decks")
public class DeckEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(length = 32)
    public String ownerPlayerTag;

    @Column(length = 100)
    public String name;

    @Column(length = 40)
    public String deckType;

    @Column(length = 40)
    public String strategy;

    @Column(columnDefinition = "text")
    public String description;

    public Double qualityScore;
    public Instant createdAt;
    public Instant updatedAt;

    @Column(columnDefinition = "text")
    public String cardsJson;

    @Column(columnDefinition = "text")
    public String metricsJson;
}

