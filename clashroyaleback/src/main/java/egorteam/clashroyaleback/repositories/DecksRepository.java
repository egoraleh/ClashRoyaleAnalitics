package egorteam.clashroyaleback.repositories;

import egorteam.clashroyaleback.entities.DeckEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DecksRepository extends JpaRepository<DeckEntity, Long> {
    List<DeckEntity> findByOwnerPlayerTagOrderByCreatedAtDesc(String ownerPlayerTag);

    List<DeckEntity> findByOwnerPlayerTagAndDeckTypeIgnoreCaseOrderByCreatedAtDesc(String ownerPlayerTag, String deckType);
}

