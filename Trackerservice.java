
package com.misboi.jwtlogin;

import com.misboi.jwtlogin.model.ActivityMaster;
import com.misboi.jwtlogin.model.Status;
import com.misboi.jwtlogin.model.User;
import com.misboi.jwtlogin.repository.ActivityMasterRepository;
import com.misboi.jwtlogin.repository.StatusRepository;
import com.misboi.jwtlogin.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class Trackerservice {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ActivityMasterRepository activityMasterRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StatusRepository statusRepository;

    public List<Entitylist> getAllEntitylists() {
        return taskRepository.findAll();
    }

    public Optional<Entitylist> getEntitylistById(Long id) {
        return taskRepository.findById(id);
    }

    public Entitylist createTask(TaskDto dto) {
        System.out.println("Creating task with actId = " + dto.getActId());
        ActivityMaster activity = activityMasterRepository.findById(dto.getActId())
                .orElseThrow(() -> new RuntimeException("Activity not found with ID: " + dto.getActId()));
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + dto.getUserId()));
        Status status = statusRepository.findById(dto.getStatusId())
                .orElseThrow(() -> new RuntimeException("Status not found with ID: " + dto.getStatusId()));

        Entitylist task = new Entitylist();
        task.setActivity(activity);
        task.setStarttime(dto.getStarttime());
        task.setEndtime(dto.getEndtime());
        task.setDueDate(dto.getDueDate()); // ✅ new field
        task.setPriority(dto.getPriority());
        task.setRemarks(dto.getRemarks());
        task.setImportant(dto.isImportant());
        task.setUrgent(dto.isUrgent());
        task.setStatus(status);
        task.setUser(user);
        task.setReportTo(dto.getReportTo());

        return taskRepository.save(task);
    }

    public Entitylist updateEntitylist(Long id, TaskDto dto) {
        return taskRepository.findById(id).map(task -> {
            ActivityMaster activity = activityMasterRepository.findById(dto.getActId())
                    .orElseThrow(() -> new RuntimeException("Activity not found with ID: " + dto.getActId()));

            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + dto.getUserId()));
            Status status = statusRepository.findById(dto.getStatusId())
                    .orElseThrow(() -> new RuntimeException("Status not found with ID: " + dto.getStatusId()));

            task.setActivity(activity);
            task.setStarttime(dto.getStarttime());
            task.setEndtime(dto.getEndtime());
            task.setDueDate(dto.getDueDate()); // ✅ new field
            task.setPriority(dto.getPriority());
            task.setRemarks(dto.getRemarks());
            task.setImportant(dto.isImportant());
            task.setUrgent(dto.isUrgent());
            task.setUser(user);
            task.setStatus(status);
            task.setReportTo(dto.getReportTo());

            return taskRepository.save(task);
        }).orElse(null);
    }

    public void deleteEntitylist(Long id) {
        taskRepository.deleteById(id);
    }

//    public boolean isUrgent(String endtime, LocalDate currentDate) {
//        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
//        LocalDate endTime = LocalDate.parse(endtime, formatter);
//        long daysDiff = ChronoUnit.DAYS.between(currentDate, endTime);
//        return daysDiff <= 7;
//    }

//    public List<Entitylist> getTasksByUrgencyAndImportance(boolean important, boolean urgent) {
//        LocalDate currentDate = LocalDate.now();
//        return taskRepository.findAll().stream()
//                .filter(task -> task.isImportant() == important && isUrgent(task.getEndtime(), currentDate) == urgent)
//                .collect(Collectors.toList());
//    }

    public boolean isUrgent(String endtime, LocalDate currentDate) {
        // Use LocalDateTime because your string includes hours and minutes
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");
        LocalDateTime endTime = LocalDateTime.parse(endtime, formatter);

        // Compare only the date part
        long daysDiff = ChronoUnit.DAYS.between(currentDate, endTime.toLocalDate());
        return daysDiff <= 7;
    }

    public List<Entitylist> getTasksByUrgencyAndImportanceForCurrentUser(boolean important, boolean urgent) {
        LocalDate currentDate = LocalDate.now();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        boolean isAdmin = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN") || role.equals("ROLE_MANAGER"));

        return taskRepository.findAll().stream()
                .filter(task -> task.isImportant() == important && isUrgent(task.getEndtime(), currentDate) == urgent)
                .filter(task -> isAdmin || task.getUser().getUsername().equals(username)) // only current user's tasks if not admin/manager
                .collect(Collectors.toList());
    }


    public List<Entitylist> getTasksForCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        boolean isAdmin = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN") || role.equals("ROLE_MANAGER"));

        if (isAdmin) {
            return taskRepository.findAll();
        } else {
            return taskRepository.findByUserUsername(username);
        }
    }
}
