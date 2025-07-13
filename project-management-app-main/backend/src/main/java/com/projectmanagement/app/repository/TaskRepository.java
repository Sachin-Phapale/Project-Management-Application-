package com.projectmanagement.app.repository;

import com.projectmanagement.app.model.Project;
import com.projectmanagement.app.model.Task;
import com.projectmanagement.app.model.TaskStatus;
import com.projectmanagement.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProject(Project project);
    
    List<Task> findByAssignee(User assignee);
    
    List<Task> findByProjectAndStatus(Project project, TaskStatus status);
    
    List<Task> findByDueDateBefore(LocalDateTime date);
    
    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId")
    List<Task> findTasksByProjectId(Long projectId);
    
    @Query("SELECT t FROM Task t WHERE t.assignee.id = :userId")
    List<Task> findTasksByAssigneeId(Long userId);
}
