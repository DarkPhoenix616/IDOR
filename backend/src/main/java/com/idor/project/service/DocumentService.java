package com.idor.project.service;

import com.idor.project.payload.CreateDocumentRequest;
import com.idor.project.payload.Document;
import com.idor.project.payload.User;
import com.idor.project.repository.DocumentRepository;
import com.idor.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Document> getUserDocuments(Long userId) {
        return documentRepository.findByOwnerId(userId);
    }

    // Vulnerable method - Doesn't check if the user asking actually owns the document
    public Optional<Document> getDocumentById(Long documentId) {
        return documentRepository.findById(documentId);
    }

    public Document createDocument(Long userId, CreateDocumentRequest request) {
        Optional<User> userOptional = userRepository.findById(userId);
        
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();
        Document document = new Document(
                request.getTitle(),
                request.getContent(),
                user
        );

        return documentRepository.save(document);
    }
}
