package egorteam.clashroyaleback.repositories;

import egorteam.clashroyaleback.entities.UserPreferenceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPreferencesRepository extends JpaRepository<UserPreferenceEntity, String> {
}

