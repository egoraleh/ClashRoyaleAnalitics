package egorteam.clashroyaleback.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "cards")
public class CardEntity {
    @Id
    public Integer id;

    public Integer apiCardId;

    @Column(length = 120)
    public String name;

    public Integer elixir;

    @Column(length = 40)
    public String rarity;

    public Integer arena;

    @Column(columnDefinition = "text")
    public String iconUrl;

    @Column(columnDefinition = "text")
    public String description;

    @Column(columnDefinition = "text")
    public String dataJson;

    public Instant updatedAt;
}

