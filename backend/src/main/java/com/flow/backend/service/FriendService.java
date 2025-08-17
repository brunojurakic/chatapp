package com.flow.backend.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flow.backend.dto.FriendRequestDTO;
import com.flow.backend.model.FriendRequest;
import com.flow.backend.model.Friendship;
import com.flow.backend.model.User;
import com.flow.backend.repository.FriendRequestRepository;
import com.flow.backend.repository.FriendshipRepository;

@Service
public class FriendService {

    @Autowired
    private FriendRequestRepository friendRequestRepository;

    @Autowired
    private FriendshipRepository friendshipRepository;

    public List<FriendRequestDTO> getIncomingRequests(User recipient) {
        List<FriendRequest> reqs = friendRequestRepository.findByRecipientAndStatus(recipient, "PENDING");
        return reqs.stream().map(r -> new FriendRequestDTO(
            r.getId(),
            r.getRequester().getId(),
            r.getRequester().getDisplayName() != null ? r.getRequester().getDisplayName() : r.getRequester().getName(),
            r.getRequester().getUsername(),
            r.getRequester().getProfilePictureUrl(),
            r.getStatus(),
            r.getCreatedAt()
        )).collect(Collectors.toList());
    }

    @Transactional
    public FriendRequest sendRequest(User requester, User recipient) {
        if (requester.getId() != null && requester.getId().equals(recipient.getId())) {
            throw new IllegalArgumentException("Cannot send friend request to yourself");
        }

        if (friendshipRepository.existsBetween(requester, recipient)) {
            throw new IllegalArgumentException("Already friends");
        }
        Optional<FriendRequest> existing = friendRequestRepository
                    .findFirstByRequesterAndRecipientOrderByCreatedAtDesc(requester, recipient);
        if (existing.isPresent()) {
            FriendRequest er = existing.get();
            if ("PENDING".equals(er.getStatus()) || "ACCEPTED".equals(er.getStatus())) {
                if ("PENDING".equals(er.getStatus())) return er;
                throw new IllegalArgumentException("Already friends");
            }
        }

        FriendRequest fr = new FriendRequest(requester, recipient);
        return friendRequestRepository.save(fr);
    }

    @Transactional
    public void acceptRequest(UUID requestId, User recipient) {
        FriendRequest fr = friendRequestRepository.findByIdAndRecipient(requestId, recipient)
            .orElseThrow(() -> new IllegalArgumentException("Friend request not found"));
        if (!"PENDING".equals(fr.getStatus())) {
            throw new IllegalArgumentException("Request not pending");
        }
        fr.setStatus("ACCEPTED");
        friendRequestRepository.save(fr);
        Friendship f = new Friendship(fr.getRequester(), fr.getRecipient());
        friendshipRepository.save(f);
    }

    @Transactional
    public void rejectRequest(UUID requestId, User recipient) {
        FriendRequest fr = friendRequestRepository.findByIdAndRecipient(requestId, recipient)
            .orElseThrow(() -> new IllegalArgumentException("Friend request not found"));
        if (!"PENDING".equals(fr.getStatus())) {
            throw new IllegalArgumentException("Request not pending");
        }
        fr.setStatus("REJECTED");
        friendRequestRepository.save(fr);
    }

    public List<User> getFriends(User user) {
        List<Friendship> list = friendshipRepository.findByUser(user);
        return list.stream().map(f -> {
            if (f.getUserA().getId().equals(user.getId())) return f.getUserB();
            return f.getUserA();
        }).collect(Collectors.toList());
    }
}
