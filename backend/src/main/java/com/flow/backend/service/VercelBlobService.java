package com.flow.backend.service;

import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class VercelBlobService {

    @Value("${vercel.blob.token}")
    private String vercelBlobToken;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public VercelBlobService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public String uploadFile(MultipartFile file, String userId) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File size must be less than 5MB");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = "profile-pictures/" + userId + "-" + UUID.randomUUID().toString() + extension;

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("authorization", "Bearer " + vercelBlobToken);
            headers.set("content-type", "application/octet-stream");
            headers.set("x-api-version", "7");

            HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

            String blobUrl = "https://blob.vercel-storage.com/" + filename;
            
            ResponseEntity<String> response = restTemplate.exchange(
                blobUrl,
                HttpMethod.PUT,
                requestEntity,
                String.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Failed to upload file to Vercel Blob: " + response.getStatusCode() + " - " + response.getBody());
            }

            String responseBody = response.getBody();
            if (responseBody != null && !responseBody.isEmpty()) {
                try {
                    JsonNode jsonResponse = objectMapper.readTree(responseBody);
                    if (jsonResponse.has("url")) {
                        return jsonResponse.get("url").asText();
                    }
                } catch (Exception e) {
                }
            }
            
            return blobUrl;

        } catch (Exception e) {
            throw new IOException("Failed to upload file: " + e.getMessage(), e);
        }
    }
}
