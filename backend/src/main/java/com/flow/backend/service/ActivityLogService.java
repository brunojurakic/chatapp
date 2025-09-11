package com.flow.backend.service;

import com.flow.backend.model.ActivityLog;
import com.flow.backend.model.User;
import com.flow.backend.repository.ActivityLogRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ActivityLogService {

  @Autowired private ActivityLogRepository activityLogRepository;

  @Transactional
  public void logActivity(User user, String action, String description) {
    ActivityLog log = new ActivityLog(user, action, description);
    activityLogRepository.save(log);
  }

  @Transactional
  public void logActivity(
      User user, String action, String description, String ipAddress, String userAgent) {
    ActivityLog log = new ActivityLog(user, action, description, ipAddress, userAgent);
    activityLogRepository.save(log);
  }

  @Transactional
  public void logActivity(
      User user,
      String action,
      String description,
      String ipAddress,
      String userAgent,
      String metadata) {
    ActivityLog log = new ActivityLog(user, action, description, ipAddress, userAgent, metadata);
    activityLogRepository.save(log);
  }

  public List<ActivityLog> getRecentActivityLogs(int limit) {
    Pageable pageable = PageRequest.of(0, limit);
    return activityLogRepository.findAllOrderByCreatedAtDesc(pageable);
  }

  public List<ActivityLog> getActivityLogsByUser(UUID userId, int limit) {
    Pageable pageable = PageRequest.of(0, limit);
    return activityLogRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
  }

  public List<ActivityLog> getActivityLogsByAction(String action, int limit) {
    Pageable pageable = PageRequest.of(0, limit);
    return activityLogRepository.findByActionOrderByCreatedAtDesc(action, pageable);
  }

  public List<ActivityLog> getActivityLogsByDateRange(
      Instant startDate, Instant endDate, int limit) {
    Pageable pageable = PageRequest.of(0, limit);
    return activityLogRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(
        startDate, endDate, pageable);
  }

  public long getActivityCountSince(Instant since) {
    return activityLogRepository.countByCreatedAtAfter(since);
  }
}
