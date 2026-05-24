package egorteam.clashroyaleback.repositories;

import egorteam.clashroyaleback.entities.ComparisonEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComparisonsRepository extends JpaRepository<ComparisonEntity, Long> {
    List<ComparisonEntity> findByPlayerTagOrderByCreatedAtDesc(String playerTag);
}

