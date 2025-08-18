package com.flow.backend.config;

import java.security.Principal;
import java.util.UUID;

public class StompPrincipal implements Principal {
    private final String name;
    private final UUID userId;

    public StompPrincipal(String name, UUID userId) {
        this.name = name;
        this.userId = userId;
    }

    @Override
    public String getName() {
        return name;
    }

    public UUID getUserId() { return userId; }
}
