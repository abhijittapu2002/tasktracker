package com.misboi.jwtlogin.controller;

import com.misboi.jwtlogin.dto.RemarksRequestDTO;
import com.misboi.jwtlogin.model.Remarks;
import com.misboi.jwtlogin.service.RemarksService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/remarks")
public class RemarksController {

    @Autowired
    private RemarksService remarksService;

    @GetMapping
    public ResponseEntity<List<Remarks>> getAllRemarks() {
        return ResponseEntity.ok(remarksService.getAllRemarks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Remarks> getRemarkById(@PathVariable Long id) {
        return remarksService.getRemarkById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createRemark(@RequestBody RemarksRequestDTO dto) {
        try {
            return ResponseEntity.ok(remarksService.createRemark(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRemark(@PathVariable Long id, @RequestBody RemarksRequestDTO dto) {
        try {
            return ResponseEntity.ok(remarksService.updateRemark(id, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRemark(@PathVariable Long id) {
        remarksService.deleteRemark(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/activity/{actId}")
    public ResponseEntity<?> getRemarksByActivity(@PathVariable Long actId) {
        try {
            return ResponseEntity.ok(remarksService.getRemarksByActivityId(actId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

}
