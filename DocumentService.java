//
//package com.misboi.jwtlogin.service;
//
//import com.misboi.jwtlogin.model.ActivityMaster;
//import com.misboi.jwtlogin.model.Documents;
//import com.misboi.jwtlogin.repository.ActivityMasterRepository;
//import com.misboi.jwtlogin.repository.DocumentsRepository;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.stereotype.Service;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.File;
//import java.io.IOException;
//import java.time.ZonedDateTime;
//import java.util.List;
//import java.util.UUID;
//
//@Service
//public class DocumentService {
//
//    @Value("${file.upload-dir}")
//    private String uploadDir;
//
//    private final DocumentsRepository documentsRepository;
//    private final ActivityMasterRepository activityMasterRepository;
//
//    public DocumentService(DocumentsRepository documentsRepository, ActivityMasterRepository activityMasterRepository) {
//        this.documentsRepository = documentsRepository;
//        this.activityMasterRepository = activityMasterRepository;
//    }
//
//    public Documents uploadFile(MultipartFile file, Long actId) throws IOException {
//        // Get current username from SecurityContext
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        String createdBy = authentication.getName(); // this is the username from the token
//
//        // Create upload directory if not exists
//        File directory = new File(uploadDir);
//        if (!directory.exists()) {
//            directory.mkdirs();
//        }
//
//        // Generate unique filename
//        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
//        String filePath = uploadDir + File.separator + filename;
//
//        // Save file
//        file.transferTo(new File(filePath));
//
//        // Get TaskMaster
//        ActivityMaster activity = activityMasterRepository.findById(actId)
//                .orElseThrow(() -> new RuntimeException("Activity not found with id " + actId));
//
//        // Save document metadata
//        Documents document = new Documents();
//        document.setActivity(activity);
//        document.setDocPath(filePath);
//        document.setCreatedBy(createdBy);
//        document.setCreatedAt(ZonedDateTime.now());
//
//        return documentsRepository.save(document);
//    }
//    public Documents getDocumentById(Long documentId) {
//        return documentsRepository.findById(documentId)
//                .orElseThrow(() -> new RuntimeException("Document not found with id " + documentId));
//    }
//
//    public List<Documents> getDocumentsByActivityId(Long actId) {
//        ActivityMaster activity = activityMasterRepository.findById(actId)
//                .orElseThrow(() -> new RuntimeException("Activity not found with id " + actId));
//        return documentsRepository.findByActivity(activity);
//    }
//
//    public void deleteDocument(Long id) throws IOException {
//        Documents doc = getDocumentById(id);
//        File file = new File(doc.getDocPath());
//
//        if (file.exists()) {
//            file.delete();
//        }
//
//        documentsRepository.deleteById(id);
//    }
//
//
//}
//


package com.misboi.jwtlogin.service;

import com.misboi.jwtlogin.model.ActivityMaster;
import com.misboi.jwtlogin.model.Documents;
import com.misboi.jwtlogin.repository.ActivityMasterRepository;
import com.misboi.jwtlogin.repository.DocumentsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class DocumentService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentService.class);

    @Value("${file.upload-dir}")
    private String uploadDir;

    private final DocumentsRepository documentsRepository;
    private final ActivityMasterRepository activityMasterRepository;

    public DocumentService(DocumentsRepository documentsRepository, ActivityMasterRepository activityMasterRepository) {
        this.documentsRepository = documentsRepository;
        this.activityMasterRepository = activityMasterRepository;
    }

    public Documents uploadFile(MultipartFile file, Long actId) {
        try {
            // Get current username from SecurityContext
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String createdBy = authentication.getName();

            // Create upload directory if it does not exist
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
                logger.info("Created upload directory at: {}", uploadDir);
            }

            // Generate unique filename
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            String filePath = uploadDir + File.separator + filename;

            // Save file to disk
            file.transferTo(new File(filePath));
            logger.info("File uploaded successfully: {} (size: {} bytes) by user: {}", filename, file.getSize(), createdBy);

            // Fetch ActivityMaster
            ActivityMaster activity = activityMasterRepository.findById(actId)
                    .orElseThrow(() -> new RuntimeException("Activity not found with id " + actId));

            // Save document metadata
            Documents document = new Documents();
            document.setActivity(activity);
            document.setDocPath(filePath);
            document.setCreatedBy(createdBy);
            document.setCreatedAt(ZonedDateTime.now());

            Documents savedDoc = documentsRepository.save(document);
            logger.info("Document metadata saved successfully with id: {}", savedDoc.getDocId());

            return savedDoc;

        } catch (IOException e) {
            logger.error("Failed to upload file: {}", file.getOriginalFilename(), e);
            throw new RuntimeException("File upload failed: " + e.getMessage());
        } catch (RuntimeException e) {
            logger.error("Error while uploading file for activityId {}: {}", actId, e.getMessage(), e);
            throw e;
        }
    }

    public Documents getDocumentById(Long documentId) {
        try {
            return documentsRepository.findById(documentId)
                    .orElseThrow(() -> new RuntimeException("Document not found with id " + documentId));
        } catch (RuntimeException e) {
            logger.error("Error fetching document with id {}: {}", documentId, e.getMessage(), e);
            throw e;
        }
    }

    public List<Documents> getDocumentsByActivityId(Long actId) {
        try {
            ActivityMaster activity = activityMasterRepository.findById(actId)
                    .orElseThrow(() -> new RuntimeException("Activity not found with id " + actId));
            return documentsRepository.findByActivity(activity);
        } catch (RuntimeException e) {
            logger.error("Error fetching documents for activityId {}: {}", actId, e.getMessage(), e);
            throw e;
        }
    }

    public void deleteDocument(Long id) {
        try {
            Documents doc = getDocumentById(id);
            File file = new File(doc.getDocPath());

            if (file.exists()) {
                if (file.delete()) {
                    logger.info("File deleted successfully from disk: {}", doc.getDocPath());
                } else {
                    logger.warn("Failed to delete file from disk: {}", doc.getDocPath());
                }
            } else {
                logger.warn("File not found on disk for deletion: {}", doc.getDocPath());
            }

            documentsRepository.deleteById(id);
            logger.info("Document deleted successfully with id: {}", doc.getDocId());

        } catch (RuntimeException e) {
            logger.error("Error deleting document with id {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }
}

