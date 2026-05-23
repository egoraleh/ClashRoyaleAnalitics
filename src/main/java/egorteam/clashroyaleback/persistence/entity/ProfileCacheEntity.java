package egorteam.clashroyaleback.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "profile_caches")
public class ProfileCacheEntity {
    @Id
    @Column(length = 32)
    public String playerTag;

    @Column(length = 120)
    public String playerName;

    public Integer trophies;
    public Integer bestTrophies;
    public Integer expLevel;

    @Column(columnDefinition = "text")
    public String currentDeckJson;

    @Column(columnDefinition = "text")
    public String rewardsJson;

    @Column(columnDefinition = "text")
    public String profileDataJson;

    @Column(columnDefinition = "text")
    public String battleStatsJson;

    public Instant updatedAt;
}
