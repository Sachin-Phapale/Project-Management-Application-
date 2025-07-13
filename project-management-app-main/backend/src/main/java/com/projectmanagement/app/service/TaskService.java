package com.projectmanagement.app.service;

import com.projectmanagement.app.dto.TaskRequest;
import com.projectmanagement.app.dto.TaskResponse;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {
    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    public List<TaskResponse> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::convertToTaskResponse)
                .collect(Collectors.toList());
    }

    public List<TaskResponse> getTasksByProject(Long projectId) {
        List<Task> tasks = taskRepository.findTasksByProjectId(projectId);
        return tasks.stream()
                .map(this::convertToTaskResponse)
                .collect(Collectors.toList());
    }

    public List<TaskResponse> getTasksAssignedToCurrentUser() {
        User currentUser = userService.getAuthenticatedUser();
        List<Task> tasks = taskRepository.findTasksByAssigneeId(currentUser.getId());
        return tasks.stream()
                .map(this::convertToTaskResponse)
                .collect(Collectors.toList());
    }

    public TaskResponse getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        return convertToTaskResponse(task);
    }

    @Transactional
    public TaskResponse createTask(TaskRequest taskRequest) {
        Project project = projectRepository.findById(taskRequest.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + taskRequest.getProjectId()));

        // Check if user has access to the project
        User currentUser = userService.getAuthenticatedUser();
        boolean hasAccess = project.getOwner().getId().equals(currentUser.getId()) || 
                           project.getMembers().stream().anyMatch(member -> member.getId().equals(currentUser.getId()));
        
        if (!hasAccess) {
            throw new RuntimeException("You don't have access to this project");
        }

        Task task = new Task();
        task.setTitle(taskRequest.getTitle());
        task.setDescription(taskRequest.getDescription());
        task.setPriority(taskRequest.getPriority());
        task.setDueDate(taskRequest.getDueDate());
        task.setProject(project);
        
        if (taskRequest.getStatus() != null) {
            task.setStatus(taskRequest.getStatus());
        }
        
        if (taskRequest.getProgressPercentage() != null) {
            task.setProgressPercentage(taskRequest.getProgressPercentage());
        }
        
        if (taskRequest.getAssigneeId() != null) {
            User assignee = userRepository.findById(taskRequest.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + taskRequest.getAssigneeId()));
            task.setAssignee(assignee);
        }

        Task savedTask = taskRepository.save(task);
        return convertToTaskResponse(savedTask);
    }

    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest taskRequest) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        // Check if user has access to the project
        User currentUser = userService.getAuthenticatedUser();
        Project project = task.getProject();
        boolean hasAccess = project.getOwner().getId().equals(currentUser.getId()) || 
                           project.getMembers().stream().anyMatch(member -> member.getId().equals(currentUser.getId()));
        
        if (!hasAccess) {
            throw new RuntimeException("You don't have access to this task");
        }

        task.setTitle(taskRequest.getTitle());
        task.setDescription(taskRequest.getDescription());
        task.setPriority(taskRequest.getPriority());
        task.setDueDate(taskRequest.getDueDate());
        
        if (taskRequest.getStatus() != null) {
            task.setStatus(taskRequest.getStatus());
        }
        
        if (taskRequest.getProgressPercentage() != null) {
            task.setProgressPercentage(taskRequest.getProgressPercentage());
        }
        
        // If project is being changed
        if (!task.getProject().getId().equals(taskRequest.getProjectId())) {
            Project newProject = projectRepository.findById(taskRequest.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found with id: " + taskRequest.getProjectId()));
            task.setProject(newProject);
        }
        
        // If assignee is being changed
        if (taskRequest.getAssigneeId() != null) {
            if (task.getAssignee() == null || !task.getAssignee().getId().equals(taskRequest.getAssigneeId())) {
                User assignee = userRepository.findById(taskRequest.getAssigneeId())
                        .orElseThrow(() -> new RuntimeException("User not found with id: " + taskRequest.getAssigneeId()));
                task.setAssignee(assignee);
            }
        } else {
            task.setAssignee(null);
        }

        Task updatedTask = taskRepository.save(task);
        return convertToTaskResponse(updatedTask);
    }

    @Transactional
    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        // Check if user has access to the project
        User currentUser = userService.getAuthenticatedUser();
        Project project = task.getProject();
        boolean hasAccess = project.getOwner().getId().equals(currentUser.getId()) || 
                           project.getMembers().stream().anyMatch(member -> member.getId().equals(currentUser.getId()));
        
        if (!hasAccess) {
            throw new RuntimeException("You don't have access to this task");
        }

        taskRepository.delete(task);
    }

    @Transactional
    public TaskResponse updateTaskStatus(Long id, String status) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        // Check if user has access to the project
        User currentUser = userService.getAuthenticatedUser();
        Project project = task.getProject();
        boolean hasAccess = project.getOwner().getId().equals(currentUser.getId()) || 
                           project.getMembers().stream().anyMatch(member -> member.getId().equals(currentUser.getId()));
        
        if (!hasAccess) {
            throw new RuntimeException("You don't have access to this task");
        }

        try {
            TaskStatus taskStatus = TaskStatus.valueOf(status.toUpperCase());
            task.setStatus(taskStatus);
            
            // If task is marked as DONE, set progress to 100%
            if (taskStatus == TaskStatus.DONE) {
                task.setProgressPercentage(100);
            }
            
            Task updatedTask = taskRepository.save(task);
            return convertToTaskResponse(updatedTask);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid task status: " + status);
        }
    }

    @Transactional
    public TaskResponse updateTaskProgress(Long id, Integer progress) {
        if (progress < 0 || progress > 100) {
            throw new RuntimeException("Progress percentage must be between 0 and 100");
        }

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        // Check if user has access to the project
        User currentUser = userService.getAuthenticatedUser();
        Project project = task.getProject();
        boolean hasAccess = project.getOwner().getId().equals(currentUser.getId()) || 
                           project.getMembers().stream().anyMatch(member -> member.getId().equals(currentUser.getId()));
        
        if (!hasAccess) {
            throw new RuntimeException("You don't have access to this task");
        }

        task.setProgressPercentage(progress);
        
        // Update status based on progress
        if (progress == 0) {
            task.setStatus(TaskStatus.TODO);
        } else if (progress == 100) {
            task.setStatus(TaskStatus.DONE);
        } else if (task.getStatus() == TaskStatus.TODO || task.getStatus() == TaskStatus.DONE) {
            task.setStatus(TaskStatus.IN_PROGRESS);
        }

        Task updatedTask = taskRepository.save(task);
        return convertToTaskResponse(updatedTask);
    }

    @Transactional
    public TaskResponse assignTask(Long id, Long userId) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        // Check if user has access to the project
        User currentUser = userService.getAuthenticatedUser();
        Project project = task.getProject();
        boolean hasAccess = project.getOwner().getId().equals(currentUser.getId()) || 
                           project.getMembers().stream().anyMatch(member -> member.getId().equals(currentUser.getId()));
        
        if (!hasAccess) {
            throw new RuntimeException("You don't have access to this task");
        }

        User assignee = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        task.setAssignee(assignee);
        Task updatedTask = taskRepository.save(task);
        return convertToTaskResponse(updatedTask);
    }

    private TaskResponse convertToTaskResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setStatus(task.getStatus());
        response.setPriority(task.getPriority());
        response.setDueDate(task.getDueDate());
        response.setProjectId(task.getProject().getId());
        response.setProjectName(task.getProject().getName());
        response.setCreatedAt(task.getCreatedAt());
        response.setUpdatedAt(task.getUpdatedAt());
        response.setProgressPercentage(task.getProgressPercentage());
        
        // Check if task is overdue
        if (task.getDueDate() != null && task.getDueDate().isBefore(LocalDateTime.now()) && 
            task.getStatus() != TaskStatus.DONE) {
            response.setOverdue(true);
        } else {
            response.setOverdue(false);
        }
        
        // Set assignee if exists
        if (task.getAssignee() != null) {
            response.setAssignee(userService.convertToUserSummaryDto(task.getAssignee()));
        }
        
        return response;
    }
}
