package com.projectmanagement.app.controller;

import com.projectmanagement.app.dto.MessageResponse;
import com.projectmanagement.app.dto.TaskRequest;
import com.projectmanagement.app.dto.TaskResponse;
import com.projectmanagement.app.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    @Autowired
    private TaskService taskService;

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('MEMBER') or hasRole('ADMIN')")
    public ResponseEntity<List<TaskResponse>> getAllTasks() {
        List<TaskResponse> tasks = taskService.getAllTasks();
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasRole('USER') or hasRole('MEMBER') or hasRole('ADMIN')")
    public ResponseEntity<List<TaskResponse>> getTasksByProject(@PathVariable Long projectId) {
        List<TaskResponse> tasks = taskService.getTasksByProject(projectId);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasRole('USER') or hasRole('MEMBER') or hasRole('ADMIN')")
    public ResponseEntity<List<TaskResponse>> getAssignedTasks() {
        List<TaskResponse> tasks = taskService.getTasksAssignedToCurrentUser();
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('MEMBER') or hasRole('ADMIN')")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable Long id) {
        TaskResponse task = taskService.getTaskById(id);
        return ResponseEntity.ok(task);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('MEMBER') or hasRole('ADMIN')")
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest taskRequest) {
        TaskResponse createdTask = taskService.createTask(taskRequest);
        return ResponseEntity.ok(createdTask);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('MEMBER') or hasRole('ADMIN')")
    public ResponseEntity<TaskResponse> updateTask(@PathVariable Long id, @Valid @RequestBody TaskRequest taskRequest) {
        TaskResponse updatedTask = taskService.updateTask(id, taskRequest);
        return ResponseEntity.ok(updatedTask);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('MEMBER') or hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok(new MessageResponse("Task deleted successfully"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('USER') or hasRole('MEMBER') or hasRole('ADMIN')")
    public ResponseEntity<TaskResponse> updateTaskStatus(@PathVariable Long id, @RequestParam String status) {
        TaskResponse updatedTask = taskService.updateTaskStatus(id, status);
        return ResponseEntity.ok(updatedTask);
    }

    @PatchMapping("/{id}/progress")
    @PreAuthorize("hasRole('USER') or hasRole('MEMBER') or hasRole('ADMIN')")
    public ResponseEntity<TaskResponse> updateTaskProgress(@PathVariable Long id, @RequestParam Integer progress) {
        TaskResponse updatedTask = taskService.updateTaskProgress(id, progress);
        return ResponseEntity.ok(updatedTask);
    }

    @PatchMapping("/{id}/assign/{userId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<TaskResponse> assignTask(@PathVariable Long id, @PathVariable Long userId) {
        TaskResponse updatedTask = taskService.assignTask(id, userId);
        return ResponseEntity.ok(updatedTask);
    }
}
