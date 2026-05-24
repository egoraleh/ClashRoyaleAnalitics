package egorteam.clashroyaleback.repositories;

import egorteam.clashroyaleback.entities.AuthTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthTokensRepository extends JpaRepository<AuthTokenEntity, String> {
}

