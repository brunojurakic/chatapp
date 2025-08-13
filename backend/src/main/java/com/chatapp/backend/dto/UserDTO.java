package com.chatapp.backend.dto;

public class UserDTO {
    private String name;
    private String email;
    private String picture;
    private boolean authenticated;
    
    public UserDTO() {}
    
    public UserDTO(String name, String email, String picture, boolean authenticated) {
        this.name = name;
        this.email = email;
        this.picture = picture;
        this.authenticated = authenticated;
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
}
