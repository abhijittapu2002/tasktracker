package com.misboi.jwtlogin.controller;

import com.misboi.jwtlogin.model.ActivityMaster;
import com.misboi.jwtlogin.model.ActivityPerformance;
import com.misboi.jwtlogin.repository.ActivityMasterRepository;
import com.misboi.jwtlogin.repository.ActivityPerformanceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/activities")
public class ActivityPerformanceController {

    private final ActivityMasterRepository activityRepo;
    private final ActivityPerformanceRepository performanceRepo;

    public ActivityPerformanceController(ActivityMasterRepository activityRepo,
                                         ActivityPerformanceRepository performanceRepo) {
        this.activityRepo = activityRepo;
        this.performanceRepo = performanceRepo;
    }

    // 🔹 Get performance details for an activity
    @GetMapping("/{id}/performance")
    public ResponseEntity<ActivityPerformance> getPerformance(@PathVariable Long id) {
        ActivityMaster activity = activityRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity not found with id " + id));

        ActivityPerformance performance = performanceRepo.findByActivity(activity)
                .orElse(null);

        return ResponseEntity.ok(performance);
    }
}
