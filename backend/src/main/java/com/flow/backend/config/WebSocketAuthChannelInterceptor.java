package com.flow.backend.config;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import com.flow.backend.model.User;
import com.flow.backend.service.UserService;
import com.flow.backend.util.JwtUtil;

@Component
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) return message;

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            List<String> auth = accessor.getNativeHeader("Authorization");
            String token = null;
            if (auth != null && !auth.isEmpty()) {
                String header = auth.get(0);
                if (header != null && header.startsWith("Bearer ")) token = header.substring(7);
            }

            if (token != null && jwtUtil.validateToken(token)) {
                String email = jwtUtil.extractUsername(token);
                User user = userService.findByEmail(email).orElse(null);
                if (user != null) {
                    Principal p = new StompPrincipal(user.getEmail(), user.getId());
                    accessor.setUser(p);
                }
            }
        }

        return message;
    }
}
