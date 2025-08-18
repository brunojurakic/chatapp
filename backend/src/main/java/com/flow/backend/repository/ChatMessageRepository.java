package com.flow.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.flow.backend.model.ChatMessage;
import com.flow.backend.model.Friendship;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    @Query("select m from ChatMessage m where m.friendship = :friendship order by m.createdAt desc")
    List<ChatMessage> findByFriendship(@Param("friendship") Friendship friendship, Pageable pageable);
}
