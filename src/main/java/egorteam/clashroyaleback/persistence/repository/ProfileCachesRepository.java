package egorteam.clashroyaleback.persistence.repository;

import egorteam.clashroyaleback.persistence.entity.ProfileCacheEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileCachesRepository extends JpaRepository<ProfileCacheEntity, String> {
}
