package com.misboi.jwtlogin.service;

import com.misboi.jwtlogin.model.ProjectMaster;
import com.misboi.jwtlogin.repository.ProjectMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProjectMasterService {

    @Autowired
    private ProjectMasterRepository projectMasterRepository;

    public List<ProjectMaster> getAllProjects() {
        return projectMasterRepository.findAll();
    }

    public Optional<ProjectMaster> getProjectById(Long id) {
        return projectMasterRepository.findById(id);
    }

    public ProjectMaster createProject(ProjectMaster project) {
        // Get current username from SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String createdBy = authentication.getName(); // this is the username from the token

        project.setCreatedBy(createdBy);
        project.setCreatedAt(ZonedDateTime.now());

        return projectMasterRepository.save(project);
    }

    public ProjectMaster updateProject(Long id, ProjectMaster updatedProject) {
        return projectMasterRepository.findById(id)
                .map(existing -> {
                    existing.setProjName(updatedProject.getProjName());
                    existing.setProjDesc(updatedProject.getProjDesc());
                    existing.setProjCode(updatedProject.getProjCode()); // ✅ update projCode
                    existing.setStatus(updatedProject.getStatus());     // ✅ update status
                    existing.setStartDate(updatedProject.getStartDate());
                    existing.setEndDate(updatedProject.getEndDate());
                    return projectMasterRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Project not found with id " + id));
    }

    public void deleteProject(Long id) {
        projectMasterRepository.deleteById(id);
    }
}
