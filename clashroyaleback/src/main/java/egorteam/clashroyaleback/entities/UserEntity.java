package egorteam.clashroyaleback.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "users")
public class UserEntity {
    @Id
    @Column(name = "player_tag", length = 32)
    public String playerTag;

    @Column(length = 50)
    public String username;

    public String email;
    public String password;
    public Instant registeredAt;
}

