package egorteam.clashroyaleback.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "user_preferences")
public class UserPreferenceEntity {
    @Id
    @Column(length = 32)
    public String playerTag;

    @Column(length = 40)
    public String preferredStrategy;

    public Double minElixir;
    public Double maxElixir;

    @Column(columnDefinition = "text")
    public String preferredCardIdsJson;

    @Column(columnDefinition = "text")
    public String excludedCardIdsJson;

    public Instant updatedAt;
}
