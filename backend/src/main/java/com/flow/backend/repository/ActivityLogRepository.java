package com.flow.backend.repository;

import com.flow.backend.model.ActivityLog;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, UUID> {

  @Query("SELECT a FROM ActivityLog a ORDER BY a.createdAt DESC")
  List<ActivityLog> findAllOrderByCreatedAtDesc(Pageable pageable);

  @Query("SELECT a FROM ActivityLog a WHERE a.user.id = :userId ORDER BY a.createdAt DESC")
  List<ActivityLog> findByUserIdOrderByCreatedAtDesc(
      @Param("userId") UUID userId, Pageable pageable);

  @Query("SELECT a FROM ActivityLog a WHERE a.action = :action ORDER BY a.createdAt DESC")
  List<ActivityLog> findByActionOrderByCreatedAtDesc(
      @Param("action") String action, Pageable pageable);

  @Query(
      "SELECT a FROM ActivityLog a WHERE a.createdAt BETWEEN :startDate AND :endDate ORDER BY a.createdAt DESC")
  List<ActivityLog> findByCreatedAtBetweenOrderByCreatedAtDesc(
      @Param("startDate") Instant startDate, @Param("endDate") Instant endDate, Pageable pageable);

  @Query("SELECT COUNT(a) FROM ActivityLog a WHERE a.createdAt >= :since")
  long countByCreatedAtAfter(@Param("since") Instant since);
}
