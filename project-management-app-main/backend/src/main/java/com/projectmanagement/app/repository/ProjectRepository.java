package com.projectmanagement.app.repository;

import com.projectmanagement.app.model.Project;
import com.projectmanagement.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByOwner(User owner);
    
    @Query("SELECT p FROM Project p JOIN p.members m WHERE m.id = :userId")
    List<Project> findProjectsByMemberId(Long userId);
    
    @Query("SELECT p FROM Project p WHERE p.owner.id = :userId OR p.id IN " +
           "(SELECT p2.id FROM Project p2 JOIN p2.members m WHERE m.id = :userId)")
    List<Project> findAllProjectsByUserId(Long userId);
}
