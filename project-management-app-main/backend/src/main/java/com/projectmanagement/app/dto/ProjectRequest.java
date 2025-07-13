package com.projectmanagement.app.dto;

import com.projectmanagement.app.model.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class ProjectRequest {
    @NotBlank
    private String name;
    
    private String description;
    
    @NotNull
    private LocalDateTime startDate;
    
    private LocalDateTime dueDate;
    
    private ProjectStatus status;
    
    private Set<Long> memberIds;
}
