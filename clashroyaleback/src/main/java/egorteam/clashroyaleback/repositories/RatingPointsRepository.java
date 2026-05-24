package egorteam.clashroyaleback.repositories;

import egorteam.clashroyaleback.entities.RatingPointEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RatingPointsRepository extends JpaRepository<RatingPointEntity, Long> {
    List<RatingPointEntity> findByPlayerTagOrderByChangedAtAsc(String playerTag);
}

