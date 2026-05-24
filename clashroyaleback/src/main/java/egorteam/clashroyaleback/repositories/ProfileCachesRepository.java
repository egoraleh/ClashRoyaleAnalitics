package egorteam.clashroyaleback.repositories;

import egorteam.clashroyaleback.entities.ProfileCacheEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileCachesRepository extends JpaRepository<ProfileCacheEntity, String> {
}

