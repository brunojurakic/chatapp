package com.flow.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.flow.backend.model.FriendRequest;
import com.flow.backend.model.User;

@Repository
public interface FriendRequestRepository extends JpaRepository<FriendRequest, UUID> {

    List<FriendRequest> findByRecipientAndStatus(User recipient, String status);

    List<FriendRequest> findByRequester(User requester);
    List<FriendRequest> findByRequesterAndStatus(User requester, String status);

    Optional<FriendRequest> findByIdAndRecipient(UUID id, User recipient);
    
    Optional<FriendRequest> findFirstByRequesterAndRecipientOrderByCreatedAtDesc(User requester, User recipient);

    Optional<FriendRequest> findByRequesterAndRecipient(User requester, User recipient);
}
