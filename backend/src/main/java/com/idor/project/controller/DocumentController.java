package com.idor.project.controller;

import com.idor.project.payload.CreateDocumentRequest;
import com.idor.project.payload.Document;
import com.idor.project.security.JwtTokenProvider;
import com.idor.project.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    // Create a new document - extracts userId from JWT token
    @PostMapping("/create")
    public ResponseEntity<Document> createDocument(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody CreateDocumentRequest request) {
        try {
            // Extract token from "Bearer <token>" format
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            String token = authHeader.substring(7);
            
            // Validate token
            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            // Extract userId from token
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            
            Document document = documentService.createDocument(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(document);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Vulnerable endpoint - directly fetches by document ID without checking ownership
    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocument(@PathVariable Long id) {
        Optional<Document> document = documentService.getDocumentById(id);
        
        return document.map(ResponseEntity::ok)
                       .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Endpoint intended for a user to see their own documents
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Document>> getUserDocuments(@PathVariable Long userId) {
        return ResponseEntity.ok(documentService.getUserDocuments(userId));
    }
}
