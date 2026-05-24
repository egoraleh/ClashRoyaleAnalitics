package egorteam.clashroyaleback.persistence.repository;

import egorteam.clashroyaleback.persistence.entity.CardEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CardsRepository extends JpaRepository<CardEntity, Integer>, JpaSpecificationExecutor<CardEntity> {
}
