

package com.misboi.jwtlogin.service;

import com.misboi.jwtlogin.model.ActivityMaster;
import com.misboi.jwtlogin.model.ActivityPerformance;
import com.misboi.jwtlogin.model.SubActivity;
import com.misboi.jwtlogin.model.SubActivityStatus;
import com.misboi.jwtlogin.repository.ActivityMasterRepository;
import com.misboi.jwtlogin.repository.ActivityPerformanceRepository;
import com.misboi.jwtlogin.repository.SubActivityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubActivityService {

    private final SubActivityRepository subActivityRepository;
    private final ActivityMasterRepository activityMasterRepository;
    private final ActivityPerformanceRepository performanceRepo;

    // 🔹 Get all subactivities
    public List<SubActivity> getAllSubActivities() {
        return subActivityRepository.findAll();
    }

    // 🔹 Get all subactivities under a specific activity
    public List<SubActivity> getSubActivitiesByActivity(Long actId) {
        return subActivityRepository.findByActivity_ActId(actId);
    }

    // 🔹 Get a single subactivity by ID
    public Optional<SubActivity> getSubActivityById(Long id) {
        return subActivityRepository.findById(id);
    }

    // 🔹 Create a new subactivity
    public SubActivity createSubActivity(SubActivity subActivity) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            log.info("Creating SubActivity '{}' by user '{}'", subActivity.getSubActName(), username);

            subActivity.setCreatedBy(username);
            subActivity.setCreatedAt(ZonedDateTime.now());

            // ✅ Handle startDate & endDate defaults
            if (subActivity.getStartDate() == null) {
                subActivity.setStartDate(ZonedDateTime.now());
            }
            if (subActivity.getEndDate() == null) {
                subActivity.setEndDate(subActivity.getStartDate().plusDays(7));
            }

            // ✅ Validation: endDate must be after startDate
            if (subActivity.getEndDate().isBefore(subActivity.getStartDate())) {
                throw new IllegalArgumentException("❌ End date cannot be before start date");
            }

            Long actId = subActivity.getActivity().getActId();
            ActivityMaster activity = activityMasterRepository.findById(actId)
                    .orElseThrow(() -> new RuntimeException("Activity not found with id " + actId));
            subActivity.setActivity(activity);

            SubActivity saved = subActivityRepository.save(subActivity);
            log.info("✅ SubActivity '{}' created successfully with id {} under Activity {}",
                    saved.getSubActName(), saved.getSubActId(), activity.getActId());

            updatePerformance(activity);

            return saved;
        } catch (Exception e) {
            log.error("❌ Failed to create SubActivity '{}'. Error: {}", subActivity.getSubActName(), e.getMessage(), e);
            throw e;
        }
    }

    // 🔹 Update an existing subactivity
    public SubActivity updateSubActivity(Long id, SubActivity updatedSubActivity) {
        return subActivityRepository.findById(id).map(existing -> {
            existing.setSubActName(updatedSubActivity.getSubActName());
            existing.setSubActDesc(updatedSubActivity.getSubActDesc());
            existing.setStatus(updatedSubActivity.getStatus());

            // ✅ Update startDate & endDate
            existing.setStartDate(updatedSubActivity.getStartDate());
            existing.setEndDate(updatedSubActivity.getEndDate());

            // ✅ Validation: endDate must be after startDate
            if (existing.getEndDate() != null && existing.getStartDate() != null &&
                    existing.getEndDate().isBefore(existing.getStartDate())) {
                throw new IllegalArgumentException("❌ End date cannot be before start date");
            }

            Long actId = updatedSubActivity.getActivity().getActId();
            ActivityMaster activity = activityMasterRepository.findById(actId)
                    .orElseThrow(() -> new RuntimeException("Activity not found with id " + actId));
            existing.setActivity(activity);

            SubActivity saved = subActivityRepository.save(existing);

            updatePerformance(activity);

            return saved;
        }).orElseThrow(() -> new RuntimeException("SubActivity not found with id " + id));
    }


    // 🔹 Delete subactivity
    public void deleteSubActivity(Long id) {
        subActivityRepository.findById(id).ifPresent(subActivity -> {
            ActivityMaster activity = subActivity.getActivity();
            subActivityRepository.deleteById(id);

            // Update performance metrics after deletion
            updatePerformance(activity);
        });
    }

    // 🔹 Performance calculation (moved here from listener)
    private void updatePerformance(ActivityMaster activity) {
        List<SubActivity> subActivities = subActivityRepository.findByActivity_ActId(activity.getActId());

        int total = subActivities.size();
        int completed = (int) subActivities.stream()
                .filter(sa -> sa.getStatus() == SubActivityStatus.COMPLETED)
                .count();

        double percentage = total == 0 ? 0 : ((double) completed / total) * 100;

        // ✅ Round percentage to 2 decimal places
        double roundedPercentage = BigDecimal.valueOf(percentage)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();

        ActivityPerformance perf = performanceRepo.findByActivity(activity)
                .orElseGet(() -> {
                    ActivityPerformance p = new ActivityPerformance();
                    p.setActivity(activity);
                    return p;
                });

        perf.setTotalSubActivities(total);
        perf.setCompletedSubActivities(completed);
        perf.setWeightagePercentage(roundedPercentage);

        performanceRepo.save(perf);

        log.info("📊 Performance updated for Activity {} → total={}, completed={}, percentage={}",
                activity.getActId(), total, completed, percentage);
    }
}

