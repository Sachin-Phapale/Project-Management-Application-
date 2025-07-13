package com.projectmanagement.app.controller;

import com.projectmanagement.app.dto.MessageResponse;
import com.projectmanagement.app.dto.ProjectRequest;
import com.projectmanagement.app.dto.ProjectResponse;
import com.projectmanagement.app.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    @Autowired
    private ProjectService projectService;

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('MEMBER') or hasRole('ADMIN')")
    public ResponseEntity<List<ProjectResponse>> getAllProjects() {
        List<ProjectResponse> projects = projectService.getAllProjects();
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('USER') or hasRole('MEMBER') or hasRole('ADMIN')")
    public ResponseEntity<List<ProjectResponse>> getUserProjects() {
        List<ProjectResponse> projects = projectService.getCurrentUserProjects();
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('MEMBER') or hasRole('ADMIN')")
    public ResponseEntity<ProjectResponse> getProjectById(@PathVariable Long id) {
        ProjectResponse project = projectService.getProjectById(id);
        return ResponseEntity.ok(project);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ProjectResponse> createProject(@Valid @RequestBody ProjectRequest projectRequest) {
        ProjectResponse createdProject = projectService.createProject(projectRequest);
        return ResponseEntity.ok(createdProject);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ProjectResponse> updateProject(@PathVariable Long id, @Valid @RequestBody ProjectRequest projectRequest) {
        ProjectResponse updatedProject = projectService.updateProject(id, projectRequest);
        return ResponseEntity.ok(updatedProject);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok(new MessageResponse("Project deleted successfully"));
    }

    @PostMapping("/{projectId}/members/{userId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ProjectResponse> addMemberToProject(@PathVariable Long projectId, @PathVariable Long userId) {
        ProjectResponse project = projectService.addMemberToProject(projectId, userId);
        return ResponseEntity.ok(project);
    }

    @DeleteMapping("/{projectId}/members/{userId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ProjectResponse> removeMemberFromProject(@PathVariable Long projectId, @PathVariable Long userId) {
        ProjectResponse project = projectService.removeMemberFromProject(projectId, userId);
        return ResponseEntity.ok(project);
    }
}
