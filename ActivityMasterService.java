package com.misboi.jwtlogin.service;

import com.misboi.jwtlogin.model.ActivityMaster;

import java.util.List;

public interface ActivityMasterService {
    ActivityMaster saveActivityMaster(ActivityMaster activityMaster);
    List<ActivityMaster> getAllActivityMasters();
    ActivityMaster getActivityMasterById(Long actId);
    ActivityMaster updateActivityMaster(Long actId, ActivityMaster activityMaster);
    void deleteActivityMaster(Long actId);
}




