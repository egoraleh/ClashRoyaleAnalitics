package egorteam.clashroyaleback.persistence.repository;

import egorteam.clashroyaleback.persistence.entity.CardEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CardsRepository extends JpaRepository<CardEntity, Integer> {
}
