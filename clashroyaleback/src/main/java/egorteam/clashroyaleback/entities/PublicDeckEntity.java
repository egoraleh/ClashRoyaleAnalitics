package egorteam.clashroyaleback.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "public_decks")
public class PublicDeckEntity {
    @Id
    @Column(length = 80)
    public String token;

    public Long deckId;

    @Column(columnDefinition = "text")
    public String publicUrl;

    public Instant publishedAt;
}

