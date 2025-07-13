package com.projectmanagement.app.dto;

import com.projectmanagement.app.model.TaskStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TaskRequest {
    @NotBlank
    private String title;
    
    private String description;
    
    private TaskStatus status;
    
    @NotNull
    @Min(1)
    @Max(5)
    private Integer priority;
    
    private LocalDateTime dueDate;
    
    @NotNull
    private Long projectId;
    
    private Long assigneeId;
    
    private Integer progressPercentage;
}
