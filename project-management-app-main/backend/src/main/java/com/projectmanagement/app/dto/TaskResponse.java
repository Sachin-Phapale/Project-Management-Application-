package com.projectmanagement.app.dto;

import com.projectmanagement.app.model.TaskStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private int priority;
    private LocalDateTime dueDate;
    private Long projectId;
    private String projectName;
    private UserSummaryDto assignee;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer progressPercentage;
    private boolean isOverdue;
}
