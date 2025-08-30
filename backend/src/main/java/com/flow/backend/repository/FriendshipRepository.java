package com.flow.backend.repository;

import com.flow.backend.model.Friendship;
import com.flow.backend.model.User;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, UUID> {

  @Query("select f from Friendship f where f.userA = :user or f.userB = :user")
  List<Friendship> findByUser(@Param("user") User user);

  @Query(
      "select case when count(f)>0 then true else false end from Friendship f where (f.userA = :a and f.userB = :b) or (f.userA = :b and f.userB = :a)")
  boolean existsBetween(@Param("a") User a, @Param("b") User b);

  @Query(
      "select f from Friendship f where (f.userA = :a and f.userB = :b) or (f.userA = :b and f.userB = :a)")
  java.util.Optional<Friendship> findBetween(@Param("a") User a, @Param("b") User b);

  @Modifying
  @Transactional
  @Query("delete from Friendship f where f.userA = :user or f.userB = :user")
  void deleteByUser1OrUser2(@Param("user") User user);
}
