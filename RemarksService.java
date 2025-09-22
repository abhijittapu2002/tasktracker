package com.misboi.jwtlogin.service;

import com.misboi.jwtlogin.dto.RemarksRequestDTO;
import com.misboi.jwtlogin.model.ActivityMaster;
import com.misboi.jwtlogin.model.Documents;
import com.misboi.jwtlogin.model.Remarks;
import com.misboi.jwtlogin.model.User;
import com.misboi.jwtlogin.repository.ActivityMasterRepository;
import com.misboi.jwtlogin.repository.RemarksRepository;
import com.misboi.jwtlogin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class RemarksService {

    @Autowired
    private RemarksRepository remarksRepository;

    @Autowired
    private ActivityMasterRepository activityMasterRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Remarks> getAllRemarks() {
        return remarksRepository.findAll();
    }

    public Optional<Remarks> getRemarkById(Long id) {
        return remarksRepository.findById(id);
    }

    public Remarks createRemark(RemarksRequestDTO dto) {
        ActivityMaster activity = activityMasterRepository.findById(dto.getActivityId())
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String createdBy = auth.getName(); // assumes username is the principal

        Remarks remarks = new Remarks();
        remarks.setRemarks(dto.getRemarks());
        remarks.setActivity(activity);
        remarks.setUser(user);
        remarks.setCreatedBy(createdBy);
        remarks.setCreatedAt(ZonedDateTime.now());

        return remarksRepository.save(remarks);
    }

    public void deleteRemark(Long id) {
        remarksRepository.deleteById(id);
    }

    public Remarks updateRemark(Long id, RemarksRequestDTO dto) {
        return remarksRepository.findById(id).map(existing -> {
            ActivityMaster activity = activityMasterRepository.findById(dto.getActivityId())
                    .orElseThrow(() -> new RuntimeException("Activity not found"));

            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            existing.setRemarks(dto.getRemarks());
            existing.setActivity(activity);
            existing.setUser(user);
            return remarksRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Remark not found with id " + id));
    }

    public List<Remarks> getRemarksByActivityId(Long actId) {
        ActivityMaster activity = activityMasterRepository.findById(actId)
                .orElseThrow(() -> new RuntimeException("Activity not found with id " + actId));
        return remarksRepository.findByActivity(activity);
    }

}
