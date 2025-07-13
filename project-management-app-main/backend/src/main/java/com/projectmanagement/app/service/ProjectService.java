package com.projectmanagement.app.service;

import com.projectmanagement.app.dto.ProjectRequest;
import com.projectmanagement.app.dto.ProjectResponse;
import com.projectmanagement.app.dto.UserSummaryDto;
import com.projectmanagement.app.model.Project;
import com.projectmanagement.app.model.Task;
import com.projectmanagement.app.model.TaskStatus;
import com.projectmanagement.app.model.User;
import com.projectmanagement.app.repository.ProjectRepository;
import com.projectmanagement.app.repository.TaskRepository;
import com.projectmanagement.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProjectService {
    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserService userService;

    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::convertToProjectResponse)
                .collect(Collectors.toList());
    }

    public List<ProjectResponse> getCurrentUserProjects() {
        User currentUser = userService.getAuthenticatedUser();
        return projectRepository.findAllProjectsByUserId(currentUser.getId()).stream()
                .map(this::convertToProjectResponse)
                .collect(Collectors.toList());
    }

    public ProjectResponse getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
        return convertToProjectResponse(project);
    }

    @Transactional
    public ProjectResponse createProject(ProjectRequest projectRequest) {
        User currentUser = userService.getAuthenticatedUser();
        
        Project project = new Project();
        project.setName(projectRequest.getName());
        project.setDescription(projectRequest.getDescription());
        project.setStartDate(projectRequest.getStartDate());
        project.setDueDate(projectRequest.getDueDate());
        project.setStatus(projectRequest.getStatus());
        project.setOwner(currentUser);
        
        // Add members if specified
        if (projectRequest.getMemberIds() != null && !projectRequest.getMemberIds().isEmpty()) {
            Set<User> members = new HashSet<>();
            for (Long memberId : projectRequest.getMemberIds()) {
                User member = userRepository.findById(memberId)
                        .orElseThrow(() -> new RuntimeException("User not found with id: " + memberId));
                members.add(member);
            }
            project.setMembers(members);
        }
        
        Project savedProject = projectRepository.save(project);
        return convertToProjectResponse(savedProject);
    }

    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest projectRequest) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
        
        // Check if the current user is the owner
        User currentUser = userService.getAuthenticatedUser();
        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Only the project owner can update the project");
        }
        
        project.setName(projectRequest.getName());
        project.setDescription(projectRequest.getDescription());
        project.setStartDate(projectRequest.getStartDate());
        project.setDueDate(projectRequest.getDueDate());
        
        if (projectRequest.getStatus() != null) {
            project.setStatus(projectRequest.getStatus());
        }
        
        // Update members if specified
        if (projectRequest.getMemberIds() != null) {
            Set<User> members = new HashSet<>();
            for (Long memberId : projectRequest.getMemberIds()) {
                User member = userRepository.findById(memberId)
                        .orElseThrow(() -> new RuntimeException("User not found with id: " + memberId));
                members.add(member);
            }
            project.setMembers(members);
        }
        
        Project updatedProject = projectRepository.save(project);
        return convertToProjectResponse(updatedProject);
    }

    @Transactional
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
        
        // Check if the current user is the owner
        User currentUser = userService.getAuthenticatedUser();
        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Only the project owner can delete the project");
        }
        
        projectRepository.delete(project);
    }

    @Transactional
    public ProjectResponse addMemberToProject(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
        
        // Check if the current user is the owner
        User currentUser = userService.getAuthenticatedUser();
        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Only the project owner can add members to the project");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        project.getMembers().add(user);
        Project updatedProject = projectRepository.save(project);
        
        return convertToProjectResponse(updatedProject);
    }

    @Transactional
    public ProjectResponse removeMemberFromProject(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
        
        // Check if the current user is the owner
        User currentUser = userService.getAuthenticatedUser();
        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Only the project owner can remove members from the project");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        project.getMembers().remove(user);
        Project updatedProject = projectRepository.save(project);
        
        return convertToProjectResponse(updatedProject);
    }

    private ProjectResponse convertToProjectResponse(Project project) {
        ProjectResponse response = new ProjectResponse();
        response.setId(project.getId());
        response.setName(project.getName());
        response.setDescription(project.getDescription());
        response.setStartDate(project.getStartDate());
        response.setDueDate(project.getDueDate());
        response.setStatus(project.getStatus());
        response.setCreatedAt(project.getCreatedAt());
        response.setUpdatedAt(project.getUpdatedAt());
        
        // Set owner
        response.setOwner(userService.convertToUserSummaryDto(project.getOwner()));
        
        // Set members
        List<UserSummaryDto> memberDtos = project.getMembers().stream()
                .map(userService::convertToUserSummaryDto)
                .collect(Collectors.toList());
        response.setMembers(memberDtos);
        
        // Set task statistics
        List<Task> tasks = taskRepository.findTasksByProjectId(project.getId());
        response.setTotalTasks(tasks.size());
        
        long completedTasks = tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.DONE)
                .count();
        response.setCompletedTasks((int) completedTasks);
        
        return response;
    }
}
