package com.flow.backend.controller;

import java.security.Principal;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.flow.backend.dto.ChatMessageDTO;
import com.flow.backend.model.User;
import com.flow.backend.service.ChatService;
import com.flow.backend.service.UserService;

@Controller
public class ChatStompController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatService chatService;

    @Autowired
    private UserService userService;

    @MessageMapping("/chats/{friendshipId}/send")
    public void sendMessage(@DestinationVariable("friendshipId") UUID friendshipId, String payload, Principal principal) {
        if (principal == null) return;

        UUID senderId = null;
        if (principal instanceof com.flow.backend.config.StompPrincipal sp) {
            senderId = sp.getUserId();
        } else {
            User u = userService.findByEmail(principal.getName()).orElse(null);
            if (u != null) senderId = u.getId();
        }

        if (senderId == null) return;

        User sender = userService.findById(senderId).orElse(null);
        if (sender == null) return;

        ChatMessageDTO saved = chatService.saveMessage(friendshipId, sender, payload);

        messagingTemplate.convertAndSend("/topic/chats/" + friendshipId.toString(), saved);
    }
}
