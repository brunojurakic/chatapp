package com.flow.backend.dto;

public class UserDTO {
    private String name;
    private String email;
    private String picture;
    private boolean authenticated;
    private String username;
    private String displayName;
    private String themePreference;
    
    public UserDTO() {}
    
    public UserDTO(String name, String email, String picture, boolean authenticated) {
        this.name = name;
        this.email = email;
        this.picture = picture;
        this.authenticated = authenticated;
    }

    public UserDTO(String name, String email, String picture, boolean authenticated, String username, String displayName) {
        this.name = name;
        this.email = email;
        this.picture = picture;
        this.authenticated = authenticated;
        this.username = username;
        this.displayName = displayName;
        this.themePreference = "system";
    }

    public UserDTO(String name, String email, String picture, boolean authenticated, String username, String displayName, String themePreference) {
        this.name = name;
        this.email = email;
        this.picture = picture;
        this.authenticated = authenticated;
        this.username = username;
        this.displayName = displayName;
        this.themePreference = themePreference;
    }
    
    // Getters and Setters
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPicture() {
        return picture;
    }
    
    public void setPicture(String picture) {
        this.picture = picture;
    }
    
    public boolean isAuthenticated() {
        return authenticated;
    }
    
    public void setAuthenticated(boolean authenticated) {
        this.authenticated = authenticated;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getThemePreference() {
        return themePreference;
    }

    public void setThemePreference(String themePreference) {
        this.themePreference = themePreference;
    }
}
