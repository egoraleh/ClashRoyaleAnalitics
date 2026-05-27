package egorteam.clashroyaleback.persistence.repository;

import egorteam.clashroyaleback.persistence.entity.UserPreferenceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPreferencesRepository extends JpaRepository<UserPreferenceEntity, String> {
}
