package com.misboi.jwtlogin.controller;

import com.misboi.jwtlogin.model.ProjectMaster;
import com.misboi.jwtlogin.service.ProjectMasterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/projectmaster")
public class ProjectMasterController {

    @Autowired
    private ProjectMasterService projectService;

    @GetMapping("/list")
    public ResponseEntity<List<ProjectMaster>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectMaster> getProjectById(@PathVariable Long id) {
        return projectService.getProjectById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/create")
    public ResponseEntity<ProjectMaster> createProject(@RequestBody ProjectMaster project) {
        return ResponseEntity.ok(projectService.createProject(project));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectMaster> updateProject(@PathVariable Long id, @RequestBody ProjectMaster project) {
        return ResponseEntity.ok(projectService.updateProject(id, project));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Deleted successfully");
        return ResponseEntity.ok(response);
    }
}


