package egorteam.clashroyaleback.persistence.repository;

import egorteam.clashroyaleback.persistence.entity.AuthTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthTokensRepository extends JpaRepository<AuthTokenEntity, String> {
}
