package com.misboi.jwtlogin.service;

import com.misboi.jwtlogin.model.Status;
import com.misboi.jwtlogin.repository.StatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class StatusService {

    @Autowired
    private StatusRepository statusRepository;

    public List<Status> getAllStatuses() {
        return statusRepository.findAll();
    }

    public Optional<Status> getStatusById(Long id) {
        return statusRepository.findById(id);
    }

    public Status createStatus(Status status) {
        // Get current username from SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName(); // this is the username from the token
        status.setCreatedBy(username);
        status.setCreatedAt(ZonedDateTime.now());
        return statusRepository.save(status);
    }

    public Status updateStatus(Long id, Status updatedStatus) {
        return statusRepository.findById(id).map(status -> {
            status.setSttStatus(updatedStatus.getSttStatus());
            //status.setCreatedBy(updatedStatus.getCreatedBy());
            //status.setCreatedAt(updatedStatus.getCreatedAt());
            return statusRepository.save(status);
        }).orElseThrow(() -> new RuntimeException("Status not found with id " + id));
    }

    public void deleteStatus(Long id) {
        statusRepository.deleteById(id);
    }
}
