package com.idor.project.service;

import com.idor.project.payload.Document;
import com.idor.project.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    public List<Document> getUserDocuments(Long userId) {
        return documentRepository.findByOwnerId(userId);
    }

    // Vulnerable method - Doesn't check if the user asking actually owns the document
    public Optional<Document> getDocumentById(Long documentId) {
        return documentRepository.findById(documentId);
    }
}
