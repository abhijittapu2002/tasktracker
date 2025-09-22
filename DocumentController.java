package com.misboi.jwtlogin.controller;

import com.misboi.jwtlogin.model.Documents;
import com.misboi.jwtlogin.service.DocumentService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Documents> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("actId") Long actId
    ) {
        try {
            Documents document = documentService.uploadFile(file, actId);
            return ResponseEntity.ok(document);
        } catch (Exception e) {
            e.printStackTrace(); // Log to console for debugging
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDocumentById(@PathVariable Long id) {
        try {
            Documents document = documentService.getDocumentById(id);
            return ResponseEntity.ok(document);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/activity/{actId}")
    public ResponseEntity<?> getDocumentsByActivity(@PathVariable Long actId) {
        try {
            return ResponseEntity.ok(documentService.getDocumentsByActivityId(actId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) throws IOException {
        Documents doc = documentService.getDocumentById(id);
        Path path = Paths.get(doc.getDocPath());

        Resource resource = new UrlResource(path.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            throw new FileNotFoundException("File not found: " + doc.getDocPath());
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM) // Force binary download
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + path.getFileName().toString() + "\"")
                .body(resource);
    }

    @GetMapping("/preview/{id}")
    public ResponseEntity<byte[]> previewDocument(@PathVariable Long id) throws IOException {
        Documents doc = documentService.getDocumentById(id);
        Path path = Paths.get(doc.getDocPath());

        byte[] fileBytes = Files.readAllBytes(path);
        String contentType = Files.probeContentType(path);
        MediaType mediaType = contentType != null ? MediaType.parseMediaType(contentType) : MediaType.APPLICATION_OCTET_STREAM;

        return ResponseEntity.ok()
                .contentType(mediaType) // image/png, application/pdf, etc.
                .body(fileBytes);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteDocument(@PathVariable Long id) {
        try {
            documentService.deleteDocument(id);
            return ResponseEntity.ok("Document deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting document: " + e.getMessage());
        }
    }


}

