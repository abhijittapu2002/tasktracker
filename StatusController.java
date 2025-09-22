package com.misboi.jwtlogin.controller;

import com.misboi.jwtlogin.model.Status;
import com.misboi.jwtlogin.service.StatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/status")
public class StatusController {

    @Autowired
    private StatusService statusService;

    @GetMapping
    public List<Status> getAllStatuses() {
        return statusService.getAllStatuses();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Status> getStatusById(@PathVariable Long id) {
        return statusService.getStatusById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Status createStatus(@RequestBody Status status) {
        return statusService.createStatus(status);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Status> updateStatus(@PathVariable Long id, @RequestBody Status status) {
        try {
            Status updated = statusService.updateStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStatus(@PathVariable Long id) {
        statusService.deleteStatus(id);
        return ResponseEntity.noContent().build();
    }
}
