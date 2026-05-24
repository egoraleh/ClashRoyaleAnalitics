package egorteam.clashroyaleback.repositories;

import egorteam.clashroyaleback.entities.PublicDeckEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PublicDecksRepository extends JpaRepository<PublicDeckEntity, String> {
}

