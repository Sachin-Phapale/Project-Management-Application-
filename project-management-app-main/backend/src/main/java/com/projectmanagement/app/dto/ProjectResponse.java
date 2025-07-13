package com.projectmanagement.app.dto;

import com.projectmanagement.app.model.ProjectStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProjectResponse {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime dueDate;
    private ProjectStatus status;
    private UserSummaryDto owner;
    private List<UserSummaryDto> members;
    private int totalTasks;
    private int completedTasks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
