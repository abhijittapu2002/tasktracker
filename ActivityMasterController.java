package com.misboi.jwtlogin.controller;

import com.misboi.jwtlogin.model.ActivityMaster;
import com.misboi.jwtlogin.service.ActivityMasterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/activitymaster")
public class ActivityMasterController {
    @Autowired
    private ActivityMasterService activityMasterService;

    @PostMapping
    public ActivityMaster create(@RequestBody ActivityMaster activityMaster) {
        return activityMasterService.saveActivityMaster(activityMaster);
    }

    @GetMapping
    public List<ActivityMaster> getAll() {
        return activityMasterService.getAllActivityMasters();
    }

    @GetMapping("/{actId}")
    public ActivityMaster getById(@PathVariable Long actId) {
        return activityMasterService.getActivityMasterById(actId);
    }

    @PutMapping("/{actId}")
    public ActivityMaster update(@PathVariable Long actId, @RequestBody ActivityMaster activityMaster) {
        return activityMasterService.updateActivityMaster(actId, activityMaster);
    }

    @DeleteMapping("/{actId}")
    public void delete(@PathVariable Long actId) {
        activityMasterService.deleteActivityMaster(actId);
    }

}

