package com.misboi.jwtlogin.controller;

import com.misboi.jwtlogin.model.SubActivity;
import com.misboi.jwtlogin.service.SubActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/subactivities")
public class SubActivityController {

    private final SubActivityService subActivityService;

    public SubActivityController(SubActivityService subActivityService) {
        this.subActivityService = subActivityService;
    }

    // Get all subactivities
    @GetMapping
    public List<SubActivity> getAllSubActivities() {
        return subActivityService.getAllSubActivities();
    }

    // Get subactivities by activity id
    @GetMapping("/activity/{actId}")
    public List<SubActivity> getSubActivitiesByActivity(@PathVariable Long actId) {
        return subActivityService.getSubActivitiesByActivity(actId);
    }

    // Get subactivity by id
    @GetMapping("/{id}")
    public ResponseEntity<SubActivity> getSubActivityById(@PathVariable Long id) {
        return subActivityService.getSubActivityById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create new subactivity
    @PostMapping
    public SubActivity createSubActivity(@RequestBody SubActivity subActivity) {
        return subActivityService.createSubActivity(subActivity);
    }

    // Update subactivity
    @PutMapping("/{id}")
    public ResponseEntity<SubActivity> updateSubActivity(@PathVariable Long id, @RequestBody SubActivity subActivity) {
        return ResponseEntity.ok(subActivityService.updateSubActivity(id, subActivity));
    }

    // Delete subactivity
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubActivity(@PathVariable Long id) {
        subActivityService.deleteSubActivity(id);
        return ResponseEntity.noContent().build();
    }
}
