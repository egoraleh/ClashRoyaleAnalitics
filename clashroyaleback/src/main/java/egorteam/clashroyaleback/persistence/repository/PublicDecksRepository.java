package egorteam.clashroyaleback.persistence.repository;

import egorteam.clashroyaleback.persistence.entity.PublicDeckEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PublicDecksRepository extends JpaRepository<PublicDeckEntity, String> {
}
