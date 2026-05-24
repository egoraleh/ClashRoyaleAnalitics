package egorteam.clashroyaleback.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "auth_tokens")
public class AuthTokenEntity {
    @Id
    @Column(length = 512)
    public String token;

    @Column(length = 20)
    public String tokenType;

    @Column(length = 32)
    public String playerTag;
}

