package com.misboi.jwtlogin.serviceImplementation;

import com.misboi.jwtlogin.model.ActivityMaster;
import com.misboi.jwtlogin.repository.ActivityMasterRepository;
import com.misboi.jwtlogin.service.ActivityMasterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.List;

@Service
public class ActivityMasterServiceImp implements ActivityMasterService {
    @Autowired
    private ActivityMasterRepository activityMasterRepository;

    @Override
    public ActivityMaster saveActivityMaster(ActivityMaster activityMaster) {
        // Check if actId already exists
        if (activityMaster.getActId() != null &&
                activityMasterRepository.findById(activityMaster.getActId()).isPresent()) {
            throw new RuntimeException("Activity ID already exists.");
        }
        // Get current username from SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String createdBy = authentication.getName(); // this is the username from the token
        activityMaster.setCreatedBy(createdBy);
        activityMaster.setCreatedAt(ZonedDateTime.now());
        return activityMasterRepository.save(activityMaster);
    }

    @Override
    public List<ActivityMaster> getAllActivityMasters() {
        return activityMasterRepository.findAll();
    }

    @Override
    public ActivityMaster getActivityMasterById(Long actId) {
        return activityMasterRepository.findById(actId)
                .orElseThrow(() -> new RuntimeException("Activity Master not found with ID: " + actId));
    }

    @Override
    public ActivityMaster updateActivityMaster(Long actId, ActivityMaster activityMaster) {
        ActivityMaster existing = getActivityMasterById(actId);
        existing.setActName(activityMaster.getActName());
        existing.setActDesc(activityMaster.getActDesc());
        existing.setStatus(activityMaster.getStatus());
        //existing.setCreatedBy(activityMaster.getCreatedBy());
        //existing.setCreatedAt(activityMaster.getCreatedAt());
        existing.setProject(activityMaster.getProject());
        return activityMasterRepository.save(existing);
    }

    @Override
    public void deleteActivityMaster(Long actId) {
        activityMasterRepository.deleteById(actId);
    }
}
