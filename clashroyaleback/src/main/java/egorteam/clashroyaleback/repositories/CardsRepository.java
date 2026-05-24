package egorteam.clashroyaleback.repositories;

import egorteam.clashroyaleback.entities.CardEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CardsRepository extends JpaRepository<CardEntity, Integer> {
}

